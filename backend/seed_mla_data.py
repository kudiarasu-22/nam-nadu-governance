"""
Nam Nadu — MLA Data Seed Script
Populates the database with MLA profiles and CM Admin based on 2026 election results.

Run: python seed_mla_data.py
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.connection import SessionLocal, Base, engine
from app.models.master import District, Ward
from app.models.user import User, Role
from app.models.enums import RoleName
from app.models.leadership import MlaProfile, MlaAuth, MlaPerformance
from app.core.security import hash_password

mla_data = {
    "Chennai": [
        {"constituency": "Kolathur", "mla_name": "V. S. Babu", "party": "TVK"},
        {"constituency": "Chepauk-Thiruvallikeni", "mla_name": "Udhayanidhi Stalin", "party": "DMK"},
        {"constituency": "Anna Nagar", "mla_name": "V.K. Ramkumar", "party": "TVK"},
        {"constituency": "Thousand Lights", "mla_name": "Prabhakar J.C.D", "party": "TVK"},
        {"constituency": "Harbour", "mla_name": "P K Sekarbabu", "party": "DMK"},
        {"constituency": "T Nagar", "mla_name": "Anand N", "party": "TVK"},
    ],
    "Madurai": [
        {"constituency": "Madurai East", "mla_name": "Karthikeyan S", "party": "TVK"},
        {"constituency": "Madurai North", "mla_name": "A. Kallanai", "party": "TVK"},
        {"constituency": "Madurai South", "mla_name": "M.M. Gopison", "party": "TVK"},
        {"constituency": "Madurai Central", "mla_name": "Madhar Badhurudeen", "party": "TVK"},
        {"constituency": "Melur", "mla_name": "P. Viswanathan", "party": "INC"},
    ],
    "Coimbatore": [
        {"constituency": "Coimbatore North", "mla_name": "V. Sampathkumar", "party": "TVK"},
        {"constituency": "Coimbatore South", "mla_name": "V Senthilbalaji", "party": "DMK"},
        {"constituency": "Pollachi", "mla_name": "K. Nithyanandhan", "party": "DMK"},
        {"constituency": "Kinathukadavu", "mla_name": "Vignesh K", "party": "TVK"},
    ],
    "Tiruchirappalli": [
        {"constituency": "Tiruchirappalli West", "mla_name": "K.N. Nehru", "party": "DMK"},
        {"constituency": "Tiruchirappalli East", "mla_name": "C. Joseph Vijay", "party": "TVK"},
        {"constituency": "Thiruverumbur", "mla_name": "Vijayakumar", "party": "TVK"},
    ],
    "Dindigul": [
        {"constituency": "Dindigul", "mla_name": "Senthilkumar", "party": "DMK"},
        {"constituency": "Athoor", "mla_name": "I. Periasamy", "party": "DMK"},
        {"constituency": "Palani", "mla_name": "Ravimanoharan", "party": "AIADMK"},
    ],
    "Tirunelveli": [
        {"constituency": "Tirunelveli", "mla_name": "Murughan R.S", "party": "TVK"},
        {"constituency": "Ambasamudram", "mla_name": "Dr. Esakki Subaya", "party": "AIADMK"},
        {"constituency": "Palayamkottai", "mla_name": "M. Abdul Wahab", "party": "DMK"},
    ],
    "Thoothukudi": [
        {"constituency": "Thoothukkudi", "mla_name": "Srinath", "party": "TVK"},
        {"constituency": "Tiruchendur", "mla_name": "Anitha R. Radhakrishnan", "party": "DMK"},
        {"constituency": "Kovilpatti", "mla_name": "Karunanithi K", "party": "DMK"},
    ],
    "Kanchipuram": [
        {"constituency": "Chengalpattu", "mla_name": "S. Thiyagarajan", "party": "TVK"},
        {"constituency": "Kancheepuram", "mla_name": "R.V. Ranjithkumar", "party": "TVK"},
    ]
}


def seed_mla_data():
    db = SessionLocal()
    try:
        print("Ensuring Leadership Schema Exists...")
        Base.metadata.create_all(bind=engine)
        
        print("Seeding MLA Data & CM Admin...")
        
        # 1. Create CM_ADMIN Role & User
        cm_admin_role = db.query(Role).filter(Role.name == RoleName.CM_ADMIN).first()
        if not cm_admin_role:
            cm_admin_role = Role(name=RoleName.CM_ADMIN, description="Chief Minister Admin Role")
            db.add(cm_admin_role)
            db.commit()
            db.refresh(cm_admin_role)
            
        cm_admin_user = db.query(User).filter(User.email == "cm@namnadu.gov.in").first()
        if not cm_admin_user:
            cm_admin_user = User(
                email="cm@namnadu.gov.in",
                password_hash=hash_password("demo123"),
                full_name="Chief Minister Admin",
                role_id=cm_admin_role.id,
                is_active=True
            )
            db.add(cm_admin_user)
            db.commit()
            print(" -> CM Admin created (cm@namnadu.gov.in / demo123)")

        # Also ensure MLA Role is present just in case we need it anywhere (though isolated auth is used)
        mla_role = db.query(Role).filter(Role.name == RoleName.MLA).first()
        if not mla_role:
            mla_role = Role(name=RoleName.MLA, description="Member of Legislative Assembly")
            db.add(mla_role)
            db.commit()
            
        # 2. Iterate and Seed MLA Data
        total_mlas = 0
        for dist_name, mlas in mla_data.items():
            district = db.query(District).filter(District.name == dist_name).first()
            if not district:
                print(f"Warning: District '{dist_name}' not found. Creating it.")
                district = District(name=dist_name, district_code=f"TN-{dist_name[:3].upper()}")
                db.add(district)
                db.commit()
                db.refresh(district)
                
            for idx, mla_info in enumerate(mlas, start=1):
                c_name = mla_info["constituency"]
                ward = db.query(Ward).filter(Ward.district_id == district.id, Ward.ward_name == c_name).first()
                if not ward:
                    # Create the ward (constituency) if it doesn't exist
                    ward = Ward(ward_number=f"C-{idx:03d}", ward_name=c_name, district_id=district.id, zone="Constituency")
                    db.add(ward)
                    db.commit()
                    db.refresh(ward)
                    
                # Generate MLA ID
                mla_id = f"TN-MLA-{dist_name.upper()}-{idx:03d}"
                
                profile = db.query(MlaProfile).filter(MlaProfile.mla_id == mla_id).first()
                if not profile:
                    profile = MlaProfile(
                        mla_id=mla_id,
                        name=mla_info["mla_name"],
                        political_party=mla_info["party"],
                        district_id=district.id,
                        ward_id=ward.id,
                        contact_email=f"{mla_id.lower()}@namnadu.gov.in"
                    )
                    db.add(profile)
                    db.commit()
                    db.refresh(profile)
                    
                    # MlaAuth is NO LONGER seeded here. MLAs must register to create their Auth record.
                    
                    # Create Performance entry
                    performance = MlaPerformance(
                        mla_profile_id=profile.id,
                        complaint_resolution_percent=85.5,
                        project_completion_percent=70.0,
                        citizen_satisfaction_score=4.2,
                        escalation_count=2,
                        overall_score=82.0,
                        performance_label="Good"
                    )
                    db.add(performance)
                    
                    db.commit()
                    total_mlas += 1

        print(f" -> {total_mlas} MLAs seeded successfully.")
        print("\n[DEMO] MLA Login Credentials:")
        print("  Use generated MLA IDs (e.g., TN-MLA-CHENNAI-001) / demo123")
        
    except Exception as e:
        print(f"Error seeding MLA data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_mla_data()
