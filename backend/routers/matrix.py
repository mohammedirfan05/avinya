"""Travel-time matrix service using the Mapbox Matrix API.

Features:
- Calculates duration + distance matrices between up to 25 coordinates
- Identifies congestion bottlenecks (slowest origin-destination pairs)
- Caches responses via the shared mapbox_client
- Supports driving-traffic profile for real-time awareness
- Provides optimization data for adaptive traffic-light timing
"""

from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.mapbox_client import get_api_key, mapbox_get

router = APIRouter(tags=["matrix"])


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------

class Coordinate(BaseModel):
    lon: float = Field(..., ge=-180, le=180)
    lat: float = Field(..., ge=-90, le=90)
    label: Optional[str] = None


class MatrixRequest(BaseModel):
    coordinates: List[Coordinate] = Field(..., min_length=2, max_length=25)
    profile: str = Field(
        "driving",
        description="Routing profile: driving, driving-traffic, walking, cycling",
    )


class BottleneckEntry(BaseModel):
    source_index: int
    destination_index: int
    source_label: Optional[str] = None
    destination_label: Optional[str] = None
    duration_seconds: float
    distance_meters: Optional[float] = None


class MatrixResponse(BaseModel):
    code: str
    durations: List[List[Optional[float]]]
    distances: Optional[List[List[Optional[float]]]] = None
    sources: List[dict]
    destinations: List[dict]
    bottlenecks: List[BottleneckEntry] = []
    profile: str
    coordinate_count: int


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _identify_bottlenecks(
    durations: List[List[Optional[float]]],
    labels: List[Optional[str]],
    top_n: int = 5,
) -> List[BottleneckEntry]:
    """Find the *top_n* slowest origin→destination pairs (excluding self)."""
    pairs: list[tuple[int, int, float]] = []
    for i, row in enumerate(durations):
        for j, val in enumerate(row):
            if i != j and val is not None:
                pairs.append((i, j, val))
    pairs.sort(key=lambda t: t[2], reverse=True)
    return [
        BottleneckEntry(
            source_index=i,
            destination_index=j,
            source_label=labels[i] if i < len(labels) else None,
            destination_label=labels[j] if j < len(labels) else None,
            duration_seconds=dur,
        )
        for i, j, dur in pairs[:top_n]
    ]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/matrix", response_model=MatrixResponse)
async def get_travel_matrix(body: MatrixRequest):
    """Calculate a travel-time (and distance) matrix between coordinates.

    Uses the Mapbox Matrix API.  For ``driving-traffic`` the maximum is
    10 coordinates; for other profiles the maximum is 25.
    """
    try:
        get_api_key()
    except ValueError:
        raise HTTPException(status_code=500, detail="Mapbox API key not configured")

    profile = body.profile
    coords = body.coordinates

    # Validate profile-specific limits
    if profile == "driving-traffic" and len(coords) > 10:
        raise HTTPException(
            status_code=400,
            detail="driving-traffic profile supports a maximum of 10 coordinates",
        )
    if len(coords) > 25:
        raise HTTPException(
            status_code=400,
            detail="Mapbox Matrix API supports a maximum of 25 coordinates",
        )

    points_str = ";".join(f"{c.lon},{c.lat}" for c in coords)
    path = f"/directions-matrix/v1/mapbox/{profile}/{points_str}"
    params = {"annotations": "duration,distance"}

    try:
        data = await mapbox_get(path, params, use_cache=True)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Mapbox Matrix API error: {exc}")

    if data.get("code") != "Ok":
        raise HTTPException(
            status_code=502,
            detail=f"Mapbox returned: {data.get('code')} – {data.get('message', '')}",
        )

    durations = data.get("durations", [])
    distances = data.get("distances")
    labels = [c.label for c in coords]
    bottlenecks = _identify_bottlenecks(durations, labels)

    return MatrixResponse(
        code=data["code"],
        durations=durations,
        distances=distances,
        sources=data.get("sources", []),
        destinations=data.get("destinations", []),
        bottlenecks=bottlenecks,
        profile=profile,
        coordinate_count=len(coords),
    )


@router.post("/matrix/optimize-signals")
async def optimize_signal_timing(body: MatrixRequest):
    """Analyse the travel-time matrix to suggest adaptive signal timing adjustments.

    This endpoint returns:
    - The raw matrix
    - Bottleneck pairs sorted by travel time
    - Suggested priority corridors (directions with highest average travel time)
    - Per-intersection congestion scores
    """
    try:
        get_api_key()
    except ValueError:
        raise HTTPException(status_code=500, detail="Mapbox API key not configured")

    coords = body.coordinates
    if len(coords) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 coordinates")

    points_str = ";".join(f"{c.lon},{c.lat}" for c in coords)
    path = f"/directions-matrix/v1/mapbox/{body.profile}/{points_str}"
    params = {"annotations": "duration,distance"}

    try:
        data = await mapbox_get(path, params, use_cache=True)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Mapbox error: {exc}")

    if data.get("code") != "Ok":
        raise HTTPException(status_code=502, detail=f"Mapbox: {data.get('message', '')}")

    durations = data.get("durations", [])
    labels = [c.label for c in coords]
    n = len(coords)

    # Per-intersection congestion score = avg outbound travel time
    congestion_scores = []
    for i in range(n):
        row = durations[i] if i < len(durations) else []
        valid = [v for j, v in enumerate(row) if j != i and v is not None]
        avg = sum(valid) / len(valid) if valid else 0
        congestion_scores.append({
            "index": i,
            "label": labels[i],
            "avg_outbound_seconds": round(avg, 1),
            "congestion_level": (
                "critical" if avg > 1200 else
                "high" if avg > 600 else
                "medium" if avg > 300 else
                "low"
            ),
        })

    congestion_scores.sort(key=lambda x: x["avg_outbound_seconds"], reverse=True)
    bottlenecks = _identify_bottlenecks(durations, labels, top_n=5)

    return {
        "matrix": {"durations": durations},
        "bottlenecks": [b.model_dump() for b in bottlenecks],
        "intersection_scores": congestion_scores,
        "recommendation": (
            "Prioritise green-phase extension for intersections with "
            "'critical' or 'high' congestion scores."
        ),
    }
