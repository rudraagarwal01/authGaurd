def test_check_trusted_domain_returns_zero_risk(client):
    resp = client.post("/check", json={"url": "https://google.com"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["risk_score"] == 0.0
    assert data["flags"] == []
    assert data["safe_browsing_hit"] is False


def test_check_phishing_domain_returns_risk(client):
    resp = client.post("/check", json={"url": "https://g00gle.com"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["risk_score"] > 0
    assert len(data["flags"]) > 0


def test_check_response_has_required_fields(client):
    resp = client.post("/check", json={"url": "https://example.com"})
    assert resp.status_code == 200
    data = resp.json()
    for field in ("url", "domain", "risk_score", "flags", "safe_browsing_hit"):
        assert field in data


def test_check_domain_field_strips_scheme(client):
    resp = client.post("/check", json={"url": "https://example.com/some/path"})
    assert resp.status_code == 200
    assert resp.json()["domain"] == "example.com"


def test_check_persists_and_deduplicates_domain(client):
    url = "https://unique-check-target.com"
    resp1 = client.post("/check", json={"url": url})
    resp2 = client.post("/check", json={"url": url})
    assert resp1.status_code == resp2.status_code == 200
    # Same risk score for same URL
    assert resp1.json()["risk_score"] == resp2.json()["risk_score"]
    # Only one DB record — verify via domains list
    domains_resp = client.get("/domains", params={"search": "unique-check-target.com"})
    assert domains_resp.json()["total"] == 1


def test_check_high_risk_domain_appears_in_domains_list(client):
    client.post("/check", json={"url": "https://cap1talone.com"})
    resp = client.get("/domains", params={"search": "cap1talone.com"})
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1
