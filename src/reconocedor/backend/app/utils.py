from __future__ import annotations

from typing import List, Tuple

import cv2
import numpy as np
from keras.applications.efficientnet import preprocess_input

from app.config import (
    BOX_COLOR,
    BOX_THICKNESS,
    CONFIDENCE_THRESHOLD,
    INPUT_SIZE,
    MIN_FACE_SIZE,
    SCALE_FACTOR,
    MIN_NEIGHBORS,
    TEXT_COLOR,
    TEXT_SCALE,
    TEXT_THICKNESS,
)


def load_face_detector(cascade_path: str):
    detector = cv2.CascadeClassifier(str(cascade_path))
    if detector.empty():
        raise RuntimeError(f"No se pudo cargar el clasificador Haar Cascade: {cascade_path}")
    return detector


def detect_faces(frame: np.ndarray, detector) -> List[Tuple[int, int, int, int]]:
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector.detectMultiScale(
        gray,
        scaleFactor=SCALE_FACTOR,
        minNeighbors=MIN_NEIGHBORS,
        minSize=MIN_FACE_SIZE,
    )
    return list(faces)


def crop_and_normalize_face(frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> np.ndarray:
    x, y, w, h = bbox
    face = frame[y : y + h, x : x + w]
    face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
    face = cv2.resize(face, INPUT_SIZE, interpolation=cv2.INTER_AREA)
    face = face.astype("float32")
    face = preprocess_input(face)
    face = np.expand_dims(face, axis=0)
    return face


def predict_face(model, face_tensor: np.ndarray):
    pred = model.predict(face_tensor, verbose=0)
    pred = np.array(pred)

    if pred.ndim == 2:
        scores = pred[0].astype(float).tolist()
    elif pred.ndim == 1:
        scores = pred.astype(float).tolist()
    else:
        scores = pred.reshape(-1).astype(float).tolist()

    if len(scores) == 0:
        return None, None, []

    predicted_class = int(np.argmax(scores)) if len(scores) > 1 else 0
    confidence = float(np.max(scores))

    if confidence < CONFIDENCE_THRESHOLD:
        predicted_class = None

    return predicted_class, confidence, scores


def annotate_frame(frame: np.ndarray, predictions: List[dict]) -> np.ndarray:
    annotated = frame.copy()

    for item in predictions:
        x, y, w, h = item["bbox"]
        predicted_class = item["predicted_class"]
        confidence = item["confidence"]

        cv2.rectangle(
            annotated,
            (x, y),
            (x + w, y + h),
            BOX_COLOR,
            BOX_THICKNESS,
        )

        if predicted_class is None:
            label = "face"
        else:
            label = f"class={predicted_class} conf={confidence:.3f}"

        y_text = max(25, y - 10)
        cv2.putText(
            annotated,
            label,
            (x, y_text),
            cv2.FONT_HERSHEY_SIMPLEX,
            TEXT_SCALE,
            TEXT_COLOR,
            TEXT_THICKNESS,
            cv2.LINE_AA,
        )

    return annotated


def process_frame(frame: np.ndarray, detector, model):
    faces = detect_faces(frame, detector)
    predictions = []

    for bbox in faces:
        face_tensor = crop_and_normalize_face(frame, bbox)
        predicted_class, confidence, scores = predict_face(model, face_tensor)
        predictions.append(
            {
                "bbox": [int(v) for v in bbox],
                "predicted_class": predicted_class,
                "confidence": confidence,
                "scores": scores,
            }
        )

    annotated = annotate_frame(frame, predictions)
    return annotated, predictions