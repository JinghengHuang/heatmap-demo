import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from models import Dataset

router = APIRouter()

DATA_DIR = Path(__file__).parent.parent / "data"


def _load(name: str) -> dict:
    path = DATA_DIR / f"{name}.geojson"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
    return json.loads(path.read_text())


@router.get("", response_model=list[str])
def list_datasets() -> list[str]:
    return [p.stem for p in DATA_DIR.glob("*.geojson")]


@router.get("/{name}", response_model=dict)
def get_dataset(name: str) -> dict:
    return _load(name)
