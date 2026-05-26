"""
Nam Nadu — Logging Configuration
Structured logging with request-level context.
"""
import logging
import sys


def setup_logging() -> logging.Logger:
    """Configure and return the application logger."""
    logger = logging.getLogger("nam_nadu")
    logger.setLevel(logging.INFO)

    # Prevent duplicate handlers on reload
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            "[%(asctime)s] %(levelname)s [%(name)s.%(funcName)s:%(lineno)d] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


# Application-wide logger
logger = setup_logging()
