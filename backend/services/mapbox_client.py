"""Shared Mapbox HTTP client with retry logic and response caching.

Centralises all outbound Mapbox API calls so that every router uses the
same timeout / retry / cache settings.
"""

from __future__ import annotations

import hashlib
import json
import os
import time
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv

load_dotenv()

MAPBOX_API_KEY: str = os.getenv("MAPBOX_API_KEY", "")
_BASE = "https://api.mapbox.com"
_TIMEOUT = httpx.Timeout(connect=5.0, read=15.0, write=5.0, pool=5.0)
_MAX_RETRIES = 2

# ---------------------------------------------------------------------------
# Simple in-memory TTL cache (avoids adding Redis as a dependency)
# ---------------------------------------------------------------------------
_cache: Dict[str, tuple[float, Any]] = {}
_CACHE_TTL_SECONDS = 120  # 2 minutes


def _cache_key(url: str, params: Dict[str, Any]) -> str:
    raw = url + json.dumps(params, sort_keys=True)
    return hashlib.sha256(raw.encode()).hexdigest()


def _get_cached(key: str) -> Optional[Any]:
    entry = _cache.get(key)
    if entry is None:
        return None
    ts, data = entry
    if time.time() - ts > _CACHE_TTL_SECONDS:
        _cache.pop(key, None)
        return None
    return data


def _set_cached(key: str, data: Any) -> None:
    # Evict oldest entries when cache grows too large
    if len(_cache) > 500:
        oldest_key = min(_cache, key=lambda k: _cache[k][0])
        _cache.pop(oldest_key, None)
    _cache[key] = (time.time(), data)


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

def get_api_key() -> str:
    """Return the Mapbox API key, raising if missing."""
    if not MAPBOX_API_KEY:
        raise ValueError("MAPBOX_API_KEY is not set in environment variables")
    return MAPBOX_API_KEY


async def mapbox_get(
    path: str,
    params: Optional[Dict[str, Any]] = None,
    *,
    use_cache: bool = True,
) -> Dict[str, Any]:
    """Issue a GET request to the Mapbox API with retry and optional caching.

    Parameters
    ----------
    path : str
        URL path appended to ``https://api.mapbox.com``.  Include any
        path-level parameters (coordinates, profile, etc.).
    params : dict, optional
        Query-string parameters.  ``access_token`` is injected automatically.
    use_cache : bool
        Whether to look up / store the response in the TTL cache.

    Returns
    -------
    dict
        Parsed JSON response body.

    Raises
    ------
    httpx.HTTPStatusError
        When the upstream response has a 4xx/5xx status after retries.
    ValueError
        When the API key is not configured.
    """
    api_key = get_api_key()
    params = dict(params or {})
    params["access_token"] = api_key

    url = f"{_BASE}{path}"

    if use_cache:
        ck = _cache_key(url, params)
        cached = _get_cached(ck)
        if cached is not None:
            return cached

    last_exc: Optional[Exception] = None
    for attempt in range(_MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                if use_cache:
                    _set_cached(ck, data)
                return data
        except (httpx.HTTPStatusError, httpx.ConnectError, httpx.ReadTimeout) as exc:
            last_exc = exc
            if attempt < _MAX_RETRIES:
                # Exponential back-off: 0.5s, 1.5s
                import asyncio
                await asyncio.sleep(0.5 * (attempt + 1))

    raise last_exc  # type: ignore[misc]


def clear_cache() -> int:
    """Flush the in-memory response cache.  Returns the number of evicted entries."""
    count = len(_cache)
    _cache.clear()
    return count
