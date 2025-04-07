# Use the official Python image
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y gcc python3-dev libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ .

# Make build script executable
RUN chmod +x /app/backend/build.sh

# Set environment variables
ENV PORT=10000
EXPOSE $PORT

# Run build script
RUN /app/backend/build.sh

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:$PORT/port-check || exit 1

# Production command with explicit logging
CMD exec gunicorn \
    --bind 0.0.0.0:$PORT \
    --access-logfile - \
    --error-logfile - \
    --workers 2 \
    --threads 4 \
    --timeout 120 \
    backend.a:app

