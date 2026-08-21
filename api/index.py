import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.api.main import app

# Vercel Python Serverless Handler
# Export the FastAPI app instance as 'app'
__all__ = ["app"]
