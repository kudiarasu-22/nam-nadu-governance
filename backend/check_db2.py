import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy.orm import Session
from app.database.connection import SessionLocal
from app.models.master import District, Ward, Area, ComplaintCategory

db = SessionLocal()
print("Districts:")
districts = db.query(District).all()
for d in districts:
    print(f" - ID: {d.id} | Name: {d.name}")

print("\nWards count per District:")
for d in districts:
    count = db.query(Ward).filter(Ward.district_id == d.id).count()
    if count > 0:
        print(f" - {d.name} (ID: {d.id}): {count} wards")

print("\nCategories Count:")
print(db.query(ComplaintCategory).count())
