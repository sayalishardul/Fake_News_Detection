"""
Views for the Django project itself (not for a single app).

The only endpoint here is the optional single-service deployment mode:
when SERVE_FRONTEND is enabled, this serves the React build from the same
origin as the API. WhiteNoise handles the real files (JS, CSS, images) and
falls through to Django, which returns index.html for client-side routes.
"""

import logging

from django.conf import settings
from django.http import Http404, HttpResponse
from django.views.decorators.cache import never_cache

logger = logging.getLogger(__name__)


def _read_index():
    index_path = settings.FRONTEND_DIST_DIR / "index.html"

    try:
        return index_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        logger.error(
            "SERVE_FRONTEND is enabled but %s was not found. "
            "Run the frontend build before starting the server.",
            index_path,
        )
        return None


@never_cache
def frontend_index(request):
    """Serve the React single-page app shell."""

    if not settings.SERVE_FRONTEND:
        raise Http404("Frontend serving is disabled.")

    html = _read_index()

    if html is None:
        return HttpResponse(
            "Frontend build not found. Run `npm run build` in frontend/ and "
            "copy the output to backend/frontend_dist.",
            status=500,
            content_type="text/plain",
        )

    return HttpResponse(html, content_type="text/html; charset=utf-8")
