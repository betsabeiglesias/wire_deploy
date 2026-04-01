FROM python:3.12-slim

WORKDIR /app

# Librerías base + dependencias para pyodbc
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    docker.io \
    curl \
    gnupg \
    ca-certificates \
    unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

# ODBC Driver 18 para SQL Server (necesario para historian)
RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc \
       | gpg --dearmor -o /etc/apt/keyrings/microsoft.gpg \
    && echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/microsoft.gpg] \
       https://packages.microsoft.com/debian/12/prod bookworm main" \
       > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
