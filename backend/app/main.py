from __future__ import annotations

from datetime import date, timedelta
from math import sqrt
from pathlib import Path
import csv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data"

app = FastAPI(title="CharterIQ API", version="2.0.0", description="Predictive bulk-cargo chartering decision support prototype")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PORTS = [
    {"name": "Paradip", "code": "INPRT", "lat": 20.264, "lon": 86.704, "max_loa": 300, "max_beam": 46, "max_draft": 14.5, "coal": True, "handling": 52000, "congestion": 38},
    {"name": "Dhamra", "code": "INDMA", "lat": 20.785, "lon": 86.968, "max_loa": 305, "max_beam": 48, "max_draft": 18.0, "coal": True, "handling": 60000, "congestion": 27},
    {"name": "Visakhapatnam", "code": "INVIZ", "lat": 17.686, "lon": 83.218, "max_loa": 240, "max_beam": 42, "max_draft": 14.5, "coal": True, "handling": 47000, "congestion": 44},
    {"name": "Gangavaram", "code": "INGPT", "lat": 17.602, "lon": 83.220, "max_loa": 300, "max_beam": 50, "max_draft": 17.8, "coal": True, "handling": 65000, "congestion": 31},
    {"name": "Gopalpur", "code": "INGOP", "lat": 19.258, "lon": 84.910, "max_loa": 245, "max_beam": 40, "max_draft": 12.5, "coal": True, "handling": 32000, "congestion": 22},
    {"name": "Haldia", "code": "INHAL", "lat": 22.025, "lon": 88.058, "max_loa": 230, "max_beam": 36, "max_draft": 9.8, "coal": True, "handling": 28000, "congestion": 51},
    {"name": "Sagar-Sandheads", "code": "INSAG", "lat": 21.64, "lon": 88.03, "max_loa": 290, "max_beam": 46, "max_draft": 13.5, "coal": True, "handling": 40000, "congestion": 36},
]

VESSELS = [
    {"name": "MV Eastern Horizon", "class": "Panamax", "dwt": 76000, "loa": 225, "beam": 32.3, "draft": 13.5, "speed": 13.5, "fuel_laden": 28, "availability": 86, "age": 8},
    {"name": "MV Ocean Meridian", "class": "Supramax", "dwt": 58000, "loa": 190, "beam": 32.2, "draft": 12.6, "speed": 13.2, "fuel_laden": 24, "availability": 91, "age": 6},
    {"name": "MV Cape Pioneer", "class": "Capesize", "dwt": 150000, "loa": 275, "beam": 43.0, "draft": 17.0, "speed": 14.0, "fuel_laden": 46, "availability": 63, "age": 11},
    {"name": "MV Coast Trader", "class": "Handysize", "dwt": 38000, "loa": 180, "beam": 30.0, "draft": 10.5, "speed": 12.8, "fuel_laden": 21, "availability": 94, "age": 5},
]

LATEST_BDI = 3432.0
LATEST_BDI_DATE = "2026-09-22"
AU_COAL_JAN_2026 = 109.8

def load_bdi_reference():
    path = DATA.parent.parent / 'data' / 'bdi_recent_reference.csv'
    if not path.exists():
        return []
    out=[]
    with path.open(newline='', encoding='utf-8') as f:
        for r in csv.DictReader(f):
            out.append({'date':r['date'],'bdi':float(r['bdi'])})
    return out

BDI_REFERENCE = load_bdi_reference()

class CargoRequest(BaseModel):
    commodity: str = "Coal"
    quantity_mt: float = Field(300000, gt=0, le=2000000)
    origin: str = "Australia"
    destination: str = "Paradip"
    horizon_months: int = Field(6, ge=1, le=24)
    shipments: int | None = Field(None, ge=1, le=24)
    bunker_usd_t: float = Field(520, ge=250, le=1200)
    congestion_shock_pct: float = Field(0, ge=-50, le=200)
    freight_shock_pct: float = Field(0, ge=-50, le=200)
    vessel_availability_shock_pct: float = Field(0, ge=-90, le=50)
    coverage_pref_pct: float = Field(50, ge=0, le=100)

