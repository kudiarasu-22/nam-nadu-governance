import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.database.connection import engine

def run():
    for val in ['mla', 'cm_admin', 'MLA', 'CM_ADMIN']:
        try:
            with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
                conn.execute(text(f"ALTER TYPE rolename ADD VALUE '{val}'"))
            print(f"Added '{val}' to rolename enum")
        except Exception as e:
            print(f"Error adding '{val}': {e}")

if __name__ == "__main__":
    run()
