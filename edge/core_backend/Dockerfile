FROM python:3.11-slim

WORKDIR /app

# dependencias básicas
RUN pip install --no-cache-dir \
    django \
    daphne \
    channels \
    paho-mqtt \
    PyJWT

# copiar código
COPY . /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "core.asgi:application"]
