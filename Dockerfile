# Use the official Python image from the Docker Hub
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (required for psycopg2)
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY backend/requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container
COPY backend/ /app/backend

# Make sure the build.sh script is executable
RUN chmod +x /app/backend/build.sh

# Explicitly declare the port
ENV PORT=10000
EXPOSE $PORT

# Run the build script to set up the database
RUN /app/backend/build.sh

# Command to run the application using gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "--workers", "4", "--worker-class", "gevent", "--timeout", "120", "backend.a:app"]
