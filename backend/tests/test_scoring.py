import pytest
from backend.services.scoring import levenshtein, compute_risk_score


def test_levenshtein_identical():
    assert levenshtein("abc", "abc") == 0


def test_levenshtein_empty_strings():
    assert levenshtein("", "") == 0
    assert levenshtein("", "abc") == 3
    assert levenshtein("abc", "") == 3


def test_levenshtein_classic():
    assert levenshtein("kitten", "sitting") == 3


def test_levenshtein_single_substitution():
    assert levenshtein("cap1talone.com", "capitalone.com") == 1


def test_trusted_domain_exact_match_is_safe():
    result = compute_risk_score("https://capitalone.com")
    assert result["risk_score"] == 0.0
    assert result["flags"] == []
    assert result["matched_brand"] is None


def test_trusted_domain_with_www_is_safe():
    result = compute_risk_score("https://www.amazon.com")
    assert result["risk_score"] == 0.0


def test_typosquat_is_flagged():
    result = compute_risk_score("https://cap1talone.com")
    assert result["risk_score"] > 0
    assert any("typosquat" in f for f in result["flags"])
    assert result["matched_brand"] == "capitalone.com"


def test_typosquat_score_above_medium_threshold():
    result = compute_risk_score("https://cap1talone.com")
    assert result["risk_score"] >= 30


def test_suspicious_keywords_in_domain():
    result = compute_risk_score("https://secure-login.somerandombrand.com")
    flags = result["flags"]
    assert any("suspicious_keywords" in f for f in flags)


def test_ip_address_host_flagged():
    result = compute_risk_score("http://192.168.1.1")
    assert "ip_address_host" in result["flags"]
    assert "no_https" in result["flags"]


def test_http_scheme_adds_penalty():
    result = compute_risk_score("http://example.com")
    assert "no_https" in result["flags"]
    assert result["risk_score"] > 0


def test_score_never_exceeds_100():
    result = compute_risk_score("http://192.168.1.1/secure-login-verify-account")
    assert result["risk_score"] <= 100.0


def test_unknown_safe_looking_domain_low_score():
    result = compute_risk_score("https://myblog.io")
    assert result["risk_score"] < 30
