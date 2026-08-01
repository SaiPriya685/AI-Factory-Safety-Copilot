"""
model_loader.py

Centralized YOLO model loader for AI Factory Safety Copilot.

Features
--------
✓ Singleton Model Loader
✓ Loads model only once
✓ Supports multiple YOLO models
✓ Automatic validation
✓ Logging support
"""

from pathlib import Path
from ultralytics import YOLO

from ai.utils.logger import Logger

logger = Logger.get_logger("ModelLoader")


class ModelLoader:
    """
    Loads and caches YOLO models.
    """

    _loaded_models = {}

    @classmethod
    def load_model(cls, model_path: str | Path):
        """
        Load a YOLO model.

        Parameters
        ----------
        model_path : str | Path

        Returns
        -------
        YOLO
        """

        model_path = Path(model_path)

        if not model_path.exists():
            logger.error(f"Model not found: {model_path}")
            raise FileNotFoundError(model_path)

        if model_path in cls._loaded_models:
            logger.info(f"Using cached model: {model_path.name}")
            return cls._loaded_models[model_path]

        logger.info(f"Loading model: {model_path.name}")

        model = YOLO(model_path)

        cls._loaded_models[model_path] = model

        logger.info(f"Loaded model successfully: {model_path.name}")

        return model

    @classmethod
    def unload_all(cls):
        """
        Clear cached models.
        """

        cls._loaded_models.clear()

        logger.info("All models unloaded.")

    @classmethod
    def loaded_models(cls):
        """
        Returns loaded model names.
        """

        return list(cls._loaded_models.keys())