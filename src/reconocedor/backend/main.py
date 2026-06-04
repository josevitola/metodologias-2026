"""
Entry point for the Face Video Inference API.
Launches the FastAPI application defined in app.main.
"""

import uvicorn

from app.main import app

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
    )