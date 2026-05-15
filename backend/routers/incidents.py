"""Crowd-sourced traffic incident reporting endpoints.

Supports creation, retrieval, bounding-box filtering, status lifecycle,
and optional image uploads.  All incidents are stored in-memory with
efficient bbox filtering.
"""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field, field_validator

router = APIRouter(tags=["incidents"])

UPLOAD_DIR = "uploads/incidents"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Enums & validation
# ---------------------------------------------------------------------------

class IncidentType(str, Enum):
    pothole = "pothole"
    accident = "accident"
    congestion = "congestion"
    road_closure = "road_closure"
    flooding = "flooding"


class Severity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class IncidentStatus(str, Enum):
    reported = "reported"
    verified = "verified"
    in_progress = "in_progress"
    resolved = "resolved"


# ---------------------------------------------------------------------------
# Response / request models
# ---------------------------------------------------------------------------

class IncidentResponse(BaseModel):
    id: str
    latitude: float
    longitude: float
    incident_type: str
    severity: str
    description: Optional[str] = None
    status: str
    image_url: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# In-memory datastore with seed data
# ---------------------------------------------------------------------------

INCIDENTS_DB: list[dict] = [
    {
        "id": "seed-1",
        "latitude": 12.9177,
        "longitude": 77.6227,
        "incident_type": "congestion",
        "severity": "critical",
        "description": "Severe gridlock at Silk Board junction — all four directions blocked",
        "status": "verified",
        "image_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": "seed-2",
        "latitude": 12.9756,
        "longitude": 77.6099,
        "incident_type": "accident",
        "severity": "high",
        "description": "Two-vehicle collision near Trinity Circle on MG Road",
        "status": "reported",
        "image_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": "seed-3",
        "latitude": 12.9591,
        "longitude": 77.6971,
        "incident_type": "pothole",
        "severity": "medium",
        "description": "Large pothole on Marathahalli Bridge service road",
        "status": "reported",
        "image_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": "seed-4",
        "latitude": 13.0358,
        "longitude": 77.5970,
        "incident_type": "congestion",
        "severity": "high",
        "description": "Heavy traffic backup at Hebbal flyover towards airport",
        "status": "verified",
        "image_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": "seed-5",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "incident_type": "road_closure",
        "severity": "critical",
        "description": "80-feet Road Koramangala closed for metro construction work",
        "status": "in_progress",
        "image_url": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    },
]



# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/incidents/", response_model=IncidentResponse)
async def create_incident(
    latitude: float = Form(...),
    longitude: float = Form(...),
    incident_type: str = Form(...),
    severity: str = Form(...),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
):
    """Report a new traffic incident with optional image upload."""

    # Validate incident_type
    try:
        IncidentType(incident_type)
    except ValueError:
        valid = [t.value for t in IncidentType]
        raise HTTPException(
            status_code=422,
            detail=f"Invalid incident_type '{incident_type}'. Must be one of: {valid}",
        )

    # Validate severity
    try:
        Severity(severity)
    except ValueError:
        valid = [s.value for s in Severity]
        raise HTTPException(
            status_code=422,
            detail=f"Invalid severity '{severity}'. Must be one of: {valid}",
        )

    # Validate coordinates
    if not (-90 <= latitude <= 90):
        raise HTTPException(status_code=422, detail="Latitude must be between -90 and 90")
    if not (-180 <= longitude <= 180):
        raise HTTPException(status_code=422, detail="Longitude must be between -180 and 180")

    # Handle image upload
    image_url: Optional[str] = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1].lower()
        if ext not in (".jpg", ".jpeg", ".png", ".webp"):
            raise HTTPException(status_code=422, detail="Image must be .jpg, .jpeg, .png, or .webp")
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        content = await image.read()
        with open(filepath, "wb") as f:
            f.write(content)
        image_url = f"/uploads/incidents/{filename}"

    now = datetime.now(timezone.utc).isoformat()
    new_incident = {
        "id": str(uuid.uuid4()),
        "latitude": latitude,
        "longitude": longitude,
        "incident_type": incident_type,
        "severity": severity,
        "description": description,
        "status": IncidentStatus.reported.value,
        "image_url": image_url,
        "created_at": now,
        "updated_at": now,
    }
    INCIDENTS_DB.append(new_incident)
    return new_incident


@router.get("/incidents/", response_model=List[IncidentResponse])
async def get_incidents(
    min_lat: Optional[float] = None,
    max_lat: Optional[float] = None,
    min_lon: Optional[float] = None,
    max_lon: Optional[float] = None,
    incident_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
):
    """Retrieve incidents with optional bounding-box and filter parameters."""
    results = INCIDENTS_DB

    # Bounding box filter
    if None not in (min_lat, max_lat, min_lon, max_lon):
        results = [
            i for i in results
            if min_lat <= i["latitude"] <= max_lat  # type: ignore[operator]
            and min_lon <= i["longitude"] <= max_lon  # type: ignore[operator]
        ]

    # Type / severity / status filters
    if incident_type:
        results = [i for i in results if i["incident_type"] == incident_type]
    if severity:
        results = [i for i in results if i["severity"] == severity]
    if status:
        results = [i for i in results if i["status"] == status]

    return results


@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
async def get_incident(incident_id: str):
    """Retrieve a single incident by ID."""
    for inc in INCIDENTS_DB:
        if inc["id"] == incident_id:
            return inc
    raise HTTPException(status_code=404, detail="Incident not found")


@router.patch("/incidents/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(incident_id: str, new_status: str = Form(...)):
    """Update the status of an incident (reported → verified → in_progress → resolved)."""
    try:
        IncidentStatus(new_status)
    except ValueError:
        valid = [s.value for s in IncidentStatus]
        raise HTTPException(status_code=422, detail=f"Invalid status. Must be one of: {valid}")

    for inc in INCIDENTS_DB:
        if inc["id"] == incident_id:
            inc["status"] = new_status
            inc["updated_at"] = datetime.now(timezone.utc).isoformat()
            return inc
    raise HTTPException(status_code=404, detail="Incident not found")


@router.get("/incidents/geojson/", response_model=None)
async def get_incidents_geojson(
    min_lat: Optional[float] = None,
    max_lat: Optional[float] = None,
    min_lon: Optional[float] = None,
    max_lon: Optional[float] = None,
):
    """Return incidents as a GeoJSON FeatureCollection, ready for Mapbox layers."""
    results = INCIDENTS_DB

    if None not in (min_lat, max_lat, min_lon, max_lon):
        results = [
            i for i in results
            if min_lat <= i["latitude"] <= max_lat  # type: ignore[operator]
            and min_lon <= i["longitude"] <= max_lon  # type: ignore[operator]
        ]

    severity_weight = {"low": 0.25, "medium": 0.5, "high": 0.75, "critical": 1.0}

    features = []
    for inc in results:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [inc["longitude"], inc["latitude"]],
            },
            "properties": {
                "id": inc["id"],
                "incident_type": inc["incident_type"],
                "severity": inc["severity"],
                "severity_weight": severity_weight.get(inc["severity"], 0.5),
                "description": inc.get("description", ""),
                "status": inc["status"],
                "image_url": inc.get("image_url"),
                "created_at": inc["created_at"],
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
    }
