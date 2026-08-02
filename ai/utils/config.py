"""
config.py

Central configuration file for the AI Factory Safety Copilot.

All project-wide constants and settings are defined here.
"""

from pathlib import Path

# =============================================================================
# PROJECT PATHS
# =============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODELS_DIR = BASE_DIR / "models"      # Python files
WEIGHTS_DIR = BASE_DIR / "weights"    # AI model files
OUTPUTS_DIR = BASE_DIR / "outputs"

VIOLATIONS_DIR = OUTPUTS_DIR / "violations"
RECORDINGS_DIR = OUTPUTS_DIR / "recordings"
LOGS_DIR = OUTPUTS_DIR / "logs"

# Create output folders automatically
for folder in [
    OUTPUTS_DIR,
    VIOLATIONS_DIR,
    RECORDINGS_DIR,
    LOGS_DIR,
]:
    folder.mkdir(parents=True, exist_ok=True)

# =============================================================================
# CAMERA SETTINGS
# =============================================================================

CAMERA_ID = 0

FRAME_WIDTH = 1280
FRAME_HEIGHT = 720

SHOW_FPS = True

# =============================================================================
# YOLO MODEL PATHS
# =============================================================================

PERSON_MODEL = WEIGHTS_DIR / "yolo11n.pt"


SAFETY_MODEL = WEIGHTS_DIR / "factory_safety.pt"
FACTORY_MODEL = WEIGHTS_DIR / "yolo11n.pt"

HELMET_MODEL = WEIGHTS_DIR / "yolo11n.pt"

FIRE_MODEL = WEIGHTS_DIR / "yolo11n.pt"

SMOKE_MODEL = WEIGHTS_DIR / "yolo11n.pt"

# =============================================================================
# DETECTION SETTINGS
# =============================================================================

CONFIDENCE_THRESHOLD = 0.50

IOU_THRESHOLD = 0.45

MAX_DETECTIONS = 100

# =============================================================================
# TRACKING SETTINGS
# =============================================================================

ENABLE_TRACKING = True

TRACKER_NAME = "bytetrack"

# =============================================================================
# ALERT SETTINGS
# =============================================================================

SAVE_SCREENSHOT = True

SAVE_VIDEO = True

VIDEO_BUFFER_SECONDS = 10

ENABLE_SOUND_ALERT = True

# =============================================================================
# API SETTINGS
# =============================================================================

BACKEND_URL = "https://ai-factory-safety-copilot.onrender.com"

VIOLATION_API = "/api/violations"

ALERT_API = "/api/alerts"

# =============================================================================
# GEMINI SETTINGS
# =============================================================================

GEMINI_MODEL = "gemini-2.5-flash"

# Read from environment variable later
GEMINI_API_KEY = ""

# =============================================================================
# RISK SCORE SETTINGS
# =============================================================================

INITIAL_RISK_SCORE = 100

HELMET_PENALTY = 10

VEST_PENALTY = 10

GLOVE_PENALTY = 5

SHOE_PENALTY = 5

DANGER_ZONE_PENALTY = 20

FALL_PENALTY = 40

FIRE_PENALTY = 50

# =============================================================================
# COLORS (BGR for OpenCV)
# =============================================================================

GREEN = (0, 255, 0)

RED = (0, 0, 255)

YELLOW = (0, 255, 255)

BLUE = (255, 0, 0)

WHITE = (255, 255, 255)

BLACK = (0, 0, 0)

# =============================================================================
# DANGER ZONE
# =============================================================================

# Placeholder polygon
# Will be updated dynamically later
DEFAULT_DANGER_ZONE = [
    (300, 150),
    (1000, 150),
    (1000, 650),
    (300, 650),
]

# =============================================================================
# MACHINE HEALTH LIMITS
# =============================================================================

MAX_TEMPERATURE = 75

MAX_HUMIDITY = 80

MAX_GAS_LEVEL = 50

MAX_VIBRATION = 70

# =============================================================================
# LOGGING
# =============================================================================

LOG_LEVEL = "DEBUG"

LOG_FILE = LOGS_DIR / "system.log"

# =============================================================================
# WINDOW
# =============================================================================

WINDOW_NAME = "AI Factory Safety Copilot"
