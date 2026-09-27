# CharterIQ Data Strategy

## 1. Source tiers

### Tier A — operational constraints
Use official port authority / government publications for hard physical limits.

Examples used in this prototype:

- Paradip Port Authority berth specifications: admissible LOA, beam and draft.
- Visakhapatnam Port Authority berth particulars: permissible LOA and draft.
- Dhamra public/government material for deep-draft and dry-bulk capability.

### Tier B — market/commodity context

- Baltic Exchange: dry-bulk assessments, including Capesize, Panamax, Supramax and Handysize; historical dry data is available commercially.
- World Bank Pink Sheet: monthly commodity price data, including Australian coal.
- BDI reference snapshots can be consumed from a licensed data provider; a public delayed reference is used only as a research anchor.

### Tier C — vessel and port-state telemetry

For a production deployment, connect institution-approved or licensed providers for:

- AIS position / ETA / vessel status
- vessel particulars (DWT, LOA, beam, draft, speed, consumption)
- port waiting time / berth occupancy
- weather and tide
- bunker prices

### Tier D — trade and demand

Use UNCTADstat, UN Comtrade or an approved government source for:

- annual/monthly seaborne trade
- import/export volumes
- port calls and turnaround context
- bilateral trade and commodity flows

## 2. What the prototype currently uses

The prototype uses:

- Research-backed port constraints.
- A current BDI benchmark snapshot (clearly labelled as an external market reference).
- A World Bank Australian coal benchmark reference.
- A synthetic/proxy route-freight series by vessel class for reproducible forecasting behavior.
- Scenario assumptions for congestion, availability and voyage miles.

The proxy series is **not** represented as an official Baltic route quote.

## 3. Recommended production feature table

| Feature family | Examples | Frequency |
|---|---|---|
| freight | route assessment, BDI sub-index, FFA | daily |
| commodity | coal price, iron ore price, demand | daily/monthly |
| trade | import volume, origin mix | monthly |
| vessel | DWT, draft, ETA, availability | near-real-time |
| port | berth occupancy, waiting time, handling rate | daily/near-real-time |
| bunker | VLSFO/MGO proxy | daily |
| weather | wind, wave, visibility | hourly/daily |
| seasonality | monsoon, holidays, production cycles | engineered |

## 4. Feature engineering

Examples:

- 7/30/90-day rolling mean and standard deviation
- lagged freight and bunker values
- congestion trend and spike score
- origin-to-port lead time
- vessel-size utilisation
- vessel-port hard feasibility
- estimated waiting cost
- uncovered cargo percentage
- contract coverage level
- route resilience under stress

## 5. Labels / evaluation

For freight forecasting:

- MAE
- RMSE
- MAPE / sMAPE where appropriate
- directional accuracy
- prediction interval coverage

For decision quality:

- expected procurement cost
- downside cost under stress scenarios
- waiting/demurrage exposure
- deadheading exposure
- cargo coverage
- number of hard-constraint violations

## 6. Data adapter principle

The UI and optimization engine should not care whether data comes from a CSV, PostgreSQL table, REST API, message stream, or licensed maritime provider.

Every external connector should land in a common normalized schema before forecasting/optimization.
