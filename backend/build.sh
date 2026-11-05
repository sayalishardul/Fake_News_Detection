#!/usr/bin/env bash
#
# Render build script for the Django backend.
#
# Render runs this from the service's root directory (backend/) on every
# deploy. If SERVE_FRONTEND=true, the Vite build of ../frontend is copied
# in and served by WhiteNoise from the same service, so the whole project
# runs as one web service on one origin.

set -o errexit   # exit on error
set -o nounset   # treat unset variables as an error
set -o pipefail  # exit on error inside a pipeline

echo "==> Installing Python dependencies"
python -m pip install --upgrade pip
python -m pip install --requirement requirements.txt


if [ "${SERVE_FRONTEND:-false}" = "true" ]; then

    echo "==> Building the React frontend (single-service mode)"

    if ! command -v npm >/dev/null 2>&1; then
        echo "npm was not found. Set SERVE_FRONTEND=false and deploy the frontend separately." >&2
        exit 1
    fi

    pushd ../frontend > /dev/null

    # npm ci needs the lockfile; fall back to install if it is missing.
    if [ -f package-lock.json ]; then
        npm ci --no-audit --no-fund
    else
        npm install --no-audit --no-fund
    fi

    # Baked into the bundle at build time. Relative by default, which
    # works when the frontend and API share an origin.
    export VITE_API_BASE_URL="${VITE_API_BASE_URL:-/api/}"

    npm run build

    popd > /dev/null

    echo "==> Copying frontend build into backend/frontend_dist"
    rm -rf frontend_dist
    mkdir -p frontend_dist
    cp -R ../frontend/dist/. frontend_dist/

    # WhiteNoise serves pre-compressed `.gz` files when the browser accepts
    # gzip. The Vite bundle is not compressed by collectstatic, so do it here
    # (~475 kB gzip instead of 1.5 MB).
    if command -v gzip >/dev/null 2>&1; then
        echo "==> Pre-compressing frontend assets"
        find frontend_dist -type f \
            \( -name '*.js' -o -name '*.css' -o -name '*.svg' -o -name '*.json' \
               -o -name '*.html' -o -name '*.txt' \) \
            -exec gzip -9 -k -f {} +
    fi

fi


echo "==> Collecting static files"
python manage.py collectstatic --noinput --clear


# ---------------------------------------------------------------------------
# Database migrations
# ---------------------------------------------------------------------------
# Render's free plan does not support a pre-deploy command, so migrations run
# here, right after the code is built and before anything is swapped in.
# Running them twice is harmless: each migration is applied only once.
#
# On a paid plan you can move this to `preDeployCommand` (see render.yaml);
# then set SKIP_MIGRATE=true here to avoid doing it in both places.
#
# Set SKIP_MIGRATE=true to build without touching the database (the database
# may be unreachable from a build sandbox you don't control).
if [ "${SKIP_MIGRATE:-false}" = "true" ]; then
    echo "==> Skipping migrations (SKIP_MIGRATE=true)"
else
    echo "==> Applying database migrations"
    python manage.py migrate --noinput
fi


echo "==> Build complete"
