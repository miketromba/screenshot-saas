from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional, Union

import httpx

from .errors import (
    AuthenticationError,
    InsufficientCreditsError,
    InvalidAPIKeyError,
    ScreenshotAPIError,
    ScreenshotFailedError,
)
from .types import ScreenshotMetadata, ScreenshotOptions, ScreenshotResult

DEFAULT_BASE_URL = "https://screenshotapi.dev"
DEFAULT_TIMEOUT = 60.0


class ScreenshotAPI:
    """Client for the ScreenshotAPI service."""

    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
    ) -> None:
        if not api_key:
            raise ValueError("API key is required")
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout

    def _build_params(
        self, options: Union[ScreenshotOptions, Dict[str, Any]]
    ) -> Dict[str, str]:
        if isinstance(options, dict):
            options = ScreenshotOptions(**options)

        params: Dict[str, str] = {"url": options.url}
        if options.width is not None:
            params["width"] = str(options.width)
        if options.height is not None:
            params["height"] = str(options.height)
        if options.full_page is not None:
            params["fullPage"] = str(options.full_page).lower()
        if options.type is not None:
            params["type"] = options.type
        if options.quality is not None:
            params["quality"] = str(options.quality)
        if options.color_scheme is not None:
            params["colorScheme"] = options.color_scheme
        if options.wait_until is not None:
            params["waitUntil"] = options.wait_until
        if options.wait_for_selector is not None:
            params["waitForSelector"] = options.wait_for_selector
        if options.delay is not None:
            params["delay"] = str(options.delay)
        return params

    def _parse_metadata(self, headers: httpx.Headers) -> ScreenshotMetadata:
        return ScreenshotMetadata(
            credits_remaining=int(headers.get("x-credits-remaining", "0")),
            screenshot_id=headers.get("x-screenshot-id", ""),
            duration_ms=int(headers.get("x-duration-ms", "0")),
        )

    def _handle_error(self, response: httpx.Response) -> None:
        try:
            body = response.json()
        except Exception:
            raise ScreenshotAPIError(
                f"HTTP {response.status_code}: {response.reason_phrase}",
                response.status_code,
                "unknown_error",
            )

        message = str(body.get("error", body.get("message", "Unknown error")))

        if response.status_code == 401:
            raise AuthenticationError(message)
        elif response.status_code == 402:
            raise InsufficientCreditsError(message, int(body.get("balance", 0)))
        elif response.status_code == 403:
            raise InvalidAPIKeyError(message)
        elif response.status_code == 500:
            raise ScreenshotFailedError(
                str(body.get("message", body.get("error", "Screenshot failed")))
            )
        else:
            raise ScreenshotAPIError(message, response.status_code, "unknown_error")

    def screenshot(
        self, options: Union[ScreenshotOptions, Dict[str, Any]]
    ) -> ScreenshotResult:
        """Take a screenshot synchronously. Returns image bytes and metadata."""
        params = self._build_params(options)
        with httpx.Client(timeout=self._timeout) as client:
            response = client.get(
                f"{self._base_url}/api/v1/screenshot",
                params=params,
                headers={"x-api-key": self._api_key},
            )

        if response.status_code >= 400:
            self._handle_error(response)

        return ScreenshotResult(
            image=response.content,
            metadata=self._parse_metadata(response.headers),
            content_type=response.headers.get("content-type", "image/png"),
        )

    async def async_screenshot(
        self, options: Union[ScreenshotOptions, Dict[str, Any]]
    ) -> ScreenshotResult:
        """Take a screenshot asynchronously. Returns image bytes and metadata."""
        params = self._build_params(options)
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.get(
                f"{self._base_url}/api/v1/screenshot",
                params=params,
                headers={"x-api-key": self._api_key},
            )

        if response.status_code >= 400:
            self._handle_error(response)

        return ScreenshotResult(
            image=response.content,
            metadata=self._parse_metadata(response.headers),
            content_type=response.headers.get("content-type", "image/png"),
        )

    def save(
        self,
        options: Union[ScreenshotOptions, Dict[str, Any]],
        path: Union[str, Path],
    ) -> ScreenshotMetadata:
        """Take a screenshot and save it to a file. Returns metadata."""
        result = self.screenshot(options)
        Path(path).write_bytes(result.image)
        return result.metadata

    async def async_save(
        self,
        options: Union[ScreenshotOptions, Dict[str, Any]],
        path: Union[str, Path],
    ) -> ScreenshotMetadata:
        """Take a screenshot asynchronously and save it to a file."""
        result = await self.async_screenshot(options)
        Path(path).write_bytes(result.image)
        return result.metadata
