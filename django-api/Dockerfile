FROM python:3.12-slim

WORKDIR /app

# Instala librerías necesarias para psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    docker.io \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
