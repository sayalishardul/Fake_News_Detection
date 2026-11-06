"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path

from .health import health, health_db
from .views import frontend_index

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/health/", health, name="health"),
    path("api/health/db/", health_db, name="health-db"),

    path("api/", include("detection.urls")),
    path("api/auth/", include("accounts.urls")),
    
    path("api/admin/", include("dashboard.urls")),

    path("api/assistant/", include("assistant.urls")),

]


# =========================================================
# SINGLE-SERVICE MODE (optional)
# =========================================================
#
# When SERVE_FRONTEND is enabled, the React build is served from this
# same service. Real files (assets, images, index.html) are handled by
# WhiteNoise before Django is reached; this catch-all returns the app
# shell for any other non-API route so client-side routing keeps working.

if settings.SERVE_FRONTEND:

    urlpatterns += [
        re_path(r"^(?!api/|admin/|static/).*$", frontend_index, name="frontend"),
    ]
