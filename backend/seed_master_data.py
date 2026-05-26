"""
Nam Nadu — Master Data Seed Script
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.database import init_db
from app.models.master import District, Ward, Area, LocationDetail, ComplaintCategory
from app.models.department import Department


def seed_master_data():
    init_db()
    db = SessionLocal()
    try:
        print("Seeding Master Data...")
        
        # 1. Departments
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

        # 2. Complaint Categories
        categories = [
            {
                "name": "Road Damage", "icon": "road", "department_id": dept_pwd.id,
                "priority_default": "high", "sla_hours": 48,
                "severity_level": "high", "requires_photo": True, "citizen_visibility": True,
                "estimated_resolution_hours": 72, "auto_assign_enabled": True
            },
            {
                "name": "Water Leakage", "icon": "droplets", "department_id": dept_water.id,
                "priority_default": "urgent", "sla_hours": 24,
                "severity_level": "urgent", "requires_photo": True, "citizen_visibility": True,
                "estimated_resolution_hours": 24, "auto_assign_enabled": True
            },
            {
                "name": "Streetlight Failure", "icon": "lightbulb", "department_id": dept_elec.id,
                "priority_default": "medium", "sla_hours": 72,
                "severity_level": "medium", "requires_photo": False, "citizen_visibility": True,
                "estimated_resolution_hours": 48, "auto_assign_enabled": True
            },
            {
                "name": "Garbage Overflow", "icon": "trash", "department_id": dept_gc.id,
                "priority_default": "medium", "sla_hours": 24,
                "severity_level": "medium", "requires_photo": True, "citizen_visibility": True,
                "estimated_resolution_hours": 24, "auto_assign_enabled": True
            },
            {
                "name": "Drainage Blockage", "icon": "waves", "department_id": dept_water.id,
                "priority_default": "high", "sla_hours": 48,
                "severity_level": "high", "requires_photo": True, "citizen_visibility": True,
                "estimated_resolution_hours": 48, "auto_assign_enabled": True
            },
            {
                "name": "Internal Municipal Audit", "icon": "file-text", "department_id": dept_pwd.id,
                "priority_default": "low", "sla_hours": 168,
                "severity_level": "low", "requires_photo": False, "citizen_visibility": False,
                "estimated_resolution_hours": 168, "auto_assign_enabled": False
            }
        ]
        
        for cat_data in categories:
            cat = db.query(ComplaintCategory).filter(ComplaintCategory.name == cat_data["name"]).first()
            if not cat:
                db.add(ComplaintCategory(**cat_data))
        db.commit()

        # 3. Districts
        districts_data = [
            ("Chennai", "TN-02", 13.0827, 80.2707),
            ("Madurai", "TN-59", 9.9252, 78.1198),
            ("Coimbatore", "TN-38", 11.0168, 76.9558),
            ("Tiruchirappalli", "TN-45", 10.7905, 78.7047),
            ("Salem", "TN-30", 11.6643, 78.1460),
            ("Tirunelveli", "TN-72", 8.7139, 77.7567),
            # Add some more to make it realistic (up to 38 conceptually, we'll add a few prominent ones)
            ("Erode", "TN-33", 11.3410, 77.7172),
            ("Tiruppur", "TN-39", 11.1085, 77.3411),
            ("Vellore", "TN-23", 12.9165, 79.1325),
            ("Thoothukudi", "TN-69", 8.7642, 78.1348),
            ("Thanjavur", "TN-49", 10.7870, 79.1378),
            ("Dindigul", "TN-57", 10.3673, 77.9803),
            ("Kanyakumari", "TN-74", 8.0883, 77.5385),
            ("Kanchipuram", "TN-21", 12.8185, 79.6947),
            ("Chengalpattu", "TN-19", 12.6841, 79.9836),
            ("Tiruvallur", "TN-20", 13.1436, 79.9148),
            ("Ranipet", "TN-73", 12.9272, 79.3331),
            ("Tirupathur", "TN-83", 12.4939, 78.5661),
            ("Krishnagiri", "TN-24", 12.5186, 78.2137),
            ("Dharmapuri", "TN-29", 12.1211, 78.1582),
            ("Namakkal", "TN-28", 11.2189, 78.1674),
            ("Karur", "TN-47", 10.9504, 78.0833),
            ("Perambalur", "TN-46", 11.2333, 78.8833),
            ("Ariyalur", "TN-61", 11.1396, 79.0732),
            ("Cuddalore", "TN-31", 11.7480, 79.7714),
            ("Villupuram", "TN-32", 11.9401, 79.4861),
            ("Kallakurichi", "TN-15", 11.7383, 78.9610),
            ("Mayiladuthurai", "TN-82", 11.1085, 79.6534),
            ("Nagapattinam", "TN-51", 10.7672, 79.8433),
            ("Tiruvarur", "TN-50", 10.7718, 79.6358),
            ("Pudukkottai", "TN-55", 10.3797, 78.8205),
            ("Sivaganga", "TN-63", 9.8433, 78.4809),
            ("Ramanathapuram", "TN-65", 9.3639, 78.8320),
            ("Virudhunagar", "TN-67", 9.5872, 77.9624),
            ("Tenkasi", "TN-79", 8.9594, 77.3161),
            ("The Nilgiris", "TN-43", 11.4916, 76.7337),
            ("Theni", "TN-60", 10.0104, 77.4768),
            ("Tiruvannamalai", "TN-25", 12.2253, 79.0747)
        ]

        for d_name, d_code, lat, lng in districts_data:
            d = db.query(District).filter(District.name == d_name).first()
            if not d:
                db.add(District(name=d_name, district_code=d_code, latitude=lat, longitude=lng))
        db.commit()

        # 4. Wards & Areas & LocationDetails for Chennai & Madurai
        chennai = db.query(District).filter(District.name == "Chennai").first()
        madurai = db.query(District).filter(District.name == "Madurai").first()
        coimbatore = db.query(District).filter(District.name == "Coimbatore").first()

        def add_hierarchy(district, ward_num, ward_name, zone, area_name, pincode, lat, lng, streets):
            w = db.query(Ward).filter(Ward.district_id == district.id, Ward.ward_number == ward_num).first()
            if not w:
                w = Ward(ward_number=ward_num, ward_name=ward_name, district_id=district.id, zone=zone, latitude=lat, longitude=lng)
                db.add(w)
                db.commit()
            
            a = db.query(Area).filter(Area.ward_id == w.id, Area.name == area_name).first()
            if not a:
                a = Area(name=area_name, ward_id=w.id, pincode=pincode, latitude=lat, longitude=lng)
                db.add(a)
                db.commit()
            
            for street, landmark in streets:
                ld = db.query(LocationDetail).filter(LocationDetail.area_id == a.id, LocationDetail.street_name == street).first()
                if not ld:
                    db.add(LocationDetail(area_id=a.id, street_name=street, landmark=landmark, pincode=pincode, latitude=lat, longitude=lng))
            db.commit()

        # Chennai
        add_hierarchy(chennai, "W-108", "Anna Nagar", "Zone 8", "Anna Nagar West", "600040", 13.0850, 80.2101, [
            ("2nd Avenue", "Near Tower Park"),
            ("15th Main Road", "Near Blue Star"),
            ("Shanthi Colony", "Near Post Office")
        ])
        add_hierarchy(chennai, "W-090", "Mogappair", "Zone 7", "Mogappair East", "600037", 13.0838, 80.1837, [
            ("5th Main Road", "Near DAV School"),
            ("Pari Salai", "Near Spartan School")
        ])
        add_hierarchy(chennai, "W-132", "T Nagar", "Zone 10", "Thyagaraya Nagar", "600017", 13.0382, 80.2364, [
            ("Pondy Bazaar", "Near Big Bazaar"),
            ("North Usman Road", "Near Panagal Park")
        ])

        # Madurai
        add_hierarchy(madurai, "W-031", "KK Nagar", "North Zone", "KK Nagar", "625020", 9.9390, 78.1491, [
            ("80 Feet Road", "Near Apollo Hospital"),
            ("Melur Road", "Near Mattuthavani Bus Stand")
        ])
        add_hierarchy(madurai, "W-012", "Anna Nagar", "North Zone", "Anna Nagar", "625020", 9.9298, 78.1472, [
            ("Main Road", "Near Suguna Store"),
            ("80 Feet Road", "Near Ambika Theatre")
        ])

        # Coimbatore
        add_hierarchy(coimbatore, "W-045", "Gandhipuram", "Central Zone", "Gandhipuram", "641012", 11.0183, 76.9650, [
            ("Cross Cut Road", "Near Town Bus Stand"),
            ("100 Feet Road", "Near GP Signal")
        ])
        add_hierarchy(coimbatore, "W-067", "Peelamedu", "East Zone", "Peelamedu", "641004", 11.0267, 77.0055, [
            ("Avinashi Road", "Near PSG Tech"),
            ("Hopes College", "Near Signal")
        ])

        print("  -> Master Data seeded successfully.")
    except Exception as e:
        print(f"Error seeding master data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_master_data()
