"""Dynamic rerouting using Mapbox Directions API (driving-traffic profile).

Features:
- Builds exclusion zones around critical/high-severity active incidents
- Requests alternative routes
- Returns full GeoJSON geometry, duration, distance, and congestion annotations
- Graceful fallback to basic driving profile when driving-traffic fails
"""

from __future__ import annotations

import math
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from routers.incidents import INCIDENTS_DB
from services.mapbox_client import get_api_key, mapbox_get

router = APIRouter(tags=["routing"])


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------

class RouteWaypoint(BaseModel):
    name: str
    location: List[float]


class RouteLeg(BaseModel):
    duration: float
    distance: float
    summary: str = ""


class RouteResponse(BaseModel):
    duration: float
    distance: float
    geometry: dict
    legs: List[RouteLeg]
    weight_name: str = ""


class DirectionsResponse(BaseModel):
    routes: List[RouteResponse]
    waypoints: List[RouteWaypoint]
    excluded_incidents: int = 0


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _incident_exclusion_polygons(
    buffer_km: float = 0.5,
) -> List[str]:
    """Generate WKT-style ``point(lon lat)`` exclusion strings for critical/high incidents.

    Mapbox Directions ``exclude`` param accepts ``point(lon lat)`` values.
    We only exclude incidents that are *active* (not resolved) and severe.
    """
    exclusions: List[str] = []
    for inc in INCIDENTS_DB:
        if inc["severity"] in ("critical", "high") and inc["status"] != "resolved":
            exclusions.append(f"point({inc['longitude']} {inc['latitude']})")
    return exclusions


def _nearby_incident_count(
    route_geometry: dict,
    radius_km: float = 0.8,
) -> int:
    """Count active incidents within *radius_km* of any point on the route."""
    coords = route_geometry.get("coordinates", [])
    count = 0
    for inc in INCIDENTS_DB:
        if inc["status"] == "resolved":
            continue
        for lon, lat in coords[::5]:  # sample every 5th point for perf
            dist = _haversine(lat, lon, inc["latitude"], inc["longitude"])
            if dist <= radius_km:
                count += 1
                break
    return count


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Distance in km between two coordinates."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/route", response_model=None)
async def get_route(
    start_lon: float = Query(..., description="Start longitude"),
    start_lat: float = Query(..., description="Start latitude"),
    end_lon: float = Query(..., description="End longitude"),
    end_lat: float = Query(..., description="End latitude"),
    avoid_incidents: bool = Query(True, description="Dynamically exclude zones around active high/critical incidents"),
    alternatives: bool = Query(True, description="Request alternative routes"),
):
    """Get optimised driving route with real-time traffic and incident avoidance.

    Uses ``mapbox/driving-traffic`` profile with automatic fallback to
    ``mapbox/driving`` if the traffic-aware profile fails.
    """
    try:
        get_api_key()
    except ValueError:
        raise HTTPException(status_code=500, detail="Mapbox API key not configured")

    coords_path = f"{start_lon},{start_lat};{end_lon},{end_lat}"
    params: dict = {
        "geometries": "geojson",
        "overview": "full",
        "alternatives": str(alternatives).lower(),
        "annotations": "congestion,duration,distance,speed",
        "steps": "false",
    }

    # Build exclusion list from active critical incidents
    excluded_count = 0
    if avoid_incidents:
        exclusions = _incident_exclusion_polygons()
        if exclusions:
            # Mapbox supports multiple exclude values separated by commas
            params["exclude"] = ",".join(exclusions[:10])  # limit to 10
            excluded_count = len(exclusions[:10])

    # Primary attempt: driving-traffic
    profiles = ["driving-traffic", "driving"]  # fallback chain
    last_error: Optional[Exception] = None

    for profile in profiles:
        try:
            path = f"/directions/v5/mapbox/{profile}/{coords_path}"
            data = await mapbox_get(path, params, use_cache=False)

            if data.get("code") != "Ok":
                raise ValueError(data.get("message", "Unknown Mapbox error"))

            routes = []
            for r in data.get("routes", []):
                legs = []
                for leg in r.get("legs", []):
                    legs.append(RouteLeg(
                        duration=leg.get("duration", 0),
                        distance=leg.get("distance", 0),
                        summary=leg.get("summary", ""),
                    ))
                routes.append(RouteResponse(
                    duration=r.get("duration", 0),
                    distance=r.get("distance", 0),
                    geometry=r.get("geometry", {}),
                    legs=legs,
                    weight_name=r.get("weight_name", ""),
                ))

            waypoints = [
                RouteWaypoint(name=w.get("name", ""), location=w.get("location", []))
                for w in data.get("waypoints", [])
            ]

            return {
                "routes": [r.model_dump() for r in routes],
                "waypoints": [w.model_dump() for w in waypoints],
                "excluded_incidents": excluded_count,
                "profile_used": profile,
            }

        except Exception as exc:
            last_error = exc
            # If driving-traffic fails, try plain driving
            if profile == "driving":
                raise HTTPException(
                    status_code=502,
                    detail=f"Mapbox API error: {exc}",
                )


@router.get("/route/nearby-incidents")
async def get_nearby_incidents(
    route_geojson: str = Query(..., description="Stringified GeoJSON LineString geometry"),
    radius_km: float = Query(0.8, description="Radius in km to search for incidents around route"),
):
    """Check how many active incidents are near a given route geometry."""
    import json
    try:
        geometry = json.loads(route_geojson)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid GeoJSON geometry")

    count = _nearby_incident_count(geometry, radius_km)
    incidents_near = []
    coords = geometry.get("coordinates", [])
    for inc in INCIDENTS_DB:
        if inc["status"] == "resolved":
            continue
        for lon, lat in coords[::5]:
            if _haversine(lat, lon, inc["latitude"], inc["longitude"]) <= radius_km:
                incidents_near.append({
                    "id": inc["id"],
                    "incident_type": inc["incident_type"],
                    "severity": inc["severity"],
                    "latitude": inc["latitude"],
                    "longitude": inc["longitude"],
                })
                break

    return {"count": count, "incidents": incidents_near}
