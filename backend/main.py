from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routers import auth, check, report, domains, stats

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AuthGuard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(check.router)
app.include_router(report.router)
app.include_router(domains.router)
app.include_router(stats.router)


@app.get("/health")
def health():
    return {"status": "ok"}
