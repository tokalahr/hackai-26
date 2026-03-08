import os
from typing import Any

import requests


def _base_url() -> str:
    return os.getenv("NEBULA_BASE_URL", "https://api.utdnebula.com").rstrip("/")


def _headers() -> dict[str, str]:
    api_key = os.getenv("NEBULA_API_KEY", "").strip()
    headers: dict[str, str] = {}
    if api_key:
        headers["x-api-key"] = api_key
    return headers


def nebula_get(path: str, params: dict[str, Any] | None = None, timeout: int = 10) -> requests.Response:
    url = f"{_base_url()}{path}"
    return requests.get(url, params=params, headers=_headers(), timeout=timeout)
