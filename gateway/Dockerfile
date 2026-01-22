# ARG PYTHON_IMAGE
# FROM ${PYTHON_IMAGE}

FROM python:3.11-slim 
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

ENV PYTHONPATH=/app

EXPOSE 4840
CMD ["python", "gateway/main.py"]


