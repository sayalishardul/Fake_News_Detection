"""
Django settings for backend project.
"""

from pathlib import Path
from datetime import timedelta
from urllib.parse import urlparse
import os

import dj_database_url
from dotenv import load_dotenv


# =========================================================
# BASE DIRECTORY
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# =========================================================
# ENVIRONMENT VARIABLES
# =========================================================

load_dotenv(BASE_DIR / ".env")

# Render injects the public URL of the running service into this
# variable. It is used further down to trust the service's own host.
RENDER_EXTERNAL_URL = os.getenv("RENDER_EXTERNAL_URL", "").strip()

OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://127.0.0.1:11434/api/chat",
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "qwen2.5:3b",
)

# =========================================================
# SECURITY
# =========================================================

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "DJANGO_SECRET_KEY is not set. "
        "Please add it to your .env file."
    )


DEBUG = os.environ.get(
    "DJANGO_DEBUG",
    "False"
).lower() == "true"


# =========================================================
# ALLOWED HOSTS
# =========================================================

ALLOWED_HOSTS_ENV = os.getenv("DJANGO_ALLOWED_HOSTS", "*")
ALLOWED_HOSTS = [
    host.strip() for host in ALLOWED_HOSTS_ENV.split(",") if host.strip()
]

# Trust the service's own public host (Render sets RENDER_EXTERNAL_URL).
RENDER_HOST = urlparse(RENDER_EXTERNAL_URL).hostname if RENDER_EXTERNAL_URL else None

if RENDER_HOST and RENDER_HOST not in ALLOWED_HOSTS and "*" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(RENDER_HOST)


# =========================================================
# APPLICATIONS
# =========================================================

INSTALLED_APPS = [
    "backend.apps.MongoAdminConfig",
    "backend.apps.MongoAuthConfig",
    "backend.apps.MongoContentTypesConfig",

    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "django_mongodb_backend",

    "rest_framework",
    "corsheaders",
    #"rest_framework_simplejwt.token_blacklist",

    "assistant",
    "detection",
    "accounts",
    "dashboard",
]


MIGRATION_MODULES = {
    "admin": None,
    "auth": None,
    "contenttypes": None,
}
# =========================================================
# MIDDLEWARE
# =========================================================

