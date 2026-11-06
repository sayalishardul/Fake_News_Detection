# Deploying to Render with your own PostgreSQL database

This guide connects the project to **the PostgreSQL server running on your own
computer** and deploys the Django + React app to **Render**.

Everything here has been wired into the repo already — no code editing is
required. You mostly need to (1) let Render reach your PC's database and
(2) paste one connection string into Render.

---

## 1. How it fits together

```
                 ┌─────────────────────────────────────────────┐
   Browser ──►   │  Render Web Service (free, 512 MB)          │
                 │  Django + DRF  ─  serves the React build     │
                 │  /api/...  ────── REST API                   │
                 └───────────────┬─────────────────────────────┘
                                 │  outbound TCP 5432 (TLS optional)
                                 ▼
                 ┌─────────────────────────────────────────────┐
                 │  YOUR PC ▸ PostgreSQL 18 ▸ FakeNewsDetection│
                 └─────────────────────────────────────────────┘
```

* **One Render service** does everything: the API *and* the built React app.
  No CORS, no second free instance, one URL.
* **One database**: the PostgreSQL on your PC. Render talks to it over the
  public internet.
* Configuration is by environment variable: `DATABASE_URL`.

> Want a second service for the frontend instead? See
> [§9 Two-service setup](#9-alternative-two-render-services).

---

## 2. Prepare the database on your PC

### 2.1 Your database already exists

This project has been deployed against a local **PostgreSQL 18** server with a
database named **`FakeNewsDetection`** (13 tables, users already present). You
do **not** need to create the database or run migrations — the schema and data
are already there.

Note the mixed case: it must be written as `"FakeNewsDetection"` (double
quotes) in raw SQL. In `POSTGRES_DB` / a connection string it is used as-is,
no quoting.

**Create a dedicated login role** instead of using the `postgres` superuser
(this port faces the internet). In pgAdmin's Query Tool:

```sql
CREATE ROLE fake_news LOGIN PASSWORD 'a-long-random-alphanumeric-password';
GRANT CONNECT ON DATABASE "FakeNewsDetection" TO fake_news;
```

Then reconnect to `FakeNewsDetection` and grant table access:

```sql
GRANT USAGE ON SCHEMA public TO fake_news;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fake_news;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fake_news;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO fake_news;
```

If you would rather use `postgres` for now, skip this and set
`POSTGRES_USER=postgres` — but every query from Render then runs as superuser.

### 2.2 Allow connections from outside

Edit `postgresql.conf` (in Windows it is usually
`C:\Program Files\PostgreSQL\16\data\postgresql.conf`):

```conf
listen_addresses = '*'
```

Edit `pg_hba.conf` in the same folder — add this line **above** the other
`host` lines:

```conf
# TYPE  DATABASE              USER        ADDRESS          METHOD
host    "FakeNewsDetection"  fake_news   0.0.0.0/0        scram-sha-256
```

Restart the PostgreSQL service (Windows: *Services ▸ postgresql-x64-16 ▸ Restart*).

### 2.3 Open the port

* **Windows Firewall** → *Advanced settings* → *Inbound Rules* → *New Rule* →
  *Port* → **TCP 5432** → *Allow*.
* **Router** → *Port forwarding* → forward **TCP 5432** to your PC's LAN IP
  (`ipconfig` shows something like `192.168.1.37`).
* Give that PC a **static LAN IP** (DHCP reservation in the router) so the
  forward keeps working after a reboot.

### 2.4 Check whether your ISP gives you a public IP

Open <https://www.whatismyip.com> on the PC and compare it with the address
your router reports on its status page.

| Result | What to do |
| --- | --- |
| Same address | Port forwarding works. Test it from a phone on **mobile data**: `psql "postgresql://fake_news:PASSWORD@YOUR_PUBLIC_IP:5432/FakeNewsDetection" -c "select 1"` |
| Router shows `100.64.x.x` – `100.127.x.x`, or another private range | You are behind **CGNAT** — inbound port forwarding cannot work. Use a tunnel instead: [§8 Tunnel option](#8-option-b-cgnat-or-no-port-forwarding-tunnel) |

### 2.5 Make the address stable

Most home IPs change. Either:

* ask your ISP for a static IP, or
* use a free dynamic-DNS hostname (e.g. **Duck DNS**) and point it at your IP;
  update it with their updater app. Your connection string then uses
  `your-name.duckdns.org` instead of an IP number.

### 2.6 TLS (recommended)

Your password crosses the internet, so encrypt the connection:

```conf
# postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file  = 'server.key'
```

Windows users can generate a self-signed pair with **OpenSSL** (Git for Windows
ships it):

```bash
openssl req -new -x509 -days 3650 -nodes -text -out server.crt \
  -keyout server.key -subj "/CN=your-hostname"
```

Then use `sslmode=require` in the URL (self-signed certificates are accepted by
`sslmode=require`; it encrypts without verifying the certificate chain).
If you do **not** enable TLS, use `sslmode=prefer`.

---

## 3. Build the connection string

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

For example:

```
postgresql://fake_news:MyL0ng-Random-Pass@myhome.duckdns.org:5432/FakeNewsDetection?sslmode=require
```

Rules:

* Percent-encode special characters in the password
  (`@` → `%40`, `:` → `%3A`, `/` → `%2F`, `#` → `%23`).
  Easiest: generate an alphanumeric password.
* Keep `?sslmode=require` (TLS on) or `?sslmode=prefer` (TLS if available).
* Test it from a **different network** than your home (phone hotspot):
  a database that only works from home Wi-Fi is not reachable from Render.

---

## 4. Deploy on Render

1. Push this branch to GitHub.
2. In the Render Dashboard: **New ▸ Blueprint**, pick this repository, apply.
   `render.yaml` at the repo root defines the service.
3. Render asks for the values marked `sync: false`:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | the string from §3 (required) |
   | `CORS_EXTRA_ORIGINS` | blank in single-service mode |
   | `CSRF_EXTRA_ORIGINS` | blank in single-service mode |
   | `TAVILY_API_KEY` | optional — enables *Verify news* web search |
   | `OLLAMA_URL`, `OLLAMA_MODEL` | optional — AI assistant, see §10 |
   | `EMAIL_*`, `SUPPORT_EMAIL` | optional — contact-form mail |

   `DJANGO_SECRET_KEY` is generated by Render automatically.

4. Render runs `backend/build.sh`:

   ```
   pip install -r requirements.txt
   npm ci && npm run build        (frontend, single-service mode)
   collectstatic
   python manage.py migrate       (creates/updates tables in your database)
   ```

   and then `backend/start.sh` → `gunicorn backend.wsgi:application`.

5. Wait for **Live**. The service URL is `https://<name>.onrender.com`.

> **Free plan note:** Render's free plan does not support pre-deploy commands,
> which is why migrations run at the end of the build. On a paid plan you can
> move them out — `render.yaml` has the two lines, commented.

---

## 5. Check that it works

| URL | Expected |
| --- | --- |
| `https://<name>.onrender.com/api/health/` | `{"status": "ok"}` |
| `https://<name>.onrender.com/api/health/db/` | `{"status": "ok", "database": "reachable", "server": "PostgreSQL 16..."}` |
| `https://<name>.onrender.com/` | the React login page |

If `/api/health/db/` returns **503** with `connection timeout expired`, Render
cannot reach your database → [§11 Troubleshooting](#11-troubleshooting).

Create an admin account for `/admin/`:

```bash
# Render Dashboard ▸ your service ▸ Shell  (paid plans only)
python manage.py createsuperuser
```

On the free plan, open `https://<name>.onrender.com/api/auth/register/` through
the app's **Register** page, then promote the user with a query on your PC:

```sql
UPDATE auth_user SET is_staff = true, is_superuser = true WHERE username = 'yourname';
```

---

## 6. Environment variables (reference)

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | – | Full PostgreSQL URL. **Overrides** the `POSTGRES_*` variables |
| `POSTGRES_DB` / `_USER` / `_PASSWORD` / `_HOST` / `_PORT` | local values | Used when `DATABASE_URL` is empty (local dev) |
| `DB_SSLMODE` | – | Fills in `sslmode` when the URL has none |
| `DB_CONN_MAX_AGE` | `60` | Persistent connection lifetime (seconds) |
| `DJANGO_SECRET_KEY` | – | **Required.** Render generates one |
| `DJANGO_DEBUG` | `False` | Keep `False` in production |
| `DJANGO_ALLOWED_HOSTS` | `*` | Comma-separated. `RENDER_EXTERNAL_URL` is added automatically |
| `SERVE_FRONTEND` | `False` | `true` = also serve the React build from Django |
| `CORS_EXTRA_ORIGINS` | – | Extra allowed origins (two-service setup) |
| `CSRF_EXTRA_ORIGINS` | – | Extra trusted origins (two-service setup) |
| `TAVILY_API_KEY` | – | Enables web verification |
| `OLLAMA_URL` / `OLLAMA_MODEL` | local Ollama | OpenAI-compatible **chat endpoint** (see §10) |
| `WEB_CONCURRENCY` | `1` | Gunicorn worker processes (1 ≈ 190 MB RAM) |
| `SKIP_MIGRATE` | `false` | `true` = build without touching the database |

Locally, these live in `backend/.env` (git-ignored); copy `backend/.env.example`.

---

## 7. Your existing data and backups

Your `FakeNewsDetection` database already holds the users and prediction
history, so Render connects straight to it — there is nothing to import.

Take a backup **before** the first Render deploy (cheap insurance, and the
build may run `migrate` against it):

```bash
pg_dump -h localhost -U postgres -Fc "FakeNewsDetection" > fakenews_before_render.dump
```

Restore it if anything goes wrong:

```bash
pg_restore -h localhost -U postgres -d "FakeNewsDetection" --clean fakenews_before_render.dump
```

`FakeNewsdb.sql` in the repo root is a plain-SQL dump of the same data
(produced by pg_dump 18, so restore it with a `psql` of the same major
version). It is only needed if you rebuild the database from scratch:

```bash
createdb -h localhost -U postgres "FakeNewsDetection"
psql -h localhost -U postgres -d "FakeNewsDetection" -f FakeNewsdb.sql
cd backend && python manage.py migrate   # applies anything the dump predates
```

That dump contains `\restrict` / `\unrestrict` meta-commands; if your `psql`
is older than 18, strip them first:

```bash
grep -v -e '^\\restrict' -e '^\\unrestrict' FakeNewsdb.sql > FakeNewsdb.clean.sql
```

## 8. Option B: CGNAT or no port forwarding (tunnel)

If your ISP gives no public IPv4, forward the database through a tunnel. Pick
one of these:

### Cloudflare Tunnel (free, stable hostname, needs a domain)

Only works for HTTP(S) on the free plan, so it suits the **whole app** —
run Django locally and expose it — not a raw PostgreSQL port. Not covered here.

### ngrok TCP tunnel (free, no domain needed)

```bash
ngrok tcp 5432
# Forwarding  tcp://0.tcp.ngrok.io:14328 -> localhost:5432
```

Use `0.tcp.ngrok.io` and port `14328` in `DATABASE_URL`
(`?sslmode=prefer`). The free address changes every restart, so update the
variable in Render when it does. Fine for a demo, awkward for daily use.

### Recommended for real use

Rent the smallest VPS and run PostgreSQL there, or switch to a managed free
Postgres (§12). Both remove the "my PC has to stay on and reachable" problem.

---

## 9. Alternative: two Render services

Use this if you prefer the frontend on Render's CDN as a static site:

1. In `render.yaml`, set `SERVE_FRONTEND` to `"false"`.
2. Add this service (still in `render.yaml`):

   ```yaml
   - type: web
     name: fake-news-frontend
     runtime: static
     rootDir: frontend
     buildCommand: npm ci && npm run build
     staticPublishPath: ./dist
     envVars:
       - key: VITE_API_BASE_URL
         value: https://fake-news-detection.onrender.com/api/
   ```

3. Set `CORS_EXTRA_ORIGINS` and `CSRF_EXTRA_ORIGINS` on the backend to
   `https://fake-news-frontend.onrender.com`.

The frontend uses `HashRouter`, so no rewrite rules are needed.

---

## 10. The AI assistant and web verification

* **AI assistant** — the app calls `OLLAMA_URL`, which defaults to
  `http://127.0.0.1:11434/api/chat`. On Render, `127.0.0.1` is Render's own
  container, so the local Ollama on your PC is *not* reachable. Point
  `OLLAMA_URL` at a hosted OpenAI-compatible chat endpoint and set
  `OLLAMA_MODEL` to its model name, or leave it and accept that the assistant
  returns a "cannot connect" message.
* **Verify news** — needs `TAVILY_API_KEY` (free tier available at
  <https://tavily.com>). Without it that feature returns an error.
* **Contact form** — set `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` (a Gmail
  app password works) or mail is only printed to the Render logs.

---

## 11. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `/api/health/db/` → 503 `connection timeout expired` | Firewall, router forward, or CGNAT. Check from a phone on mobile data. |
| …→ 503 `password authentication failed` | Wrong user/password in the URL, or `scram-sha-256` not allowed in `pg_hba.conf`. |
| …→ 503 `no pg_hba.conf entry for host ...` | Missing `host ... 0.0.0.0/0 scram-sha-256` line, or PostgreSQL not restarted. |
| …→ 503 `SSL required` | Add `?sslmode=require` to the URL. |
| Build fails: `Django==6.0.7 ... Requires-Python >=3.12` | `PYTHON_VERSION` env var must be `3.14` (set in `render.yaml`). |
| Build fails: `No module named psycopg` | `pip install` step was skipped; check the build log for the real error above it. |
| Build fails on `migrate` | Database unreachable from the build container. Fix connectivity, or set `SKIP_MIGRATE=true` and run `python manage.py migrate` from a machine that can reach it (Django Shell on a paid plan, or your PC pointed at the same DB). |
| `DisallowedHost` | Add your domain to `DJANGO_ALLOWED_HOSTS` (comma-separated). |
| CORS error in the browser | Single-service mode should not need CORS; if you split services, set `CORS_EXTRA_ORIGINS` to the exact frontend origin. |
| 401 loop / instant logout | `POST /api/auth/token/refresh/` must reach the backend. It is registered at `api/auth/token/refresh/`. |
| First request takes ~1 minute | Normal on the free plan: the service sleeps after 15 minutes idle. |
| Monthly "suspended" message | 750 free instance-hours used up; they reset at the start of the month. |

Useful commands (Render Dashboard ▸ **Logs**, or **Shell** on paid plans):

```bash
python manage.py check
python manage.py showmigrations
python manage.py shell -c "from django.db import connection; connection.ensure_connection(); print(connection.settings_dict['NAME'])"
```

---

## 12. Is your PC the right database host?

Be aware of what "database on my PC" means once the app is public:

| Point | Detail |
| --- | --- |
| Availability | The site is only up while your PC is on, online, and PostgreSQL is running. |
| Latency | Every query is a round trip between your PC and Render's region. `render.yaml` uses **singapore**, the closest region to India. Expect a few tens of milliseconds per query — fine for this app. |
| Security | Port 5432 is exposed to the internet. Use a long random password, `scram-sha-256`, TLS, and allow only your Render egress IPs if your ISP gives you control (Render's outbound IPs are listed per region in its docs). |
| Backups | Nobody backs up your PC for you. `pg_dump` on a schedule. |
| Free-tier quirk | Render may throttle a free service that makes a high volume of outbound connections. `DB_CONN_MAX_AGE=60` already reuses connections. |

If that trade-off stops being acceptable, the code already supports the
alternative: delete `DATABASE_URL` from the service and let Render manage the
database (`databases:` block at the bottom of `render.yaml`), or point
`DATABASE_URL` at any hosted PostgreSQL (Neon, Supabase, Railway…) — no code
changes either way.

---

## 13. What changed in the repo for this deployment

| File | Change |
| --- | --- |
| `backend/backend/settings.py` | `DATABASE_URL` support (`dj-database-url`), `DB_SSLMODE`, WhiteNoise static files, `SECURE_PROXY_SSL_HEADER`, Render host/origin auto-trust, secure-cookie defaults behind HTTPS, `SERVE_FRONTEND` single-service mode, `DEFAULT_AUTO_FIELD` |
| `backend/backend/views.py` | Serves the React `index.html` in single-service mode |
| `backend/backend/health.py` | `/api/health/` and `/api/health/db/` |
| `backend/backend/urls.py` | Health routes + optional SPA catch-all |
| `backend/accounts/urls.py` | `api/auth/token/refresh/` (the frontend already called it) |
| `backend/build.sh`, `backend/start.sh` | Render build (pip, npm build, collectstatic, migrate) and start (gunicorn) |
| `backend/requirements.txt` | Added `gunicorn`, `whitenoise`, `dj-database-url`; Windows-only packages marked `sys_platform == "win32"` |
| `backend/.python-version`, `.python-version` | Python 3.14 for local tools and Render |
| `render.yaml` | Blueprint: one web service, your `DATABASE_URL`, health check |
| `frontend/src/services/api.js` | Relative `/api/` by default (no hardcoded `:9191`), plus a fixed refresh-token queue |
| `frontend/vite.config.js` | Dev proxy `/api` → `http://127.0.0.1:9191` |
| `frontend/.env.production`, `frontend/.env.example` | Documented API base URLs |
| `.github/workflows/ci-cd.yml` | Python 3.14, runs migrations in CI |
| `.gitignore` | Ignores `backend/staticfiles/`, `backend/frontend_dist/`, `frontend/.env.local` |

Windows/IIS files (`web.config`, `run_backend.ps1`, waitress) are untouched and
still work.
