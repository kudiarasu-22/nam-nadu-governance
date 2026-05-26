"""
Nam Nadu — Master Data API Router
"""
import math
from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.master import District, Ward, Area, LocationDetail, ComplaintCategory
from app.models.department import Department
from app.schemas.master import (
    DistrictSchema, WardSchema, AreaSchema, LocationDetailSchema,
    ComplaintCategorySchema, DetectedLocationSchema
)


router = APIRouter(prefix="/api/v1/master", tags=["Master Data"])


# ── Utilities ────────────────────────────────────────────────────────────
def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on Earth in km."""
    R = 6371.0 # Earth radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


# ── API Endpoints ────────────────────────────────────────────────────────
@router.get("/districts", response_model=List[DistrictSchema])
def get_districts(db: Session = Depends(get_db)):
    """Get all active districts."""
    return db.query(District).filter(District.is_active == True).order_by(District.name).all()


@router.get("/wards/{district_id}", response_model=List[WardSchema])
def get_wards(district_id: int, db: Session = Depends(get_db)):
    """Get all active wards for a district."""
    return db.query(Ward).filter(Ward.district_id == district_id, Ward.is_active == True).order_by(Ward.ward_number).all()


@router.get("/areas/{ward_id}", response_model=List[AreaSchema])
def get_areas(ward_id: int, db: Session = Depends(get_db)):
    """Get all active areas for a ward."""
    return db.query(Area).filter(Area.ward_id == ward_id, Area.is_active == True).order_by(Area.name).all()


@router.get("/location-details/{area_id}", response_model=List[LocationDetailSchema])
def get_location_details(area_id: int, db: Session = Depends(get_db)):
    """Get all active streets/landmarks for an area."""
    return db.query(LocationDetail).filter(LocationDetail.area_id == area_id, LocationDetail.is_active == True).order_by(LocationDetail.street_name).all()


@router.get("/categories", response_model=List[ComplaintCategorySchema])
def get_categories(db: Session = Depends(get_db)):
    """Get all active complaint categories."""
    return db.query(ComplaintCategory).filter(ComplaintCategory.is_active == True).order_by(ComplaintCategory.name).all()


@router.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    """Get all departments."""
    depts = db.query(Department).all()
    return [{"id": d.id, "name": d.name} for d in depts]


@router.get("/detect-location", response_model=DetectedLocationSchema)
def detect_location(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    db: Session = Depends(get_db)
):
    """
    Find the nearest LocationDetail using Haversine formula.
    Returns the LocationDetail, Area, Ward, and District.
    """
    # Simple math-based detection (fetch all active LocationDetails with coordinates)
    # In a massive DB, we'd use PostGIS. For Phase 1, we pull active records with lat/lng.
    locations = db.query(LocationDetail).filter(
        LocationDetail.is_active == True,
        LocationDetail.latitude.isnot(None),
        LocationDetail.longitude.isnot(None)
    ).all()

    if not locations:
        raise HTTPException(status_code=404, detail="No location data available for detection.")

    nearest_loc = None
    min_distance = float('inf')

    for loc in locations:
        dist = haversine_distance(lat, lng, loc.latitude, loc.longitude)
        if dist < min_distance:
            min_distance = dist
            nearest_loc = loc

    if not nearest_loc or min_distance > 50: # If > 50km away, it's out of bounds
        raise HTTPException(status_code=404, detail="No recognized location found within 50km.")

    # Get hierarchy
    area = nearest_loc.area
    ward = area.ward if area else None
    district = ward.district if ward else None

    return DetectedLocationSchema(
        district=district,
        ward=ward,
        area=area,
        location_detail=nearest_loc,
        distance_km=round(min_distance, 2)
    )
