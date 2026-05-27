"""Fix ward_emergency_alerts schema - drop NOT NULL on legacy columns."""
import sys; sys.path.insert(0, '.')
from sqlalchemy import text, inspect
from app.database.connection import engine

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE ward_emergency_alerts ALTER COLUMN alert_level DROP NOT NULL'))
    conn.execute(text('ALTER TABLE ward_emergency_alerts ALTER COLUMN created_by_mla_id DROP NOT NULL'))
    conn.execute(text('ALTER TABLE ward_emergency_alerts ALTER COLUMN is_active DROP NOT NULL'))
    conn.commit()
    print("Dropped NOT NULL constraints from legacy columns")
    cols = inspect(engine).get_columns('ward_emergency_alerts')
    for c in cols:
        print(f"  {c['name']:30s} nullable={c['nullable']}")
