import httpx
from ..config import settings

_API_URL = "https://safebrowsing.googleapis.com/v4/threatMatches:find"


async def check_safe_browsing(url: str) -> bool:
    """Returns True if Google Safe Browsing flags the URL. Silently returns False if key is unset or request fails."""
    if not settings.SAFE_BROWSING_API_KEY:
        return False
    payload = {
        "client": {"clientId": "authguard", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(_API_URL, params={"key": settings.SAFE_BROWSING_API_KEY}, json=payload)
            resp.raise_for_status()
            return bool(resp.json().get("matches"))
    except Exception:
        return False
