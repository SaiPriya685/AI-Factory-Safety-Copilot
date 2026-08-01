"""
logger.py

Central logging module for AI Factory Safety Copilot.
Provides reusable logging across all modules.
"""

import logging
import sys
from pathlib import Path

from .config import LOG_FILE, LOG_LEVEL


class LoggerManager:
    """Creates and manages project-wide loggers."""

    _logger = None

    @classmethod
    def get_logger(cls, name: str = "AIFactory") -> logging.Logger:
        """
        Returns a configured logger instance.

        Args:
            name: Logger name.

        Returns:
            logging.Logger
        """

        if cls._logger:
            return cls._logger

        logger = logging.getLogger(name)
        logger.setLevel(getattr(logging, LOG_LEVEL.upper(), logging.INFO))
        logger.propagate = False

        if logger.handlers:
            return logger

        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )

        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        console_handler.setLevel(logging.INFO)

        file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
        file_handler.setFormatter(formatter)
        file_handler.setLevel(logging.DEBUG)

        logger.addHandler(console_handler)
        logger.addHandler(file_handler)

        cls._logger = logger
        return logger


logger = LoggerManager.get_logger()