FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PATH="/app/scripts:${PATH}"

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements
COPY requirements.txt /app/

# Install dependencies
RUN pip install -r requirements.txt

# Copy project
COPY . /app/

# Create directory for static files
RUN mkdir -p /app/staticfiles /app/media

# Create directory for scripts
RUN mkdir -p /app/scripts

# Create entrypoint script
RUN echo '#!/bin/sh\n\
python manage.py migrate --no-input\n\
python manage.py collectstatic --no-input\n\
daphne -b 0.0.0.0 -p 8000 cardgames.asgi:application\n\
' > /app/scripts/entrypoint.sh

# Make script executable
RUN chmod +x /app/scripts/entrypoint.sh

# Expose port
EXPOSE 8000

# Run entrypoint script
ENTRYPOINT ["entrypoint.sh"]
