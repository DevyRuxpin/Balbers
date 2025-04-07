# Use the official Python image from the Docker Hub
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY backend/requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code into the container
COPY backend/ /app/backend

# Set the environment variables
ENV DATABASE_URL=postgresql://balbers:Ve9BUEk8yqiZEBOrUXzJFqcrlSoGL5ol@dpg-cvngaq7diees73busi20-a/balbers_i8o8

# Explicitly declare the port
ENV PORT=10000
EXPOSE $PORT

# Make sure the build.sh script is executable
RUN chmod +x /app/backend/build.sh

# Run the build script to set up the database
RUN /app/backend/build.sh

# Command to run the application
CMD ["gunicorn", "--worker-tmp-dir", "/dev/shm", "backend.a:app", "--bind", "0.0.0.0:${PORT}"]
