from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import datasets

app = FastAPI(title="Geo Heatmap Studio API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets.router, prefix="/datasets", tags=["datasets"])


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
