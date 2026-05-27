"""
Nam Nadu — Master Data Seed Script (Enriched)
"""
import sys
import os
import random

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
        print("Seeding Enriched Master Data...")
        
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
        dept_trans  = get_or_create_dept("Transport Department")
        dept_police = get_or_create_dept("Traffic Police")
        dept_forest = get_or_create_dept("Forest Department")

        # 2. Complaint Categories
        categories = [
            {"name": "Road Damage", "icon": "road", "department_id": dept_pwd.id, "priority": "high", "sla": 48},
            {"name": "Garbage Issue", "icon": "trash", "department_id": dept_gc.id, "priority": "medium", "sla": 24},
            {"name": "Water Leakage", "icon": "droplets", "department_id": dept_water.id, "priority": "urgent", "sla": 24},
            {"name": "Drainage Problem", "icon": "waves", "department_id": dept_water.id, "priority": "high", "sla": 48},
            {"name": "Street Light Issue", "icon": "lightbulb", "department_id": dept_elec.id, "priority": "medium", "sla": 72},
            {"name": "Electricity Problem", "icon": "zap", "department_id": dept_elec.id, "priority": "urgent", "sla": 24},
            {"name": "Sewage Overflow", "icon": "waves", "department_id": dept_water.id, "priority": "urgent", "sla": 12},
            {"name": "Public Transport Issue", "icon": "bus", "department_id": dept_trans.id, "priority": "low", "sla": 120},
            {"name": "Illegal Dumping", "icon": "trash-2", "department_id": dept_gc.id, "priority": "medium", "sla": 72},
            {"name": "Encroachment", "icon": "shield-alert", "department_id": dept_pwd.id, "priority": "low", "sla": 168},
            {"name": "Tree Damage", "icon": "tree", "department_id": dept_forest.id, "priority": "medium", "sla": 48},
            {"name": "Public Safety", "icon": "alert-triangle", "department_id": dept_police.id, "priority": "urgent", "sla": 4},
            {"name": "Government Scheme Issue", "icon": "file-text", "department_id": dept_health.id, "priority": "low", "sla": 168},
            {"name": "Corruption Complaint", "icon": "briefcase", "department_id": dept_police.id, "priority": "high", "sla": 168},
            {"name": "Noise Pollution", "icon": "volume-x", "department_id": dept_police.id, "priority": "medium", "sla": 24},
            {"name": "Animal Issue", "icon": "twitter", "department_id": dept_health.id, "priority": "medium", "sla": 48},
            {"name": "Park Maintenance", "icon": "sun", "department_id": dept_pwd.id, "priority": "low", "sla": 120},
            {"name": "Sanitation Problem", "icon": "wind", "department_id": dept_health.id, "priority": "high", "sla": 24},
        ]
        
        for cat_data in categories:
            cat = db.query(ComplaintCategory).filter(ComplaintCategory.name == cat_data["name"]).first()
            if not cat:
                db.add(ComplaintCategory(
                    name=cat_data["name"],
                    icon=cat_data["icon"],
                    department_id=cat_data["department_id"],
                    priority_default=cat_data["priority"],
                    sla_hours=cat_data["sla"],
                    severity_level=cat_data["priority"],
                    requires_photo=cat_data["priority"] in ["high", "urgent"],
                    citizen_visibility=True,
                    estimated_resolution_hours=cat_data["sla"],
                    auto_assign_enabled=True
                ))
        db.commit()

        # 3. Districts
        districts_data = [
            ("Chennai", "TN-02", 13.0827, 80.2707),
            ("Coimbatore", "TN-38", 11.0168, 76.9558),
            ("Madurai", "TN-59", 9.9252, 78.1198),
            ("Tiruchirappalli", "TN-45", 10.7905, 78.7047),
            ("Salem", "TN-30", 11.6643, 78.1460),
            ("Tirunelveli", "TN-72", 8.7139, 77.7567),
            ("Erode", "TN-33", 11.3410, 77.7172),
            ("Thanjavur", "TN-49", 10.7870, 79.1378),
            ("Vellore", "TN-23", 12.9165, 79.1325),
            ("Kanchipuram", "TN-21", 12.8185, 79.6947),
            ("Tiruppur", "TN-39", 11.1085, 77.3411),
            ("Dindigul", "TN-57", 10.3673, 77.9803),
            ("Nagapattinam", "TN-51", 10.7672, 79.8433),
            ("Cuddalore", "TN-31", 11.7480, 79.7714),
            ("Thoothukudi", "TN-69", 8.7642, 78.1348),
        ]

        district_objs = {}
        for d_name, d_code, lat, lng in districts_data:
            d = db.query(District).filter(District.name == d_name).first()
            if not d:
                d = District(name=d_name, district_code=d_code, latitude=lat, longitude=lng)
                db.add(d)
                db.commit()
                db.refresh(d)
            district_objs[d_name] = d

        def add_hierarchy(district, ward_num, ward_name, zone, areas_dict):
            try:
                w = db.query(Ward).filter(Ward.district_id == district.id, Ward.ward_number == ward_num).first()
                if not w:
                    w = Ward(ward_number=ward_num, ward_name=ward_name, district_id=district.id, zone=zone, latitude=district.latitude, longitude=district.longitude)
                    db.add(w)
                    db.commit()
                    db.refresh(w)
                
                for area_name, streets in areas_dict.items():
                    a = db.query(Area).filter(Area.ward_id == w.id, Area.name == area_name).first()
                    if not a:
                        a = Area(name=area_name, ward_id=w.id, pincode="600000", latitude=district.latitude, longitude=district.longitude)
                        db.add(a)
                        db.commit()
                        db.refresh(a)
                    
                    for street in streets:
                        ld = db.query(LocationDetail).filter(LocationDetail.area_id == a.id, LocationDetail.street_name == street).first()
                        if not ld:
                            db.add(LocationDetail(area_id=a.id, street_name=street, landmark=f"Near {street} Landmark", pincode="600000", latitude=district.latitude, longitude=district.longitude))
                    db.commit()
            except Exception as e:
                print(f"Error in add_hierarchy for district {district.name}, ward {ward_num}: {e}")
                db.rollback()

        # Hardcoded Data for Chennai
        chennai_wards = {
            "T Nagar": {"Pondy Bazaar": ["North Usman Road", "South Usman Road", "GN Chetty Road", "Venkatnarayana Road", "Panagal Park"], "West Mambalam": ["Lake View Road", "Arya Gowda Road", "Postal Colony", "Brindavan Street", "Station Road"]},
            "Anna Nagar": {"Anna Nagar East": ["2nd Avenue", "Shanthi Colony", "Blue Star", "Chinthamani", "Tower Park"], "Anna Nagar West": ["Thirumangalam", "18th Main Road", "Jawaharlal Nehru Road", "Kovarthanagiri", "Padi Flyover"]},
            "Adyar": {"Indira Nagar": ["1st Avenue", "2nd Avenue", "Water Tank Road", "Hindu Senior Sec School Road", "LB Road"], "Kasturba Nagar": ["3rd Cross Street", "Main Road", "Canal Bank Road", "Madhya Kailash", "Sardar Patel Road"]},
            "Velachery": {"Vijayanagar": ["Bypass Road", "100 Feet Road", "Taramani Link Road", "Baby Nagar", "Dhandeeswaram"], "Guindy": ["Race Course Road", "GST Road", "Kathipara", "Ekkaduthangal", "Olympia Tech Park"]},
            "Tambaram": {"East Tambaram": ["Camp Road", "Selaiyur", "Rajakilpakkam", "Madambakkam", "Air Force Station Road"], "West Tambaram": ["Mudichur Road", "Krishna Nagar", "Gandhi Road", "Mepz", "Sanatorium"]},
            "Kodambakkam": {"Trustpuram": ["Arcot Road", "Rangarajapuram", "United India Colony", "Power House", "Vadapalani"], "Ashok Nagar": ["11th Avenue", "4th Avenue", "Pudhur", "Udhayam Theatre Road", "Pillar"]},
            "Royapuram": {"Kasimedu": ["Fishing Harbour", "Suryanarayana Street", "NTO Kuppam", "Kalmandapam", "Royapuram Bridge"], "Washermanpet": ["Mint Street", "GA Road", "TH Road", "Cemetery Road", "Old Washermanpet"]},
            "Mylapore": {"Luz": ["Luz Church Road", "Kutchery Road", "Santhome High Road", "Mandaveli", "RK Salai"], "Alwarpet": ["TTK Road", "CP Ramaswamy Road", "St Marys Road", "Eldams Road", "Poes Garden"]},
        }
        for i, (w_name, a_dict) in enumerate(chennai_wards.items()):
            add_hierarchy(district_objs["Chennai"], f"W-{100+i}", w_name, f"Zone {1+i}", a_dict)

        # Hardcoded Data for Coimbatore
        coimbatore_wards = {
            "Gandhipuram": {"Cross Cut": ["100 Feet Road", "Ramnagar", "Town Bus Stand Road", "Bharathiar Road", "Sivananda Colony"], "Tatabad": ["Dr Rajendra Prasad Road", "Azhagesan Road", "Power House Road", "Senguptha Street", "Gokhale Street"]},
            "Peelamedu": {"Hopes College": ["Avinashi Road", "Tidel Park Road", "Sitra", "KMCH Road", "Civil Aerodrome Post"], "Cheran Ma Nagar": ["Vilankurichi Road", "Thaneerpandal", "VK Road", "Bharathi Nagar", "Meena Estate"]},
            "RS Puram": {"DB Road": ["TV Samy Road", "Cowley Brown Road", "Thadagam Road", "Ponnaiyarajapuram", "Chokkampudur"], "Saibaba Colony": ["NSR Road", "Kavundampalayam", "Mettupalayam Road", "KK Pudur", "Vadavalli Road"]},
            "Townhall": {"Ukkadam": ["Oppanakara Street", "Raja Street", "Big Bazaar Street", "Sungam", "Valankulam Road"], "Kottaimedu": ["Nanjappa Road", "Lanka Corner", "Goods Shed Road", "Railway Station Road", "Vincent Road"]},
            "Saravanampatti": {"CHIL SEZ": ["Sathy Road", "Kalapatti", "Kurumbapalayam", "Kovilpalayam", "Keeranatham"], "Sivanandapuram": ["Viswasapuram", "Thudiyalur Road", "Ramakrishnapuram", "Vellakinar", "KGISL Road"]},
            "Singanallur": {"Ondipudur": ["Trichy Road", "Kamatchipuram", "Boat House Road", "Vellalore Road", "SIHS Colony"], "Ramanathapuram": ["Nanjundapuram", "Puliakulam", "Meena Estate", "Red Fields", "Race Course"]},
            "Thudiyalur": {"GN Mills": ["MTP Road", "Vellakinar Pirivu", "Subramaniampalayam", "Appanaickenpalayam", "Kavundampalayam"], "Vadavalli": ["Marudhamalai Road", "Navavoor", "Kalveerampalayam", "PN Pudur", "Bommanampalayam"]},
            "Kuniamuthur": {"Kovaipudur": ["Palakkad Road", "Sundarapuram", "Sugunapuram", "BK Pudur", "Madukkarai"], "Podanur": ["Chettipalayam Road", "Nanjundapuram", "Kurichi", "Vellalore", "Echanari"]},
        }
        for i, (w_name, a_dict) in enumerate(coimbatore_wards.items()):
            add_hierarchy(district_objs["Coimbatore"], f"W-{40+i}", w_name, f"Zone {1+i}", a_dict)

        # Hardcoded Data for Madurai
        madurai_wards = {
            "KK Nagar": {"North": ["80 Feet Road", "Lake View Road", "Melur Road", "Mattuthavani", "Kuruvikaran Salai"], "South": ["Apollo Road", "Gomathipuram", "Tahsildar Nagar", "Vandiyur", "Sadasiva Nagar"]},
            "Anna Nagar": {"Main": ["Suguna Store Road", "Ambika Theatre Road", "Shenoy Nagar", "Gandhi Museum Road", "Tallakulam"], "Gomathipuram": ["Kamarajar Salai", "Teppakulam", "Munichalai", "Keezhaveli Veedhi", "Yanaikkal"]},
            "Simmakkal": {"Central": ["North Veli Street", "South Veli Street", "East Veli Street", "West Veli Street", "Meenakshi Bazaar"], "Goripalayam": ["Panagal Road", "Albert Victor Bridge", "Kalpalam Road", "Sellur", "Thathaneri"]},
            "Tiruparankundram": {"Harveypatti": ["GST Road", "Thirunagar", "Vilachery", "Pasumalai", "Palanganatham"], "TVS Nagar": ["Bypass Road", "Jaihindpuram", "Subramaniapuram", "Villapuram", "Aruppukottai Road"]},
            "K Pudur": {"Reserve Line": ["Alagar Kovil Road", "Moondrumavadi", "Iyer Bungalow", "Othakadai", "Narayanapuram"], "Surya Nagar": ["Kosalai", "Parasuramanpatti", "Mahathma Gandhi Nagar", "Viswanathapuram", "Bank Colony"]},
            "Velliveethiyar": {"Aarapalayam": ["Cross Road", "Ponnagaram", "Arasaradi", "Kalavasal", "Bypass Road"], "Ellis Nagar": ["Railway Colony", "Kennet Hospital Road", "Kari Medu", "Pethaniapuram", "Kochadai"]},
            "Villapuram": {"Housing Board": ["Aruppukottai Main Road", "Avaniyapuram", "Perungudi", "Airport Road", "Chinthamani"], "South Gate": ["Crimian Branch Road", "Kamarajapuram", "Keeraithurai", "Mahal Area", "Nelpettai"]},
            "Tallakulam": {"Chokkikulam": ["Gokhale Road", "Race Course", "PT Rajan Road", "Narimedu", "BBulam"], "Bibikulam": ["Viswanathapuram", "Reserve Line", "Naganakulam", "Kannanendhal", "Parasuramanpatti"]},
        }
        for i, (w_name, a_dict) in enumerate(madurai_wards.items()):
            add_hierarchy(district_objs["Madurai"], f"W-{30+i}", w_name, f"Zone {1+i}", a_dict)

        # Hardcoded Data for Tiruchirappalli
        trichy_wards = {
            "Srirangam": {"Temple Area": ["Amma Mandapam Road", "Gandhi Road", "East Chitra Street", "South Uthira Street", "TVS Tollgate"], "Thiruvanaikaval": ["Trunk Road", "Sannathi Street", "Akilandeswari Nagar", "Kollidam Tollgate", "No 1 Tollgate"]},
            "Thillai Nagar": {"Main": ["1st Cross", "7th Cross", "10th Cross", "Salai Road", "Shastri Road"], "Tennur": ["High Road", "Anna Nagar", "Uzhavar Sandhai", "Puthur", "Bishop Heber Road"]},
            "Cantonment": {"Central": ["Williams Road", "McDonalds Road", "Lawsons Road", "Promenade Road", "Bharathiar Salai"], "Woraiyur": ["Raja Colony", "Geethapuram", "Salai Road", "Lingam Nagar", "Srinivasa Nagar"]},
            "K K Nagar": {"Airport Road": ["Sundar Nagar", "LIC Colony", "Simco Meter Road", "TVS Tollgate", "Gundur"], "Khajamalai": ["Anna Stadium Road", "Race Course", "Bharathidasan University Road", "Edamalaipatti Pudur", "Crawford"]},
            "Palakkarai": {"Bazaar": ["Gandhi Market", "Big Bazaar Street", "Nandhi Kovil Street", "West Boulevard Road", "East Boulevard Road"], "Varaganeri": ["Tanjore Road", "Kamaraj Nagar", "Ariyamangalam", "Kattur", "Thiruverumbur"]},
            "Ponmalai": {"Railway Colony": ["Golden Rock", "Kalkandarkottai", "Subramaniapuram", "Senthaneerpuram", "Sangiliandapuram"], "Kattur": ["Pappakurichi", "Kailash Nagar", "Balaji Nagar", "Ganesh Nagar", "Kamaraj Nagar"]},
            "K Sathanur": {"Olakur": ["Ring Road", "Panchapur", "Ramji Nagar", "Dheeran Nagar", "Somarasampettai"], "Kuzhumani": ["Vayalur Road", "Uyyakondan Thirumalai", "Srinivasa Nagar", "Renga Nagar", "Vasan Nagar"]},
            "Mannachanallur": {"Samayapuram": ["Toll Plaza Road", "Temple Road", "Koothur", "Pichandarkovil", "Sirugambur"], "Lalgudi": ["Poovalur Road", "Anbil Road", "Mandurai", "Angarai", "Pudukudi"]}
        }
        for i, (w_name, a_dict) in enumerate(trichy_wards.items()):
            add_hierarchy(district_objs["Tiruchirappalli"], f"W-{50+i}", w_name, f"Zone {1+i}", a_dict)


        # Programmatic Generator for the remaining 11 districts
        remaining_districts = ["Salem", "Tirunelveli", "Erode", "Thanjavur", "Vellore", "Kanchipuram", "Tiruppur", "Dindigul", "Nagapattinam", "Cuddalore", "Thoothukudi"]
        
        prefixes = ["Sri", "Vellai", "Pudhu", "Pazhaya", "Keezha", "Mela", "Kovil", "Periya", "Chinna", "Thiru"]
        roots = ["Nagar", "Puram", "Palayam", "Kurichi", "Kottai", "Patti", "Kulam", "Ur", "Pettai", "Valai"]
        street_types = ["Main Road", "Cross Street", "Salai", "Veedhi", "Avenue", "Bypass", "Ring Road"]
        
        def generate_name():
            return f"{random.choice(prefixes)} {random.choice(roots)}"
            
        def generate_street():
            return f"{random.choice(['Gandhi', 'Nehru', 'Kamarajar', 'Anna', 'Bharathi', 'Bose', 'Valluvar', 'Kalaignar', 'MGR', 'Kalam'])} {random.choice(street_types)}"

        for d_name in remaining_districts:
            district = district_objs[d_name]
            # Each district gets 10 realistic wards
            for w_idx in range(1, 11):
                ward_name = generate_name()
                
                # Each ward gets 6 areas
                areas_dict = {}
                for a_idx in range(1, 7):
                    area_name = generate_name()
                    # Each area gets 5 streets
                    streets = [generate_street() for _ in range(5)]
                    areas_dict[area_name] = streets
                    
                add_hierarchy(district, f"W-{w_idx:03d}", ward_name, f"Zone {w_idx % 4 + 1}", areas_dict)

        print("  -> Master Data Enriched and Seeded Successfully.")
        print("  -> Inserted 18 Categories, 15 Districts, ~120 Wards, ~700 Areas, ~3500 Streets.")
    except Exception as e:
        print(f"Error seeding master data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_master_data()
