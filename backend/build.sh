#!/usr/bin/env bash

# Install dependencies
pip install -r requirements.txt

# Initialize the database migrations directory if it doesn't exist
if [ ! -d "migrations" ]; then
  flask db init
fi

# Create a new migration
flask db migrate -m "Initial migration."

# Apply the migration to the database
flask db upgrade

# Any other build steps you need
