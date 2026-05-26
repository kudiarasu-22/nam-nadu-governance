"""
Nam Nadu — Database Seed Script
Populates the database with realistic Tamil Nadu demo data.

Run: python seed_db.py  (from the backend/ directory with .venv active)
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.user import User
from app.models.complaint import Complaint, ComplaintUpdate
from app.models.project import GovernmentProject, Contractor, ProjectProgress
from app.database import init_db
from app.models.department import Department
from app.models.feedback import Volunteer
from app.models.enums import ComplaintStatus, Priority, ProjectStatus, RoleName


def seed():
    from app.database.connection import Base, engine
    import app.models.user
    import app.models.department
    import app.models.master
    import app.models.complaint
    import app.models.project
    import app.models.notification
    import app.models.feedback
    import app.models.analytics
    
    print("Dropping existing tables for a clean reset...")
    Base.metadata.drop_all(bind=engine)
    
    init_db()
    
    # Run Master Data Seed First
    from seed_master_data import seed_master_data
    seed_master_data()
    
    db = SessionLocal()
    try:
        from app.models.user import Role
        from app.core.security import hash_password

        # ── Roles ────────────────────────────────────────────────────────────
        def get_or_create_role(name, description):
            role = db.query(Role).filter(Role.name == name).first()
            if not role:
                role = Role(name=name, description=description)
                db.add(role)
                db.commit()
            return role

        citizen_role    = get_or_create_role(RoleName.CITIZEN,        "Citizen Role")
        officer_role    = get_or_create_role(RoleName.OFFICER,        "Officer Role")
        leadership_role = get_or_create_role(RoleName.LEADERSHIP_ADMIN, "Leadership Admin Role")
        volunteer_role  = get_or_create_role(RoleName.VOLUNTEER,      "Volunteer Role")

        # ── Demo Users ───────────────────────────────────────────────────────
        def get_or_create_user(email, password, full_name, role_id, ward=None):
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    email=email,
                    password_hash=hash_password(password),
                    full_name=full_name,
                    role_id=role_id,
                    is_active=True,
                    ward=ward,
                )
                db.add(user)
                db.commit()
            return user

        # Official turnkey demo accounts
        citizen  = get_or_create_user(
            "citizen@namnadu.gov.in",  "demo123",
            "Anbu Selvam", citizen_role.id, ward="Anna Nagar West"
        )
        officer  = get_or_create_user(
            "officer@namnadu.gov.in",  "demo123",
            "Ramesh Kumar", officer_role.id, ward="T Nagar"
        )
        leadership = get_or_create_user(
            "leadership@namnadu.gov.in", "demo123",
            "Chief Secretary", leadership_role.id
        )
        volunteer_user = get_or_create_user(
            "volunteer@namnadu.gov.in", "demo123",
            "Arun Kumar", volunteer_role.id, ward="T Nagar"
        )

        # Volunteer profile
        vol_profile = db.query(Volunteer).filter(Volunteer.user_id == volunteer_user.id).first()
        if not vol_profile:
            vol_profile = Volunteer(
                user_id=volunteer_user.id,
                skills="Disaster Management, First Aid, Tech Support",
                availability="Weekends & Evenings",
                assigned_ward="T Nagar (Ward 102)",
                total_hours=45.5,
                is_verified=True,
            )
            db.add(vol_profile)
            db.commit()

        # ── Departments ──────────────────────────────────────────────────────
        def get_or_create_dept(name):
            dept = db.query(Department).filter(Department.name == name).first()
            if not dept:
                dept = Department(name=name)
                db.add(dept)
                db.commit()
            return dept

        dept_pwd    = get_or_create_dept("Public Works Department")
        dept_water  = get_or_create_dept("Metro Water Supply")
        dept_elec   = get_or_create_dept("TANGEDCO Electricity")
        dept_health = get_or_create_dept("Corporation Health")
        dept_gc     = get_or_create_dept("Corporation Sanitation")

        # ── Contractors ──────────────────────────────────────────────────────
        def get_or_create_contractor(name, company, license_no):
            c = db.query(Contractor).filter(Contractor.name == name).first()
            if not c:
                c = Contractor(name=name, company=company, license_no=license_no)
                db.add(c)
                db.commit()
            return c

        c_lt       = get_or_create_contractor("L&T Infrastructure",    "Larsen & Toubro",       "LT-TN-2024-001")
        c_ramco    = get_or_create_contractor("Ramco Constructions",    "Ramco Group",           "RC-TN-2024-045")
        c_apollo   = get_or_create_contractor("Apollo Buildcon",        "Apollo Infrastructure", "AP-TN-2024-012")
        c_philips  = get_or_create_contractor("Philips Smart Lighting", "Philips India Ltd",     "PH-TN-2024-088")

        # ── Complaints ───────────────────────────────────────────────────────
        if db.query(Complaint).count() == 0:
            print("Seeding Complaints...")
            now = datetime.now(timezone.utc)
            complaints = [
                Complaint(
                    citizen_id=citizen.id,
                    category="Road Damage",
                    title="Severe Potholes on Anna Salai Near Royapettah",
                    description="Multiple large potholes on Anna Salai between Royapettah and Triplicane causing traffic snarls and vehicle damage. Immediate repair required.",
                    location="Anna Salai, Royapettah",
                    ward="Ward 108",
                    status=ComplaintStatus.SUBMITTED,
                    priority=Priority.HIGH,
                    created_at=now - timedelta(days=3),
                ),
                Complaint(
                    citizen_id=citizen.id,
                    category="Water Supply",
                    title="No Water Supply for 3 Days – T Nagar 4th Main Road",
                    description="Residents of T Nagar 4th Main Road have been without water supply for 3 consecutive days. Metro Water supply pipe appears to be broken at junction.",
                    location="4th Main Road, T Nagar",
                    ward="Ward 132",
                    status=ComplaintStatus.ASSIGNED,
                    priority=Priority.URGENT,
                    assigned_officer_id=officer.id,
                    created_at=now - timedelta(hours=20),
                ),
                Complaint(
                    citizen_id=citizen.id,
                    category="Streetlight Failure",
                    title="10 Streetlights Not Working on Velachery Main Road",
                    description="Stretch of 500m on Velachery Main Road near Vijaya Nagar is completely dark due to streetlight outage. Accident risk is high, especially for women commuters.",
                    location="Velachery Main Road, Vijaya Nagar",
                    ward="Ward 174",
                    status=ComplaintStatus.IN_PROGRESS,
                    priority=Priority.MEDIUM,
                    assigned_officer_id=officer.id,
                    created_at=now - timedelta(days=1),
                ),
                Complaint(
                    citizen_id=citizen.id,
                    category="Garbage Collection",
                    title="Garbage Not Collected for 4 Days – Adyar Colony",
                    description="Municipal garbage collection vehicle has not visited Adyar colony for 4 days. Garbage is overflowing bins and causing foul smell and health hazard.",
                    location="Adyar Colony, 2nd Street",
                    ward="Ward 185",
                    status=ComplaintStatus.COMPLETED,
                    priority=Priority.MEDIUM,
                    assigned_officer_id=officer.id,
                    created_at=now - timedelta(days=5),
                    resolved_at=now - timedelta(days=1),
                ),
                Complaint(
                    citizen_id=citizen.id,
                    category="Drainage",
                    title="Stormwater Drain Overflowing – Anna Nagar West",
                    description="Stormwater drain on 15th Avenue, Anna Nagar West is overflowing onto the road due to blockage with construction debris. Risk of flooding during monsoon.",
                    location="15th Avenue, Anna Nagar West",
                    ward="Ward 56",
                    status=ComplaintStatus.SUBMITTED,
                    priority=Priority.HIGH,
                    created_at=now - timedelta(days=2),
                ),
                Complaint(
                    citizen_id=citizen.id,
                    category="Road Damage",
                    title="Road Cave-in at Kodambakkam High Road",
                    description="A section of road near Kodambakkam has collapsed, possibly due to underground drainage pipeline failure. One lane is completely impassable.",
                    location="Kodambakkam High Road, Near Railway Station",
                    ward="Ward 148",
                    status=ComplaintStatus.ASSIGNED,
                    priority=Priority.URGENT,
                    assigned_officer_id=officer.id,
                    created_at=now - timedelta(hours=8),
                ),
                Complaint(
                    citizen_id=citizen.id,
                    category="Water Supply",
                    title="Water Quality Issue – Brownish Water in Mylapore",
                    description="Brownish, foul-smelling water is coming from taps in Mylapore area near Kapaleeshwarar Temple Street. Request immediate water quality testing.",
                    location="Kapaleeshwarar Temple Street, Mylapore",
                    ward="Ward 122",
                    status=ComplaintStatus.IN_PROGRESS,
                    priority=Priority.HIGH,
                    assigned_officer_id=officer.id,
                    created_at=now - timedelta(days=1, hours=4),
                ),
                Complaint(
                    citizen_id=citizen.id,
                    category="Flooding",
                    title="Persistent Flooding During Rain – Nungambakkam",
                    description="Underpass at Nungambakkam Railway Station floods within 30 minutes of rain start. Multiple vehicles have stalled. Needs urgent drainage upgrade.",
                    location="Nungambakkam Railway Station Underpass",
                    ward="Ward 98",
                    status=ComplaintStatus.SUBMITTED,
                    priority=Priority.HIGH,
                    created_at=now - timedelta(days=4),
                ),
            ]
            db.add_all(complaints)
            db.commit()
            print(f"  -> {len(complaints)} complaints seeded.")

        # ── Projects ─────────────────────────────────────────────────────────
        if db.query(GovernmentProject).count() == 0:
            print("Seeding Projects...")
            now = datetime.now(timezone.utc)
            projects_data = [
                dict(
                    name="Chennai Stormwater Drain Expansion – Phase II",
                    description="Expansion and upgrade of stormwater drainage network across 42 wards to reduce monsoon flooding risk. Includes rehabilitation of 280 km of old drains.",
                    department_id=dept_pwd.id,
                    budget=750_000_000,
                    status=ProjectStatus.IN_PROGRESS,
                    ward="Multiple Wards (Anna Nagar, T Nagar, Adyar)",
                    contractor_id=c_lt.id,
                    created_by=officer.id,
                    progress=65,
                ),
                dict(
                    name="Smart LED Streetlight Installation – Chennai North",
                    description="Installation of 15,000 energy-efficient LED streetlights across 18 wards in North Chennai zones to improve safety and reduce electricity costs by 60%.",
                    department_id=dept_elec.id,
                    budget=250_000_000,
                    status=ProjectStatus.IN_PROGRESS,
                    ward="Ward 1–18 (North Chennai)",
                    contractor_id=c_philips.id,
                    created_by=officer.id,
                    progress=40,
                ),
                dict(
                    name="Primary Health Centre Renovation – Velachery",
                    description="Complete renovation and modernisation of PHC at Velachery including new OPD block, pathology lab, digital health records system, and 24×7 ambulance facility.",
                    department_id=dept_health.id,
                    budget=120_000_000,
                    status=ProjectStatus.APPROVED,
                    ward="Ward 174 (Velachery)",
                    contractor_id=c_apollo.id,
                    created_by=officer.id,
                    progress=0,
                ),
                dict(
                    name="Anna Salai Road Widening – Saidapet to Guindy",
                    description="4-lane to 6-lane widening of Anna Salai from Saidapet Flyover to Guindy Industrial Estate. Includes dedicated cycling track and pedestrian footpaths.",
                    department_id=dept_pwd.id,
                    budget=580_000_000,
                    status=ProjectStatus.IN_PROGRESS,
                    ward="Ward 150–160 (Saidapet–Guindy Corridor)",
                    contractor_id=c_ramco.id,
                    created_by=officer.id,
                    progress=78,
                ),
                dict(
                    name="Underground Sewage Network – Kodambakkam",
                    description="Laying underground sewage pipeline network across Kodambakkam to eliminate open drain sewage. Covers 12,000 households and 3 major road junctions.",
                    department_id=dept_water.id,
                    budget=340_000_000,
                    status=ProjectStatus.PROPOSED,
                    ward="Ward 148 (Kodambakkam)",
                    created_by=officer.id,
                    progress=0,
                ),
            ]

            for pd in projects_data:
                progress_pct = pd.pop("progress")
                project = GovernmentProject(**pd)
                db.add(project)
                db.commit()
                if progress_pct > 0:
                    prog = ProjectProgress(
                        project_id=project.id,
                        percentage=float(progress_pct),
                        description="Latest site inspection update.",
                        updated_by=officer.id,
                    )
                    db.add(prog)
                    db.commit()

            print(f"  -> {len(projects_data)} projects seeded.")

        print("\n[OK] Seeding complete.")
        print("\n[DEMO] Credentials:")
        print("  Citizen  : citizen@namnadu.gov.in  / demo123")
        print("  Officer  : officer@namnadu.gov.in  / demo123")
        print("  Leadership: leadership@namnadu.gov.in / demo123")
        print("  Volunteer: volunteer@namnadu.gov.in / demo123")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
