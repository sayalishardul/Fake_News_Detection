#!/usr/bin/env bash
#
# Render start script for the Django backend.
#
# Migrations are NOT run here so that every instance starts identically and
# quickly; run them from the Render "Pre-Deploy Command" instead:
#
#   python manage.py migrate --noinput
#
# (render.yaml sets this automatically.)

set -o errexit
set -o nounset
set -o pipefail

# Render provides $PORT. Fall back to 8000 for local runs.
PORT="${PORT:-8000}"

# Gunicorn is the production WSGI server on Linux/Render.
#
# Each worker loads the scikit-learn model (~190 MB RSS), so the default is
# one worker with several threads: it fits Render's 512 MB free instance.
# On a paid plan (2 GB+), raise WEB_CONCURRENCY to 2-3.
exec gunicorn backend.wsgi:application \
    --bind "0.0.0.0:${PORT}" \
    --workers "${WEB_CONCURRENCY:-1}" \
    --threads "${GUNICORN_THREADS:-4}" \
    --timeout "${GUNICORN_TIMEOUT:-120}" \
    --access-logfile - \
    --error-logfile -
