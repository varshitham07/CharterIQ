# 90-day progression from SIH prototype to pilot

## 0–30 days: data and model credibility

- replace proxy freight series with institution-approved route assessments
- add proper daily/weekly BDI sub-indices and commodity feature joins
- build rolling-origin evaluation
- add real vessel particulars and vessel-availability snapshots
- add current berth-level port constraints

## 31–60 days: optimization

- introduce OR-Tools / MILP coverage optimization
- model cargo parcel splitting across multiple voyages
- model laycan windows and berth windows
- estimate waiting/demurrage and deadheading
- add alternative-port economics

## 61–90 days: operational intelligence

- integrate AIS/ETA where licensed
- add port congestion telemetry
- add weather/tide signals
- compare prediction vs actual outcomes
- create a retraining / drift monitor
- connect to ERP/procurement workflows
