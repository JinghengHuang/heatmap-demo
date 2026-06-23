from pydantic import BaseModel


class HeatPoint(BaseModel):
    lon: float
    lat: float
    value: float


class Dataset(BaseModel):
    id: str
    name: str
    points: list[HeatPoint]


class Keyframe(BaseModel):
    id: str
    dataset_id: str
    timestamp: float  # seconds from epoch or relative offset
    label: str | None = None
