# CharterIQ — SIH 2026 Upgrade

**Forecast the market. Match the vessel. Optimize the contract.**

CharterIQ is a research-backed prototype for SIH26006: a predictive bulk-cargo chartering decision-support platform for overseas procurement to India's East Coast.

## What changed in this upgrade

This build deliberately moves away from a generic “AI forecasting dashboard” and treats the problem as a **procurement decision under uncertainty**.

Core loop:

**CARGO REQUIREMENT → FORECAST → RISK → VESSEL MATCH → PORT VALIDATION → CONTRACT COVERAGE → WHAT-IF → DECISION**

The product has five logical AI/optimization workers underneath the workflow:

1. Market Intelligence — forecast signal + uncertainty.
2. Vessel Intelligence — capacity and hard dimension checks.
3. Port Intelligence — berth envelope and congestion pressure.
4. Procurement Intelligence — compare spot / short-term / multi-voyage coverage.
5. Disruption Intelligence — re-evaluate the decision when freight, congestion or vessel availability changes.

## Important data honesty

This prototype intentionally does **not** pretend that a live Baltic Exchange feed, live AIS feed, or institutional SAIL procurement database is connected.

- Research-backed public references are used for benchmark/context values.
- Port constraints are sourced from public port-authority/government documents where available.
- The route freight series in `backend/data/freight_history.csv` is a **prototype proxy/synthetic series** designed for reproducible demo behavior, not a licensed route assessment.
- Production adapters are documented in `docs/DATA_STRATEGY.md`.

This separation protects the demo from a judge asking whether a number is live, licensed, or simulated.

## Run on Python 3.14

### Backend

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open: `http://127.0.0.1:8000/docs`

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

## Judge demo

Use the default scenario:

- 300,000 MT coal
- Australia → Paradip
- 6-month requirement

Then demonstrate:

1. baseline forecast
2. vessel fit
3. port pressure
4. contract coverage trade-offs
5. Freight +15%
6. Congestion +30%
7. Vessel availability −35%

The purpose is to show that the **same scenario state propagates through the decision system**, rather than displaying unrelated AI widgets.

## Folder guide

- `backend/` — FastAPI decision engine and prototype data
- `frontend/` — React/Vite operator console
- `data/` — research-backed seed tables and lineage notes
- `docs/` — product, architecture, model, pitch and demo material
- `research/` — competitor/data-source analysis
- `database/` — future relational schema blueprint
- `scripts/` — helper scripts and validation utilities

## Research anchor sources

See `research/competitive_scan.md` and `docs/DATA_STRATEGY.md` for source links and limitations.
