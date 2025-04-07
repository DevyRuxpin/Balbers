#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset

# Install dependencies
pip install --cache-dir=.pip-cache -r requirements.txt

# Only run migrations for web service
if [ "$SERVICE_TYPE" = "web" ]; then
    # Wait for database
    while ! python -c "
import os
from sqlalchemy import create_engine
engine = create_engine(os.getenv('DATABASE_URL'))
engine.connect()
" 2>/dev/null; do
        echo "⌛ Waiting for database..."
        sleep 2
    done

    # Initialize and run migrations
    if [ ! -d "migrations" ]; then
        flask db init
    fi
    
    flask db upgrade

    # Development-only migration
    if [ "${ENVIRONMENT:-production}" != "production" ]; then
        flask db migrate -m "Initial migration"
    fi
fi

echo "✅ Build completed successfully"
