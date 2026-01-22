@echo off
REM =================================================
REM ⚡ Script de desarrollo todo-en-uno (Windows)
REM =================================================

REM --- Ver qué comando se ha pasado ---
IF "%1"=="" (
    ECHO Uso: dev.bat [dev|reset|seed|logs]
    EXIT /B
)

SET CMD=%1

REM --- Función: levantar contenedores y mostrar logs ---
IF "%CMD%"=="dev" (
    ECHO Levantando contenedores...
    docker compose up --build -d

    ECHO Esperando backend...
    timeout /t 5 /nobreak >nul

    ECHO Ejecutando migraciones...
    docker compose exec django-api python manage.py migrate

    ECHO Cargando datos base...
    docker compose exec django-api python manage.py loaddata fixtures/*

    ECHO Mostrando logs en tiempo real...
    docker compose logs -f
    EXIT /B
)

REM --- Función: reset completo de contenedores y BBDD ---
IF "%CMD%"=="reset" (
    ECHO Reseteando contenedores y BBDD...
    docker compose down -v
    docker compose up --build -d

    timeout /t 5 /nobreak >nul

    docker compose exec django-api python manage.py migrate
    docker compose exec django-api python manage.py loaddata fixtures/*

    ECHO Reset completo
    EXIT /B
)

REM --- Función: solo cargar datos seed ---
IF "%CMD%"=="seed" (
    ECHO Cargando datos base (fixtures)...
    docker compose exec django-api python manage.py loaddata fixtures/*
    ECHO Hecho
    EXIT /B
)

REM --- Función: ver logs en tiempo real ---
IF "%CMD%"=="logs" (
    docker compose logs -f
    EXIT /B
)

REM --- Comando no reconocido ---
ECHO Comando no reconocido: %CMD%
ECHO Uso: dev.bat [dev|reset|seed|logs]
EXIT /B
