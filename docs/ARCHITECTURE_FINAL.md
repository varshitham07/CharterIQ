# CharterIQ Architecture v2

```text
                    CARGO REQUIREMENT
                           |
                           v
                  +-------------------+
                  | Scenario State    |
                  +---------+---------+
                            |
                +-----------+------------+
                |                        |
                v                        v
        MARKET INTELLIGENCE       OPERATIONAL INTELLIGENCE
        forecast / volatility     vessel / port / congestion
                |                        |
                +-----------+------------+
                            v
                  CONSTRAINT & ECONOMICS
                            |
                            v
                  CONTRACT COVERAGE
                            |
                            v
                    PROCUREMENT TWIN
                            |
                            v
                   WHAT-IF STRESS LAB
                            |
                            v
                    DECISION WORKSPACE
```

## Engine design

- Forecast engine: explainable hybrid baseline for prototype; production adapter can swap in LightGBM/XGBoost/SARIMA/temporal models.
- Constraint engine: hard physical constraints first; scoring second.
- Contract engine: coverage strategies with transparent trade-offs.
- Scenario engine: shared state; shock one factor and recompute downstream modules.
- Explainability layer: every result carries reasons / drivers / source status.

## Why this architecture is judge-friendly

It demonstrates a chain of causality rather than isolated model widgets.

## Production progression

Prototype CSV → PostgreSQL → licensed freight/AIS/port feeds → retrained models → optimization solver (MILP/OR-Tools) → alerts/event stream → ERP integration.
