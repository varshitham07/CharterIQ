# Competitive / peer landscape — SIH26006

## Problem reality

SIH26006 is broader than a rate forecast. It calls for future freight forecasting, market-entry timing, vessel selection, port infrastructure constraints, idle-time management, risk mitigation and a move toward short/medium-term multi-voyage contracts.

## Existing commercial technology

### Veson IMOS
Veson positions IMOS as a chartering and voyage-management platform with freight calculations, voyage estimates, contract types, scenario comparison and market-data integrations.

### Oceanbolt
Veson's Oceanbolt provides maritime market intelligence around commodity flows, freight tonnage flows, vessel positions and port-related information.

### Baltic Exchange
Baltic provides independent dry-bulk spot and forward assessments for Capesize, Panamax, Supramax and Handysize, with long historical depth.

**Conclusion:** “No existing system exists” would be inaccurate.

## Emerging peer landscape

A public SIH26006 repository named **FreightIQ** already combines vessel lineup, port constraints, freight observations, trade data, risk events, forecasting and recommendation modules. A solution that is only “forecast + vessel recommendation + port database” can therefore look structurally similar to another participant.

## CharterIQ differentiation hypothesis

The product should differentiate through the **decision architecture** rather than claiming novel ownership of individual components:

1. Start with a future cargo requirement.
2. Generate an uncertainty-aware market signal.
3. Apply hard physical vessel-port constraints.
4. Evaluate contract coverage as a portfolio decision.
5. Stress-test the same shared scenario state.
6. Show the causal reasons a decision landscape changed.
7. Preserve data lineage and disclose proxy/synthetic data.

## Product statement

> CharterIQ is a procurement digital twin that lets a charterer test the consequences of future freight, vessel and port conditions before making a real-world bulk-cargo chartering commitment.

## What not to claim

- Not the first maritime AI.
- Not the first freight forecast model.
- Not a replacement for commercial chartering systems.
- Not live AIS unless a live feed is actually connected.
- Not an official Baltic route quote when the demo uses a proxy series.
- Not guaranteed savings or autonomous chartering.

## Judge differentiation test

A judge should be able to change one variable and observe the downstream chain change:

**Freight shock → forecast changes → exposure changes → contract landscape changes**

**Congestion shock → wait/port score changes → alternative port becomes relevant**

**Vessel availability shock → feasible fleet changes → resilience changes**
