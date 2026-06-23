#!/usr/bin/env bash
# Usage:
#   ./start.sh                         # dev mode, both services
#   ./start.sh prod                    # prod mode, both services
#   ./start.sh dev --backend-only
#   ./start.sh prod --frontend-only

set -euo pipefail

MODE="dev"
BACKEND_ONLY=false
FRONTEND_ONLY=false

for arg in "$@"; do
    case $arg in
        dev|prod)        MODE=$arg ;;
        --backend-only)  BACKEND_ONLY=true ;;
        --frontend-only) FRONTEND_ONLY=true ;;
        *) echo "Unknown argument: $arg"; exit 1 ;;
    esac
done

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
    echo ""
    echo "Stopping services..."
    [ -n "$BACKEND_PID" ]  && kill "$BACKEND_PID"  2>/dev/null || true
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM

echo "geo-heatmap-studio — $MODE mode"

# In prod, build frontend before starting servers
if [ "$MODE" = "prod" ] && [ "$BACKEND_ONLY" = false ]; then
    echo "[frontend] Building for production..."
    (cd "$ROOT/frontend" && npm run build)
fi

if [ "$FRONTEND_ONLY" = false ]; then
    echo "[backend] Starting ($MODE)..."
    (
        cd "$ROOT/backend"

        if [ ! -d ".venv" ]; then
            echo "[backend] Creating venv..."
            python3 -m venv .venv
        fi

        # shellcheck disable=SC1091
        if [ -f ".venv/Scripts/activate" ]; then
            source .venv/Scripts/activate
        else
            source .venv/bin/activate
        fi

        if ! command -v uvicorn &>/dev/null; then
            echo "[backend] Installing dependencies..."
            pip install -r requirements.txt
        fi

        if [ "$MODE" = "dev" ]; then
            uvicorn main:app --reload
        else
            uvicorn main:app --workers 4
        fi
    ) &
    BACKEND_PID=$!
fi

if [ "$BACKEND_ONLY" = false ]; then
    if [ ! -d "$ROOT/frontend/node_modules" ]; then
        echo "ERROR: node_modules missing. Run: cd frontend && npm install"
        exit 1
    fi

    echo "[frontend] Starting ($MODE)..."
    (
        cd "$ROOT/frontend"
        if [ "$MODE" = "dev" ]; then
            npm run dev
        else
            npm run preview
        fi
    ) &
    FRONTEND_PID=$!
fi

wait
