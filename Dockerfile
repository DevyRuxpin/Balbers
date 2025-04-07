# Use the official Python image from the Docker Hub
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y gcc python3-dev libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ .

# Make build script executable
RUN chmod +x /app/build.sh

# Set environment variables
ENV PORT=10000
EXPOSE $PORT

# Run build script
RUN ./build.sh

# Explicit health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/v3/ping || exit 1

# Run with gunicorn (critical change here)
CMD exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 8 --timeout 0 backend.a:app

