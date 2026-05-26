"""
Nam Nadu — Password Hashing
Re-exports from core.security for backward-compat imports.
"""
from app.core.security import hash_password, verify_password

__all__ = ["hash_password", "verify_password"]
