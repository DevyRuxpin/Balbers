#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

# Install dependencies (with cache)
pip install --cache-dir=.pip-cache -r requirements.txt

# Only run migrations if this is the web service (not needed for workers)
if [ "$SERVICE_TYPE" = "web" ]; then
    # Wait for database to be ready (important for Render)
    while ! python -c "import os; from sqlalchemy import create_engine; engine = create_engine(os.getenv('DATABASE_URL')); engine.connect()" 2>/dev/null; do
        echo "Waiting for database to become available..."
        sleep 2
    done

    # Initialize migrations if needed
    if [ ! -d "migrations" ]; then
        flask db init
    fi

    # Run migrations (skip if already up to date)
    flask db upgrade

    # Only create new migration if this is development
    if [ "${ENVIRONMENT:-production}" != "production" ]; then
        flask db migrate -m "Initial migration."
    fi
fi
