# Likely judge questions — CharterIQ

## “Isn't this already available?”
“Yes. Commercial maritime platforms already cover chartering, voyage estimation, market intelligence and scenario analysis. Our contribution is a focused predictive procurement workflow for SIH26006 that starts from future cargo demand and propagates uncertainty through vessel-port feasibility, contract coverage and stress testing. We do not claim that every component is novel by itself.”

## “Where is your data?”
“The prototype separates source tiers. Official port constraints and public commodity references are seeded directly; the route freight series is explicitly a proxy/synthetic series because route-level licensed assessments are not freely reproducible. The architecture is feed-agnostic and ready to ingest licensed freight/AIS/port telemetry.”

## “Why use AI?”
“The AI/ML component is used where prediction or classification helps: forward freight signal, volatility and disruption features. Physical constraints are deterministic, and contract coverage is optimization logic. We avoid using an LLM to make safety-critical numerical decisions.”

## “Why not deep learning?”
“For a route-level time series, model choice should follow validation and data volume. We compare a transparent baseline first. In production we would benchmark seasonal naïve, SARIMA/Holt-Winters and gradient-boosted lag features using rolling-origin validation before introducing a higher-capacity temporal model.”

## “What is your real innovation?”
“The innovation is the decision architecture and the shared scenario state. A freight shock can change forecast, market exposure, contract trade-offs and downstream port/vessel decisions together.”

## “Does it guarantee savings?”
“No. It provides scenario evidence and exposes trade-offs. Actual savings depend on market conditions, charter terms, execution and data quality.”

## “Can this become a real product?”
“Yes, through a staged progression: prototype CSV → PostgreSQL → licensed freight/AIS/port feeds → model validation/retraining → MILP/OR-Tools optimization → alert/event stream → ERP integration.”
