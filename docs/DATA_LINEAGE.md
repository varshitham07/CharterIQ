# Data lineage visible to judges

### Market benchmark
**BDI reference** → external public delayed snapshot → context only

### Commodity benchmark
**Australian coal price** → World Bank Pink Sheet → monthly exogenous feature reference

### Port constraints
**Berth LOA / beam / draft** → official port authority/government materials where available → hard constraints

### Freight forecast target
**East Coast route proxy** → reproducible synthetic/proxy series → demo target only

### Future production data
Licensed freight assessments + vessel AIS/ETA + port telemetry + weather/tide + institutional procurement data → normalized data layer → model + optimizer
