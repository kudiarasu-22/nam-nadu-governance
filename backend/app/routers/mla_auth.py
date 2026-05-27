"""
Nam Nadu — MLA Auth Routes
Isolated authentication mechanism strictly for MLAs.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database.connection import get_db
from app.models.leadership import MlaAuth, MlaProfile
from app.models.master import District, Ward
from app.core.security import verify_password, create_access_token, hash_password
from app.schemas.leadership import MlaLoginRequest, MlaLoginResponse, MlaRegisterRequest, MlaRegisterResponse

router = APIRouter(
    prefix="/api/v1/mla/auth",
    tags=["MLA Auth"],
)

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days


@router.post("/login", response_model=MlaLoginResponse)
def login_mla(request: MlaLoginRequest, db: Session = Depends(get_db)):
    """Authenticate an MLA using their MLA ID and isolated password."""
    
    # 1. Look up profile
    profile = db.query(MlaProfile).filter(MlaProfile.mla_id == request.mla_id).first()
    if not profile or not profile.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MLA credentials or profile inactive",
        )
        
    # 2. Look up auth record
    auth_record = db.query(MlaAuth).filter(MlaAuth.mla_profile_id == profile.id).first()
    if not auth_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MLA credentials",
        )
        
    # 3. Verify password
    if not verify_password(request.password, auth_record.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MLA credentials",
        )
        
    # 4. Generate JWT specifically identifying this as an MLA token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": profile.mla_id, # Subject is the MLA ID, not user ID
        "role": "mla",
        "mla_profile_id": profile.id,
        "ward_id": profile.ward_id,
        "district_id": profile.district_id
    }
    access_token = create_access_token(
        data=token_data, expires_delta=access_token_expires
    )
    
    return MlaLoginResponse(
        access_token=access_token,
        token_type="bearer",
        mla_id=profile.mla_id,
        name=profile.name,
        ward_id=profile.ward_id,
        district_id=profile.district_id
    )


@router.post("/register", response_model=MlaRegisterResponse)
def register_mla(request: MlaRegisterRequest, db: Session = Depends(get_db)):
    """Register an MLA by validating against the seeded PDF 'Master List'"""
    
    # Validate against MlaProfile directly, using relationships to check District and Ward names
    # Find district
    district = db.query(District).filter(District.name.ilike(request.district)).first()
    if not district:
        raise HTTPException(status_code=400, detail="You are not an authorized MLA. (District not found)")
        
    ward = db.query(Ward).filter(Ward.district_id == district.id, Ward.ward_name.ilike(request.ward)).first()
    if not ward:
        raise HTTPException(status_code=400, detail="You are not an authorized MLA. (Ward not found)")
        
    profile = db.query(MlaProfile).filter(
        MlaProfile.name.ilike(request.name),
        MlaProfile.political_party.ilike(request.party),
        MlaProfile.district_id == district.id,
        MlaProfile.ward_id == ward.id
    ).first()
    
    if not profile:
        raise HTTPException(status_code=400, detail="You are not an authorized MLA.")
        
    # Check if already registered
    auth_record = db.query(MlaAuth).filter(MlaAuth.mla_profile_id == profile.id).first()
    if auth_record:
        raise HTTPException(status_code=400, detail="MLA already registered. Please log in.")
        
    # Update profile contact info if provided
    if request.email:
        profile.contact_email = request.email
    if request.phone:
        profile.contact_phone = request.phone
        
    # Create Auth Record
    new_auth = MlaAuth(
        mla_profile_id=profile.id,
        password_hash=hash_password(request.password)
    )
    db.add(new_auth)
    db.commit()
    
    return MlaRegisterResponse(
        message="Registration Successful",
        mla_id=profile.mla_id
    )