MIDDLEWARE = [

    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",

    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# =========================================================
# URL CONFIGURATION
# =========================================================

ROOT_URLCONF = "backend.urls"


# =========================================================
# TEMPLATES
# =========================================================

TEMPLATES = [

    {
        "BACKEND":
            "django.template.backends.django.DjangoTemplates",

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {

            "context_processors": [

                "django.template.context_processors.request",

                "django.contrib.auth.context_processors.auth",

                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# =========================================================
# WSGI
# =========================================================

WSGI_APPLICATION = "backend.wsgi.application"


# =========================================================
# DATABASE
# =========================================================

# Database Configuration - MongoDB Atlas

MONGODB_URI = os.getenv("MONGODB_URI", "").strip()

if not MONGODB_URI:
    raise RuntimeError(
        "MONGODB_URI is not configured. "
        "Please add it to your Render environment variables."
    )

DATABASES = {
    "default": {
<<<<<<< HEAD
        "ENGINE": "django_mongodb_backend",
        "HOST": MONGODB_URI,
        "NAME": "fake_news_detection",
    }
}

# MongoDB migration configuration
MIGRATION_MODULES = {
    "admin": None,
    "auth": None,
    "contenttypes": None,
}

# Default primary key field
DEFAULT_AUTO_FIELD = "django_mongodb_backend.fields.ObjectIdAutoField"
=======

        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "FakeNewsDetection"),
        "USER": os.getenv("POSTGRES_USER", "postgres"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "root"),
        "HOST": os.getenv("POSTGRES_HOST", "127.0.0.1"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
        "CONN_MAX_AGE": int(os.getenv("DB_CONN_MAX_AGE", "60")),

        # Extra libpq parameters, e.g. DB_SSLMODE=require for a remote
        # PostgreSQL server. Empty by default so local connections work.
        "OPTIONS": {},
    },
    "legacy_sqlite": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if DATABASE_URL:
    # A single connection string wins over the POSTGRES_* variables.
    # This is the form Render and most hosted providers give you:
    #   postgresql://user:password@host:5432/dbname
    DATABASES["default"] = dj_database_url.parse(
        DATABASE_URL,
        conn_max_age=int(os.getenv("DB_CONN_MAX_AGE", "60")),
    )

if os.getenv("DB_SSLMODE"):
    # Most hosted connection strings already contain ?sslmode=require.
    # This only fills the gap for URLs that don't.
    DATABASES["default"].setdefault("OPTIONS", {}).setdefault(
        "sslmode", os.getenv("DB_SSLMODE")
    )

# Some providers hand out URLs without a database name
# (e.g. postgresql://user:pass@host:5432). Fall back to POSTGRES_DB.
if DATABASE_URL and not DATABASES["default"].get("NAME"):
    DATABASES["default"]["NAME"] = os.getenv("POSTGRES_DB", "postgres")

>>>>>>> a8d2024048306acb30dc9a43c210eaef76789027

# =========================================================
# PASSWORD VALIDATION
# =========================================================

AUTH_PASSWORD_VALIDATORS = [

    {
        "NAME":
            "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation.MinimumLengthValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation.CommonPasswordValidator",
    },

    {
        "NAME":
            "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# =========================================================
# DEFAULT PRIMARY KEY TYPE
# =========================================================

# The existing migrations create BigAutoField primary keys. Pinning the
# default keeps `makemigrations` quiet on every Django version.
<<<<<<< HEAD
=======
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
>>>>>>> a8d2024048306acb30dc9a43c210eaef76789027


# =========================================================
# INTERNATIONALIZATION
# =========================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# =========================================================
# STATIC FILES
# =========================================================

STATIC_URL = "static/"


# =========================================================
# MEDIA FILES
# =========================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# =========================================================
# STATIC FILES (WhiteNoise)
# =========================================================

STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {

    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },

    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

# Render serves the app over HTTPS. Trust the forwarded protocol so
# Django builds https:// absolute URLs (static files, redirects, etc.).
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# WhiteNoise caches content-hashed files forever; unversioned files
# (index.html, favicon) keep the default short max-age so deploys are picked up.

# Single-service deployment: build the React app into this folder and
# let WhiteNoise serve it from the same origin as the API. Enable it with
#   SERVE_FRONTEND=true
# (see backend/build.sh and render.yaml). With a separate frontend service
# this stays off and only Django's own static files are served.
SERVE_FRONTEND = os.getenv("SERVE_FRONTEND", "False").lower() == "true"

FRONTEND_DIST_DIR = Path(
    os.getenv("FRONTEND_DIST_DIR", BASE_DIR / "frontend_dist")
)

if SERVE_FRONTEND:
    # Everything Django/DRF ships in an app's static/ folder is copied here
    # so one collectstatic covers both the admin and the React app.
    STATIC_ROOT = BASE_DIR / "staticfiles"
    WHITENOISE_ROOT = str(FRONTEND_DIST_DIR)

    # Vite names built files "name-<hash>.js". Those can be cached forever;
    # index.html must not be, so a new deploy is picked up immediately.
    WHITENOISE_IMMUTABLE_FILE_TEST = (
        r"(^|/)assets/.+-[\w-]{8,}\.(?:js|css|woff2?|ttf|png|jpe?g|gif|svg|webp|avif)$"
    )


# =========================================================
# CORS
# =========================================================

CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL_ORIGINS", "False").lower() == "true"

CORS_ALLOWED_ORIGINS_ENV = os.getenv("CORS_ALLOWED_ORIGINS", "")

if CORS_ALLOWED_ORIGINS_ENV:
    CORS_ALLOWED_ORIGINS = [
        origin.strip() for origin in CORS_ALLOWED_ORIGINS_ENV.split(",") if origin.strip()
    ]
else:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:9191",
        "http://127.0.0.1:9191",
        "http://localhost:8181",
        "http://127.0.0.1:8181",
    ]

# Extra origins for a deployed frontend, e.g.
# CORS_EXTRA_ORIGINS=https://my-app.onrender.com,https://my-domain.com
CORS_EXTRA_ORIGINS_ENV = os.getenv("CORS_EXTRA_ORIGINS", "")

CORS_ALLOWED_ORIGINS += [
    origin.strip()
    for origin in CORS_EXTRA_ORIGINS_ENV.split(",")
    if origin.strip() and origin.strip() not in CORS_ALLOWED_ORIGINS
]

# The backend's own public URL is always a trusted origin.
if RENDER_EXTERNAL_URL and RENDER_EXTERNAL_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append(RENDER_EXTERNAL_URL)

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost:\d+$",
    r"^http://127\.0\.0\.1:\d+$",
    r"^http://192\.168\.0\.\d+:\d+$",
    # Render service URLs (frontend/backend previews)
    r"^https://[\w.-]+\.onrender\.com$",
]

# =========================================================
# CSRF
# =========================================================

CSRF_TRUSTED_ORIGINS_ENV = os.getenv("CSRF_TRUSTED_ORIGINS", "")

if CSRF_TRUSTED_ORIGINS_ENV:
    CSRF_TRUSTED_ORIGINS = [
        origin.strip() for origin in CSRF_TRUSTED_ORIGINS_ENV.split(",") if origin.strip()
    ]
else:
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:9191",
        "http://127.0.0.1:9191",
        "http://localhost:8181",
        "http://127.0.0.1:8181",
    ]

# Extra trusted origins for a deployed frontend, e.g.
# CSRF_EXTRA_ORIGINS=https://my-app.onrender.com,https://my-domain.com
CSRF_EXTRA_ORIGINS_ENV = os.getenv("CSRF_EXTRA_ORIGINS", "")

CSRF_TRUSTED_ORIGINS += [
    origin.strip()
    for origin in CSRF_EXTRA_ORIGINS_ENV.split(",")
    if origin.strip() and origin.strip() not in CSRF_TRUSTED_ORIGINS
]

# The backend's own public URL is always trusted.
if RENDER_EXTERNAL_URL and RENDER_EXTERNAL_URL not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append(RENDER_EXTERNAL_URL)


# =========================================================
# DJANGO REST FRAMEWORK
# =========================================================

REST_FRAMEWORK = {

    "DEFAULT_AUTHENTICATION_CLASSES": (

        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),

    "DEFAULT_PERMISSION_CLASSES": (

        "rest_framework.permissions.AllowAny",
    ),

    "DEFAULT_RENDERER_CLASSES": (

        "rest_framework.renderers.JSONRenderer",
    ),
}


# =========================================================
# SIMPLE JWT
# =========================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
}


# =========================================================
# PRODUCTION SECURITY
# =========================================================

# =========================================================
# EMAIL / CONTACT SUPPORT
# =========================================================

EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
EMAIL_USE_SSL = os.getenv("EMAIL_USE_SSL", "False").lower() == "true"
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL") or EMAIL_HOST_USER or "Fake News Detector <noreply@localhost>"
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL") or EMAIL_HOST_USER
EMAIL_BACKEND = (
    "django.core.mail.backends.smtp.EmailBackend"
    if EMAIL_HOST_USER and EMAIL_HOST_PASSWORD
    else "django.core.mail.backends.console.EmailBackend"
)


# True when Render (or any reverse proxy) terminates TLS in front of Django.
BEHIND_HTTPS_PROXY = (
    os.getenv("HTTPS_PROXY_TERMINATED", "False").lower() == "true"
    or bool(RENDER_EXTERNAL_URL)
)


if not DEBUG:

    # Off by default: behind Render's proxy the browser already speaks HTTPS,
    # and an upstream http:// health check would bounce forever.
    SECURE_SSL_REDIRECT = os.getenv(
        "SECURE_SSL_REDIRECT",
        "False",
    ).lower() == "true"

    # Secure cookies are safe (and recommended) behind an HTTPS proxy: the
    # browser talks to the proxy over HTTPS.
    _secure_cookies_default = "True" if BEHIND_HTTPS_PROXY else "False"

    SESSION_COOKIE_SECURE = os.getenv(
        "SESSION_COOKIE_SECURE", _secure_cookies_default
    ).lower() == "true"

    CSRF_COOKIE_SECURE = os.getenv(
        "CSRF_COOKIE_SECURE", _secure_cookies_default
    ).lower() == "true"

    SECURE_CONTENT_TYPE_NOSNIFF = True

    X_FRAME_OPTIONS = "DENY"

    SECURE_HSTS_SECONDS = int(
        os.getenv("SECURE_HSTS_SECONDS", "31536000" if BEHIND_HTTPS_PROXY else "0")
    )

    SECURE_HSTS_INCLUDE_SUBDOMAINS = SECURE_HSTS_SECONDS > 0

    SECURE_HSTS_PRELOAD = SECURE_HSTS_SECONDS > 0
