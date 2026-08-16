def test_report_creates_entry(client):
    resp = client.post("/report", json={"url": "https://phish-example.com", "reason": "Fake login page"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["domain"] == "phish-example.com"
    assert isinstance(data["report_id"], int)


def test_report_increments_report_count(client):
    url = "https://increment-test-domain.com"
    client.post("/report", json={"url": url})
    resp1 = client.get("/domains", params={"search": "increment-test-domain.com"})
    count1 = resp1.json()["items"][0]["report_count"]

    client.post("/report", json={"url": url})
    resp2 = client.get("/domains", params={"search": "increment-test-domain.com"})
    count2 = resp2.json()["items"][0]["report_count"]

    assert count2 == count1 + 1


def test_report_without_reason_succeeds(client):
    resp = client.post("/report", json={"url": "https://no-reason-domain.com"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_reported_domain_appears_in_domains_list(client):
    client.post("/report", json={"url": "https://tracked-report-domain.com", "reason": "test"})
    resp = client.get("/domains", params={"search": "tracked-report-domain.com"})
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


def test_report_each_call_returns_unique_report_id(client):
    url = "https://multi-report-domain.com"
    id1 = client.post("/report", json={"url": url}).json()["report_id"]
    id2 = client.post("/report", json={"url": url}).json()["report_id"]
    assert id1 != id2
