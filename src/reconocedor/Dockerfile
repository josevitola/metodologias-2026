# ============================================================
# Stage 1: Build frontend (React + Vite + TypeScript)
# ============================================================
FROM node:22-alpine AS frontend-build

WORKDIR /build

# Enable pnpm via corepack
RUN corepack enable

# Install dependencies (cached layer)
# Use --ignore-scripts to bypass pnpm v11's build approvals check,
# then explicitly rebuild esbuild which needs its native binary.
COPY frontend/.npmrc frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile --ignore-scripts
RUN pnpm rebuild esbuild

# Copy source and build
COPY frontend/ .
RUN pnpm build

# ============================================================
# Stage 2: Runtime (Python 3.11-slim, arm64/amd64 compatible)
# ============================================================
FROM python:3.11-slim

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/ .

# Copy built frontend assets from stage 1 into the expected path
# (matches FRONTEND_DIST in app/main.py: BASE_DIR / "frontend" / "dist")
COPY --from=frontend-build /build/dist ./frontend/dist

# Expose FastAPI / WebSocket port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl --fail http://localhost:8000/health || exit 1

# Start the server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]