# Internal readiness checklist

## Product
- [x] future cargo requirement drives the workflow
- [x] freight uncertainty shown
- [x] vessel-port hard constraints enforced
- [x] contract coverage comparison
- [x] shared-state stress testing
- [x] explainability / data disclosure

## Data integrity
- [x] proxy freight series explicitly labelled
- [x] research-backed public anchors documented
- [x] no claim of live AIS
- [ ] licensed route data connected
- [ ] production vessel feed connected
- [ ] production congestion feed connected

## Engineering
- [x] Python 3.14-oriented lightweight dependency set
- [x] FastAPI API layer
- [x] React/Vite frontend
- [x] deterministic fallback data for offline demo
- [ ] PostgreSQL persistence
- [ ] ML training pipeline
- [ ] production authentication/RBAC

## Demo
- [x] default 300,000 MT Australia → Paradip scenario
- [x] baseline
- [x] freight shock
- [x] congestion shock
- [x] vessel availability shock
- [x] judge script
