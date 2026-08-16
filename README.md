![Uploading Screenshot 2026-08-16 at 6.50.47 PM.png…]()
# 🛡️ AuthGuard – Phishing Detection Platform

AuthGuard is a full-stack phishing protection system built around a Chrome extension. It analyzes URLs and webpage content in real time to detect suspicious domains, insecure login forms, and phishing indicators, backed by a FastAPI service, a persistent database, and a React analytics dashboard.

## 🚀 Features

**Extension (Manifest V3)**
- Detects visually deceptive domains (e.g. cap1talone.com) using fuzzy/Levenshtein matching
- Warns users of login forms on untrusted or newly registered domains
- Flags insecure (non-HTTPS) connections
- Popup UI with live scan status and risk score
- One-click "Report This Site" flow that posts to the backend

**Backend (FastAPI)**
- REST API for domain reputation scoring, combining local heuristics with the Google Safe Browsing API
- Persistent blocklist/allowlist store (PostgreSQL via SQLAlchemy)
- Endpoint for community-reported phishing sites, with basic rate limiting and dedup
- JWT-authenticated admin routes for managing the blocklist
- Background job to refresh domain reputation on a schedule

**Dashboard (React)**
- Table of flagged URLs with risk score, report count, and first/last seen timestamps
- Charts for phishing trends over time and top targeted brands
- Search and filter across reported domains
- Admin view to approve, dismiss, or permanently block reported sites

**Infrastructure**
- Docker Compose spinning up the API, Postgres, and dashboard together
- GitHub Actions CI running lint, type checks, and tests on every push
- Pytest coverage for the scoring engine and API routes

## 🛠️ Built With

- Extension: JavaScript (ES6), Chrome Extensions API (Manifest V3), HTML/CSS
- Backend: Python, FastAPI, SQLAlchemy, PostgreSQL, Pydantic
- Frontend: React, TypeScript, Tailwind CSS
- Auth: JWT
- External: Google Safe Browsing API
- Infra: Docker, Docker Compose, GitHub Actions

## 📦 Folder Structure

```
authguard/
├── extension/          # Chrome extension (Manifest V3)
│   ├── popup/
│   ├── background/
│   ├── content-scripts/
│   └── manifest.json
├── backend/             # FastAPI service
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/    # scoring engine, safe browsing client
│   │   └── main.py
│   └── tests/
├── dashboard/           # React admin/analytics dashboard
│   └── src/
├── docker-compose.yml
└── LICENSE
```

## 🧪 How to Run Locally

1. Clone this repository.
2. Copy `.env.example` to `.env` in `backend/` and set your Google Safe Browsing API key and database URL.
3. Run `docker compose up --build` to start the API, database, and dashboard.
4. Open Chrome and navigate to `chrome://extensions/`.
5. Enable Developer mode (top right).
6. Click **Load unpacked** and select the `extension/` folder.
7. Visit websites to see the extension in action, and check the dashboard at `http://localhost:3000` for reported domains.

## ⚠️ Example Use Cases

| URL | Result |
|---|---|
| https://capitalone.com | ✅ No warning |
| https://cap1talone.com | ⚠️ Phishing alert triggered |
| http://fake-login.net | ⚠️ Insecure connection warning |

## 🎯 Why This Project?

This project simulates real-world work security teams do at fintechs and other high-trust platforms: protecting users from phishing and fraud at the browser level. It demonstrates browser-level threat detection, a production-style backend with persistence and auth, and a dashboard for triaging real signal, not just a client-side toy.

## 📌 Future Improvements

- Machine learning model for domain risk scoring, trained on reported sites
- Browser-level notification digest ("3 phishing attempts blocked this week")
- Public API for other extensions or tools to query AuthGuard's blocklist
- Multi-browser support (Firefox, Edge)

## 📄 License

This project is licensed under the MIT License, see [LICENSE](./LICENSE) for details.

## 🙋‍♂️ Author

**Rudra Agarwal**
Computer Science Student, University of Maryland - College Park

- Portfolio: [rudra-agarwal.com](https://rudra-agarwal.com/)
- GitHub: [github.com/rudraagarwal01](https://github.com/rudraagarwal01)
- LinkedIn: [linkedin.com/in/rudra-agarwal01](https://www.linkedin.com/in/rudra-agarwal01/)
