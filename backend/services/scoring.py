import re
from urllib.parse import urlparse
from ..config import settings

_SUSPICIOUS_KEYWORDS = frozenset({
    "login", "signin", "secure", "verify", "account", "update", "confirm",
    "banking", "wallet", "password", "credential", "auth", "support",
})


def levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    m, n = len(a), len(b)
    dp = list(range(n + 1))
    for i in range(1, m + 1):
        prev, dp[0] = dp[:], i
        for j in range(1, n + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            dp[j] = min(dp[j] + 1, dp[j - 1] + 1, prev[j - 1] + cost)
    return dp[n]


def find_closest_brand(domain: str) -> tuple[str | None, float]:
    """Return (brand, similarity) where similarity is 0-1; 1.0 = identical."""
    best_brand, best_sim = None, 0.0
    for brand in settings.PROTECTED_BRANDS:
        b = brand.lower().removeprefix("www.")
        dist = levenshtein(domain, b)
        max_len = max(len(domain), len(b))
        sim = 1.0 - dist / max_len if max_len else 1.0
        if sim > best_sim:
            best_sim, best_brand = sim, brand
    return best_brand, best_sim


def compute_risk_score(url: str) -> dict:
    """
    Returns dict with: risk_score (0-100), flags (list[str]), matched_brand (str|None).
    Score bands: 0-30 low, 30-60 medium, 60-100 high risk.
    """
    try:
        parsed = urlparse(url if "://" in url else f"https://{url}")
        hostname = (parsed.hostname or "").lower()
    except Exception:
        return {"risk_score": 100.0, "flags": ["invalid_url"], "matched_brand": None}

    domain = hostname.removeprefix("www.")
    flags: list[str] = []
    score = 0.0

    exact = {b.lower().removeprefix("www.") for b in settings.PROTECTED_BRANDS}
    if domain in exact:
        return {"risk_score": 0.0, "flags": [], "matched_brand": None}

    matched_brand, similarity = find_closest_brand(domain)
    if similarity >= settings.LEVENSHTEIN_THRESHOLD:
        score += similarity * 60  # up to 60 pts
        flags.append(f"typosquat:{matched_brand}")
    else:
        matched_brand = None

    parts = set(re.split(r"[.\-_]", domain))
    hits = _SUSPICIOUS_KEYWORDS & {p.lower() for p in parts}
    if hits:
        score += min(len(hits) * 10, 20)
        flags.append(f"suspicious_keywords:{','.join(sorted(hits))}")

    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", hostname):
        score += 25
        flags.append("ip_address_host")

    if hostname.count(".") > 3:
        score += 10
        flags.append("excessive_subdomains")

    if parsed.scheme == "http":
        score += 10
        flags.append("no_https")

    return {
        "risk_score": round(min(score, 100.0), 2),
        "flags": flags,
        "matched_brand": matched_brand,
    }
