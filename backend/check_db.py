import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.master import District, Ward, Area

db = SessionLocal()
print("Districts:")
for d in db.query(District).limit(5).all():
    print(f" - {d.id}: {d.name}")

print("\nWards for District 1:")
for w in db.query(Ward).filter(Ward.district_id == 1).limit(5).all():
    print(f" - {w.id}: {w.ward_name} (dist: {w.district_id})")

print("\nAreas for Ward 1:")
for a in db.query(Area).filter(Area.ward_id == 1).limit(5).all():
    print(f" - {a.id}: {a.name} (ward: {a.ward_id})")
