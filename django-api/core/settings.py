import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# --- SEGURIDAD Y NÚCLEO
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "clave-secreta-por-defecto-no-usar-en-prod")
DEBUG = os.environ.get("DJANGO_DEBUG", "True") == "True"
ALLOWED_HOSTS = ["*"]

EDGE_API_KEY = "dev-secret"

# =========================================================
# 🧠 CORE APPS (infraestructura SIEMPRE presentes)
# =========================================================
CORE_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',

    # Core propio
    'core.auth_manager',
    'core.favorites',
]

# =========================================================
# 🔥 MÓDULOS DINÁMICOS (desde .env)
# =========================================================
enabled_modules_str = os.getenv("ENABLED_MODULES", "")

DYNAMIC_MODULES = [
    f"modules.{m.strip()}"
    for m in enabled_modules_str.split(",")
    if m.strip()
]

# =========================================================
# 🧩 INSTALLED_APPS FINAL
# =========================================================
INSTALLED_APPS = CORE_APPS + DYNAMIC_MODULES


# =========================================================
# MIDDLEWARE
# =========================================================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = "core.asgi.application"

# =========================================================
# BASE DE DATOS
# =========================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'industry4'),
        'USER': os.getenv('POSTGRES_USER', 'django'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'django1234'),
        'HOST': os.getenv('POSTGRES_HOST', 'postgres'),
        'PORT': int(os.getenv('POSTGRES_PORT', 5432)),
    }
}

# =========================================================
# AUTH
# =========================================================
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'core.auth_manager.authenticate.CustomJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_COOKIE": os.getenv("AUTH_COOKIE_NAME", "access_token"),
    "AUTH_COOKIE_REFRESH": os.getenv("AUTH_COOKIE_REFRESH_NAME", "refresh_token"),
    "AUTH_COOKIE_HTTP_ONLY": True,
    "AUTH_COOKIE_SECURE": not DEBUG,
    "AUTH_COOKIE_SAMESITE": "Lax",
}

# =========================================================
# CORS / CSRF
# =========================================================
CORS_ALLOW_CREDENTIALS = True
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
]

CSRF_TRUSTED_ORIGINS = [
    FRONTEND_URL,
]

# =========================================================
# COOKIES
# =========================================================
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# =========================================================
# REDIS / CHANNELS
# =========================================================
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(
                os.getenv("REDIS_HOST", "redis-central"),
                int(os.getenv("REDIS_PORT", 6379))
            )],
        },
    },
}

# =========================================================
# ESTÁTICOS
# =========================================================
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'