class SimulationRequest(CargoRequest):
    scenario_name: str = "Custom stress test"


def load_history():
    path = DATA / "freight_history.csv"
    rows = []
    with path.open(newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            rows.append({k: (float(v) if k not in {"date", "vessel_class", "origin", "destination"} else v) for k, v in r.items()})
    return rows

HISTORY = load_history()


def series_for(vessel_class: str):
    return [r for r in HISTORY if r["vessel_class"] == vessel_class]


def forecast_for(vessel_class: str, horizon: int, freight_shock_pct: float = 0):
    s = series_for(vessel_class)
    vals = [r["route_proxy_usd_t"] for r in s]
    last_n = min(12, len(vals))
    recent = vals[-last_n:]
    # Explainable hybrid baseline: recent level + trend + mild seasonality.
    x = list(range(last_n))
    xbar = sum(x) / last_n
    ybar = sum(recent) / last_n
    denom = sum((i - xbar) ** 2 for i in x) or 1
    slope = sum((x[i] - xbar) * (recent[i] - ybar) for i in range(last_n)) / denom
    residuals = [recent[i] - (ybar + slope * (i - xbar)) for i in range(last_n)]
    rmse = sqrt(sum(e * e for e in residuals) / last_n)
    out = []
    last = vals[-1]
    for i in range(1, horizon + 1):
        season = 1 + 0.028 * (((i + 1) % 6) - 2.5)
        mid = (last + slope * i) * season * (1 + freight_shock_pct / 100)
        uncertainty = max(0.8, rmse * (1 + 0.055 * i))
        out.append({
            "month": i,
            "p10": round(max(1, mid - 1.28 * uncertainty), 2),
            "p50": round(mid, 2),
            "p90": round(mid + 1.28 * uncertainty, 2),
        })
    trend = "Rising" if slope > 0.15 else "Falling" if slope < -0.15 else "Stable"
    vol = min(100, round((sum(abs(v - ybar) for v in recent) / last_n) / max(1, ybar) * 250))
    return out, trend, vol, round(slope, 3), round(rmse, 3)


def port_by_name(name: str):
    return next((p for p in PORTS if p["name"].lower() == name.lower()), PORTS[0])


def vessel_fit(vessel, port, cargo_qty):
    reasons = []
    feasible = True
    if vessel["loa"] > port["max_loa"]:
        feasible = False; reasons.append(f"LOA {vessel['loa']}m exceeds berth limit {port['max_loa']}m")
    if vessel["beam"] > port["max_beam"]:
        feasible = False; reasons.append(f"Beam {vessel['beam']}m exceeds limit {port['max_beam']}m")
    if vessel["draft"] > port["max_draft"]:
        feasible = False; reasons.append(f"Draft {vessel['draft']}m exceeds limit {port['max_draft']}m")
    if vessel["dwt"] < min(cargo_qty, vessel["dwt"]):
        pass
    utilization = min(1, cargo_qty / vessel["dwt"])
    return feasible, reasons, round(utilization * 100)


def mileage(origin: str, destination: str):
    # Prototype nautical-mile proxy used only for scenario economics; replace via voyage/port feed later.
    table = {
        ("Australia", "Paradip"): 4100, ("Australia", "Dhamra"): 4050, ("Australia", "Visakhapatnam"): 4350,
        ("Australia", "Gangavaram"): 4360, ("Australia", "Gopalpur"): 4230, ("Australia", "Haldia"): 4200,
        ("Indonesia", "Paradip"): 2600, ("Mozambique", "Paradip"): 4200, ("US", "Paradip"): 9800, ("Russia", "Paradip"): 6400,
    }
    return table.get((origin, destination), table.get((origin, "Paradip"), 5000))


def strategy_table(qty, base_freight, volatility, coverage_pref):
    strategies = [
        ("Spot", 0, 0.0, 1.00),
        ("25% short-term + 75% spot", 25, 0.010, 0.92),
        ("50% short-term + 50% spot", 50, 0.018, 0.84),
        ("75% multi-voyage + 25% spot", 75, 0.030, 0.77),
        ("90% multi-voyage + 10% spot", 90, 0.044, 0.70),
    ]
    rows = []
    for name, cov, premium, flex in strategies:
        covered_rate = base_freight * (1 + premium)
        spot_rate = base_freight * (1 + volatility / 120)
        expected = cov/100 * covered_rate + (1-cov/100) * spot_rate
        exposure = (1-cov/100) * qty * volatility / 100
        rows.append({
            "strategy": name,
            "coverage_pct": cov,
            "expected_freight_usd_t": round(expected, 2),
            "expected_procurement_usd": round(expected * qty, 0),
            "market_exposure_usd": round(exposure * base_freight, 0),
            "flexibility_pct": round(flex * 100),
            "commitment_level": "Low" if cov < 30 else "Medium" if cov < 75 else "High",
            "tradeoff": "Maximum flexibility; highest spot exposure" if cov == 0 else "Balanced exposure" if cov == 50 else "Higher price certainty; lower flexibility" if cov >= 75 else "Partial hedge against market movement",
            "distance_from_preference": abs(cov - coverage_pref),
        })
    return rows


def analyze(req: CargoRequest):
    port = port_by_name(req.destination)
    horizon = req.horizon_months
    shipments = req.shipments or max(1, round(horizon * 1.2))
    bdi_momentum = 0
    if len(BDI_REFERENCE) >= 6:
        bdi_momentum = (BDI_REFERENCE[-1]['bdi'] / BDI_REFERENCE[-6]['bdi'] - 1) * 100
    forecast, trend, volatility, slope, rmse = forecast_for("Panamax", horizon, req.freight_shock_pct + max(-8, min(8, bdi_momentum * 0.18)))
    base_freight = forecast[0]["p50"]
    vessel_rows = []
    for v in VESSELS:
        adjusted_availability = max(5, min(99, v["availability"] + req.vessel_availability_shock_pct))
        feasible, reasons, utilization = vessel_fit(v, port, min(req.quantity_mt / shipments, v["dwt"]))
        score = 0
        score += 35 if feasible else 0
        score += min(25, utilization / 4)
        score += adjusted_availability / 5
        score += max(0, 15 - abs(v["draft"] - port["max_draft"]) * 4)
        if reasons:
            for reason in reasons: pass
        vessel_rows.append({**v, "availability": round(adjusted_availability), "feasible": feasible, "reasons": reasons or ["Dimensions are within current port envelope"], "utilization_pct": utilization, "score": round(score,1)})
    vessel_rows.sort(key=lambda x: (x["feasible"], x["score"]), reverse=True)

    port_rows = []
    for p in PORTS:
        cong = max(0, min(100, p["congestion"] * (1 + req.congestion_shock_pct / 100)))
        miles = mileage(req.origin, p["name"])
        feasible_candidates = [v for v in VESSELS if vessel_fit(v,p,min(req.quantity_mt/shipments,v["dwt"]))[0]]
        transit_days = miles / 13.2 / 24
        waiting_days = 0.35 + cong / 38 * 1.9
        port_rows.append({
            **p,
            "congestion": round(cong),
            "waiting_days": round(waiting_days,1),
            "transit_days": round(transit_days,1),
            "feasible_vessel_classes": sorted(set(v["class"] for v in feasible_candidates)),
            "route_score": round(100 - cong*0.55 - waiting_days*5 + min(10, p["handling"]/7000),1)
        })
    port_rows.sort(key=lambda x: x["route_score"], reverse=True)

    volatility_pct = max(1.5, volatility / 2.0)
    strategies = strategy_table(req.quantity_mt, base_freight, volatility_pct, req.coverage_pref_pct)
    preference = min(strategies, key=lambda x: x["distance_from_preference"])
    selected = next((v for v in vessel_rows if v["feasible"]), vessel_rows[0])
    alerts = []
    if trend == "Rising": alerts.append({"severity":"watch","title":"Freight pressure building","detail":"Recent route proxy trend is rising; review near-term market entry windows."})
    if port["congestion"] > 45: alerts.append({"severity":"watch","title":"Port congestion elevated","detail":f"{port['name']} baseline congestion is elevated; alternative-port analysis is active."})
    if selected["availability"] < 70: alerts.append({"severity":"critical","title":"Vessel availability risk","detail":f"{selected['name']} has only {selected['availability']}% availability score under current assumptions."})
    if not any(v["feasible"] for v in vessel_rows): alerts.append({"severity":"critical","title":"No vessel passes current hard constraints","detail":"Re-size the parcel, extend the shipment window, or evaluate another destination."})
    return {
        "as_of": "2026-09-23",
        "request": req.model_dump(),
        "market": {
            "bdi_reference": LATEST_BDI,
            "bdi_5_session_momentum_pct": round(bdi_momentum,2),
            "bdi_as_of": LATEST_BDI_DATE,
            "australia_coal_reference_usd_t": AU_COAL_JAN_2026,
            "route_proxy_current_usd_t": round(base_freight,2),
            "trend": trend,
            "volatility_index": volatility,
            "forecast_method": "Explainable hybrid baseline: recent level + linear trend + seasonality; prototype proxy data",
        },
        "forecast": forecast,
        "vessels": vessel_rows,
        "ports": port_rows,
        "contract_strategies": strategies,
        "coverage_preference": preference["strategy"],
        "confidence": max(55, min(91, round(87 - volatility*0.35 - rmse*1.3))),
        "drivers": [
            {"name":"Freight trend", "impact":"up" if slope > 0 else "down", "weight": 34},
            {"name":"Port congestion", "impact":"up" if port["congestion"] > 40 else "neutral", "weight": 23},
            {"name":"Cargo coverage", "impact":"neutral", "weight": 20},
            {"name":"Vessel availability", "impact":"up" if selected["availability"] < 75 else "neutral", "weight": 23},
        ],
        "alerts": alerts,
        "decision_note": "No single strategy is universally optimal. CharterIQ exposes cost, exposure and flexibility trade-offs so the charterer can select a strategy consistent with the cargo plan and risk appetite.",
        "data_disclosure": "Prototype scenario uses researched port constraints and benchmark references plus explicitly labelled proxy/synthetic time series. Replace proxy feeds with licensed route assessments/AIS/port telemetry for production use.",
        "shipments": shipments,
    }

@app.get("/")
def root():
    return {"service":"CharterIQ API","version":"2.0.0","docs":"/docs"}

@app.get("/api/health")
def health():
    return {"status":"ok","service":"charteriq-api","data_mode":"prototype-research-backed"}

@app.get("/api/ports")
def ports():
    return PORTS

@app.get("/api/vessels")
def vessels():
    return VESSELS

@app.get("/api/market/snapshot")
def market_snapshot():
    return {"bdi":LATEST_BDI,"bdi_as_of":LATEST_BDI_DATE,"bdi_recent":BDI_REFERENCE,"australia_coal_usd_t":AU_COAL_JAN_2026,"source_note":"BDI reference snapshot and World Bank Australian coal benchmark used as research anchors; route quote is a prototype proxy."}

@app.post("/api/procurement/analyze")
def procurement_analyze(req: CargoRequest):
    return analyze(req)

@app.post("/api/procurement/simulate")
def procurement_simulate(req: SimulationRequest):
    return analyze(req)
