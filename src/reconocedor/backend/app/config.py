from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "best_transfer_efficientnet.keras"
INPUT_SIZE = (224, 224)
CASCADE_PATH = Path(__import__("cv2").data.haarcascades) / "haarcascade_frontalface_default.xml"
SCALE_FACTOR = 1.1
MIN_NEIGHBORS = 5
MIN_FACE_SIZE = (60, 60)
JPEG_QUALITY = 85
CONFIDENCE_THRESHOLD = 0.0
BOX_COLOR = (0, 255, 0)
BOX_THICKNESS = 2
TEXT_SCALE = 0.7
TEXT_COLOR = (0, 255, 0)
TEXT_THICKNESS = 2