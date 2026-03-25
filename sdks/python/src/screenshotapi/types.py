from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Optional


@dataclass
class ScreenshotOptions:
    url: str
    width: Optional[int] = None
    height: Optional[int] = None
    full_page: Optional[bool] = None
    type: Optional[Literal["png", "jpeg", "webp"]] = None
    quality: Optional[int] = None
    color_scheme: Optional[Literal["light", "dark"]] = None
    wait_until: Optional[
        Literal["load", "domcontentloaded", "networkidle0", "networkidle2"]
    ] = None
    wait_for_selector: Optional[str] = None
    delay: Optional[int] = None


@dataclass
class ScreenshotMetadata:
    credits_remaining: int
    screenshot_id: str
    duration_ms: int


@dataclass
class ScreenshotResult:
    image: bytes
    metadata: ScreenshotMetadata
    content_type: str
