# Local setup

## 1. Backend

Open terminal 1:

```bash
cd CharterIQ_SIH_UPGRADED/backend
python -m venv .venv
.venv\\Scripts\\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000/docs`.

## 2. Frontend

Open terminal 2:

```bash
cd CharterIQ_SIH_UPGRADED/frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Vite proxies `/api` to the local FastAPI backend, so the frontend does not need a hard-coded localhost origin.

## 3. Offline fallback

Even if the API is unavailable, the frontend has deterministic fallback demo data so the UI remains usable. Once the API comes online it replaces the fallback values.
