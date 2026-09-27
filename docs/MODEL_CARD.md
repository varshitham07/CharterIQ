# CharterIQ Prototype Model Card

## Purpose
Estimate a forward freight-proxy signal for demo decision support, then propagate the uncertainty into charter/contract scenario analysis.

## Prototype model

The current API implements an explainable hybrid baseline:

- recent level
- local linear trend
- mild recurring seasonality
- residual-based uncertainty widening with forecast horizon

This is intentionally lightweight so the SIH prototype runs on Python 3.14 without complex native ML build dependencies.

## Why not claim deep learning?

A complex model is not automatically a better model. The correct production choice should be based on time-series cross-validation and route-level data availability.

A production evaluation track should compare:

- naive / seasonal naive
- Holt-Winters / SARIMA
- gradient boosting with lagged market + commodity + congestion features
- temporal neural model only if the data volume justifies it

## Outputs

- P10 / P50 / P90 forecast band
- trend direction
- volatility proxy
- confidence indicator
- driver attribution

## Limitations

The route series in the demo is a synthetic/proxy series. The result must not be represented as a licensed market quote or as operational trading advice.

## Validation plan

Use rolling-origin validation and report MAE, RMSE, sMAPE, directional accuracy and interval coverage by route/vessel class.
