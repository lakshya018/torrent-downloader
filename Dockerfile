# Use a Linux-based Python image as the base
FROM python:3.9-slim

# Set environment variables to avoid Python buffering issues
ENV PYTHONUNBUFFERED=1
    
# Set the working directory
WORKDIR /app

# Copy the backend files
COPY server.py /app/
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port your backend will use
EXPOSE 5000

# Command to run the backend server
CMD ["python", "server.py"]