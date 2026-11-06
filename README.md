# 📰 Fake News Detection System

A full-stack **Fake News Detection System** that uses Machine Learning to classify news articles as **Real** or **Fake**.

The application provides a modern React dashboard, Django REST API backend, Machine Learning prediction model, JWT-based authentication, prediction history, analytics, and separate dashboards for normal users and administrators.

---

## 🚀 Features

### 👤 User Features

- User registration
- User login
- JWT authentication
- User profile
- Change password
- Fake news prediction
- Real/Fake prediction result
- Prediction confidence score
- Prediction history
- Search prediction history
- Filter predictions by Real/Fake
- Delete individual predictions
- Clear prediction history
- Export history as PDF
- Export history as CSV
- Prediction statistics
- Prediction distribution chart
- Prediction activity trend chart
- Dark mode support
- Responsive dashboard

---

### 🛡️ Admin Features

- Admin authentication
- Admin dashboard
- Total users statistics
- Total predictions statistics
- Real/Fake prediction statistics
- Prediction analytics
- User management
- Search users
- Delete users
- Recent prediction monitoring
- Separate admin interface
- Admin-only protected routes

---

## 🧠 Machine Learning

The project uses a Machine Learning text classification model to determine whether a news article is Real or Fake.

## Local PostgreSQL Setup

Django stores users, prediction history, and other application records in the local PostgreSQL database. The CSV files in `backend/dataset` remain the machine-learning training data; changing the application database does not replace or import those files.

1. Create a PostgreSQL database and user locally.
2. Add these values to `backend/.env`:

   ```dotenv
   POSTGRES_DB=FakeNewsDetection
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your-local-postgres-password
   POSTGRES_HOST=127.0.0.1
   POSTGRES_PORT=5432
   ```

3. From the project root, install the backend dependencies and create the database tables:

   ```powershell
   .\backend\venv\Scripts\python.exe -m pip install -r .\backend\requirements.txt
   .\backend\venv\Scripts\python.exe .\backend\manage.py migrate
   ```

   If you use a different virtual environment, run the same commands with its Python executable.

The existing `backend\db.sqlite3` file is not modified. To copy its application records into PostgreSQL, export them before loading them into the new database:

```powershell
Set-Location .\backend
.\venv\Scripts\python.exe manage.py dumpdata --database legacy_sqlite --natural-foreign --natural-primary --exclude contenttypes --exclude auth.permission --indent 2 -o sqlite-data.json
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py loaddata sqlite-data.json
```

Keep the exported fixture private because it contains user and prediction data, and remove it after the migration. If you do not need the SQLite records, skip the export and `loaddata` steps.

### Using a connection string

Instead of the five `POSTGRES_*` values you can set a single URL (this is what
hosting providers hand out, and what Render uses):

```dotenv
DATABASE_URL=postgresql://user:password@host:5432/FakeNewsDetection?sslmode=require
```

`DATABASE_URL` takes precedence over the `POSTGRES_*` variables. `DB_SSLMODE`
fills in the SSL mode when the URL does not contain one.

### Run the frontend and backend together

The React app uses the relative URL `/api/` by default, so the simplest local
setup is to let Django serve the built frontend:

```powershell
Set-Location .\frontend
npm run build
Set-Location ..\backend
New-Item -ItemType Directory -Force frontend_dist | Out-Null
Copy-Item -Recurse -Force ..\frontend\dist\* frontend_dist\
$env:SERVE_FRONTEND = "true"
.\venv\Scripts\python.exe -m waitress --host=0.0.0.0 --port=9191 backend.wsgi:application
```

Then open <http://localhost:9191>.

For live-reload development with two servers, keep the Vite dev server and run
Django on port 9191 — the dev server proxies `/api` there automatically
(`frontend/vite.config.js`).

### Deploying to Render

See **[RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)**: it covers connecting the
app to a PostgreSQL database on your own PC, or to a Render-managed database,
plus the environment variables and health checks.

Health endpoints: `/api/health/` (process up) and `/api/health/db/` (database
reachable).

### Machine Learning Pipeline

```text
News Article
     │
     ▼
Text Cleaning
     │
     ▼
TF-IDF Vectorization
     │
     ▼
Machine Learning Model
     │
     ▼
Prediction
     │
     ├── Real
     │
     └── Fake