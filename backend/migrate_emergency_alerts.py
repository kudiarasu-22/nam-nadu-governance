"""
Nam Nadu — Emergency Alert Table Migration
Fixes ward_emergency_alerts schema on the production PostgreSQL database.
The table was created before leadership models were included in init_db,
causing missing columns that break the MLA alerts API.

Run: python migrate_emergency_alerts.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text, inspect
from app.database.connection import engine, Base
import app.models.leadership  # noqa - registers models


def migrate():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"Tables in DB: {[t for t in tables if 'ward' in t or 'mla' in t or 'cm_' in t]}")

    with engine.connect() as conn:
        if "ward_emergency_alerts" not in tables:
            print("Table does not exist — creating from scratch...")
            Base.metadata.create_all(
                bind=engine,
                tables=[Base.metadata.tables["ward_emergency_alerts"]]
            )
            conn.commit()
            print("Created ward_emergency_alerts table successfully.")
            return

        # Table exists — check columns
        existing_cols = {col["name"] for col in inspector.get_columns("ward_emergency_alerts")}
        print(f"Existing columns: {sorted(existing_cols)}")

        needed = {
            "mla_profile_id": "ALTER TABLE ward_emergency_alerts ADD COLUMN IF NOT EXISTS mla_profile_id INTEGER REFERENCES mla_profiles(id)",
            "ward_id":         "ALTER TABLE ward_emergency_alerts ADD COLUMN IF NOT EXISTS ward_id INTEGER REFERENCES wards(id)",
            "title":           "ALTER TABLE ward_emergency_alerts ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT 'Alert'",
            "description":     "ALTER TABLE ward_emergency_alerts ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''",
            "level":           "ALTER TABLE ward_emergency_alerts ADD COLUMN IF NOT EXISTS level VARCHAR(50) NOT NULL DEFAULT 'medium'",
            "status":          "ALTER TABLE ward_emergency_alerts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'",
            "created_at":      "ALTER TABLE ward_emergency_alerts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
            "updated_at":      "ALTER TABLE ward_emergency_alerts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()",
            "is_deleted":      "ALTER TABLE ward_emergency_alerts ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE",
        }

        ran = 0
        for col, sql in needed.items():
            if col not in existing_cols:
                print(f"  Adding column: {col}")
                conn.execute(text(sql))
                ran += 1
            else:
                print(f"  OK: {col}")

        conn.commit()

        if ran == 0:
            print("\nNo migrations needed — schema is already up to date.")
        else:
            print(f"\nMigration complete: {ran} column(s) added.")

        # Verify
        new_cols = sorted(c["name"] for c in inspect(engine).get_columns("ward_emergency_alerts"))
        print(f"Final columns: {new_cols}")


if __name__ == "__main__":
    migrate()
