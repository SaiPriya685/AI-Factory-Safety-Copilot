"""
logger.py

Central logging utility for the AI Factory Safety Copilot.

Features:
- Console logging
- File logging
- Multiple log levels
"""

from __future__ import annotations

import logging
from pathlib import Path

from ai.utils.config import LOG_FILE, LOG_LEVEL


class Logger:
    """
    Logging utility used across the project.
    """

    _loggers = {}


    @classmethod
    def get_logger(
        cls,
        name: str = "AIFactory"
    ) -> logging.Logger:
        """
        Returns a configured logger instance.
        """


        if name in cls._loggers:

            return cls._loggers[name]


        logger = logging.getLogger(name)

        logger.setLevel(LOG_LEVEL)


        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )


        # Console handler

        console_handler = logging.StreamHandler()

        console_handler.setFormatter(
            formatter
        )


        # File handler

        file_handler = logging.FileHandler(
            filename=Path(LOG_FILE),
            encoding="utf-8",
        )

        file_handler.setFormatter(
            formatter
        )


        logger.addHandler(
            console_handler
        )

        logger.addHandler(
            file_handler
        )


        cls._loggers[name] = logger


        return logger