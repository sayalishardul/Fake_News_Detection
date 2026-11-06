"""
Lightweight health endpoints used by Render's health checks and by you,
when you want to confirm the deployed service can reach its PostgreSQL
server.

    GET /api/health/          -> process is up (no database access)
    GET /api/health/db/       -> database connectivity check
"""

import logging

from django.db import connection
from django.http import JsonResponse

logger = logging.getLogger(__name__)


def health(request):
    return JsonResponse({"status": "ok"})


def health_db(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version()")
            version = cursor.fetchone()[0]

    except Exception as exc:  # noqa: BLE001 - report any driver/connection error
        logger.error(
            "Database health check failed: %s: %s", type(exc).__name__, exc
        )

        return JsonResponse(
            {
                "status": "error",
                "database": "unreachable",
                "detail": str(exc)[:500],
            },
            status=503,
        )

    return JsonResponse(
        {
            "status": "ok",
            "database": "reachable",
            "engine": connection.vendor,
            "server": version.split(",")[0],
        }
    )
