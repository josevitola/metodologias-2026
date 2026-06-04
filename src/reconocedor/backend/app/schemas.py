from pydantic import BaseModel
from typing import List, Optional


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_path: str
    cascade_path: str


class PredictionItem(BaseModel):
    bbox: List[int]
    predicted_class: Optional[int] = None
    confidence: Optional[float] = None
    scores: List[float]


class PredictFrameResponse(BaseModel):
    faces_detected: int
    predictions: List[PredictionItem]