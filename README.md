# geo-heatmap-studio

A full-stack geospatial visualization platform featuring animated 3D heatmaps on a Cesium globe, backed by a FastAPI data service and a React/TypeScript frontend.

Built as a public portfolio demonstration of the techniques behind patent [CN116485982A](https://patents.google.com/patent/CN116485982A) — 3D heatmap generation under the CesiumJS framework. This is not the original code and it's re-implemented from scratch and only used the original patent document as reference.

Visit https://jhhuangtechspace233.cc/ to check it out.

---

## What it does

- **3D Heatmap Renderer** — 3D heatmap overlaid on a Cesium 3D globe using WebGL shaders
- **Visual Configuration UI** — React/TypeScript control panel to adjust heatmap parameters (color scale, intensity, time range, key frames) in real time
- **Data API** — FastAPI backend that serves spatial datasets, manages keyframe definitions, and exposes a clean REST interface
- **Sample Datasets** — synthetic urban heat island and wind/current data for demonstration

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React, TypeScript, CesiumJS, WebGL |
| Backend | Python, FastAPI, Pydantic |
| Data | GeoJSON, synthetic spatial datasets |
| Infrastructure | Docker, Docker Compose |
| Deployment | TBD (Fly.io / Railway / Render) |

---

## Project Structure

```
geo-heatmap-studio/
├── backend/          # FastAPI service
│   ├── main.py
│   ├── routers/
│   └── data/
├── frontend/         # React + TypeScript + CesiumJS app
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   └── methods/
│   │   └── objects/
│   │   └── shaders/
│   │   └── main.tsx
├── docker-compose.yml
├── nginx/
└── README.md
```

---

## Getting Started

```bash
# Start all services
docker compose up

# Backend only
cd backend && uvicorn main:app --reload

# Frontend only
cd frontend && npm install && npm run dev
```

---

## Background

This project demonstrates the core technique from a patent filed while working on enterprise GIS platforms. The patent describes a method for generating animated 3D heat maps under the CesiumJS 3D map framework, including a configurable UI for editing and real-time rendering.

The public implementation uses synthetic data only and contains no proprietary business logic from the original product.

---

## License

MIT
