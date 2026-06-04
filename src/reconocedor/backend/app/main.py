from contextlib import asynccontextmanager
from pathlib import Path
import json

import cv2
import keras
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import CASCADE_PATH, MODEL_PATH
from app.schemas import HealthResponse, PredictFrameResponse
from app.utils import load_face_detector, process_frame

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

model = None
face_detector = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, face_detector

    model = keras.saving.load_model(MODEL_PATH, compile=False, safe_mode=True)
    face_detector = load_face_detector(str(CASCADE_PATH))

    yield


app = FastAPI(
    title="Face Video Inference API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        model_loaded=model is not None,
        model_path=str(MODEL_PATH),
        cascade_path=str(CASCADE_PATH),
    )


@app.post("/api/predict/frame", response_model=PredictFrameResponse)
async def predict_frame(file: UploadFile = File(...)):
    content = await file.read()
    np_buffer = np.frombuffer(content, np.uint8)
    frame = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)

    if frame is None:
        raise HTTPException(status_code=400, detail="No se pudo decodificar la imagen")

    _, predictions = process_frame(frame, face_detector, model)
    return PredictFrameResponse(
        faces_detected=len(predictions),
        predictions=predictions,
    )


@app.websocket("/ws/predict")
async def websocket_predict(websocket: WebSocket):
    await websocket.accept()

    client_config: dict = {
        "client": "unknown",
        "format": "jpeg",
    }

    try:
        init_msg = await websocket.receive()
        if init_msg.get("text"):
            try:
                payload = json.loads(init_msg["text"])
                if isinstance(payload, dict):
                    client_config.update(payload)
            except Exception:
                pass

        await websocket.send_json({
            "type": "ready",
            "message": "WebSocket conectado",
            "config": client_config,
        })

        while True:
            frame_bytes = await websocket.receive_bytes()

            np_buffer = np.frombuffer(frame_bytes, dtype=np.uint8)
            frame = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)

            if frame is None:
                await websocket.send_json({
                    "type": "error",
                    "message": "Frame inválido",
                })
                continue

            _, predictions = process_frame(frame, face_detector, model)

            await websocket.send_json({
                "type": "prediction",
                "faces_detected": len(predictions),
                "predictions": predictions,
            })

    except WebSocketDisconnect:
        return


if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        index_file = FRONTEND_DIST / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend no compilado")