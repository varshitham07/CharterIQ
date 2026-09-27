# Current research snapshot — 23 Sep 2026

## SIH problem
SIH26006 is listed as a Ministry of Steel software problem under Transportation & Logistics. The statement explicitly covers volatile freight markets, future entry points for short/mid-term charters, vessel-class selection, origin/destination port constraints and idle-time risk.

## Market anchor
A public delayed BDI reference showed **3,432 on 22 Sep 2026**. This is used only as a market-context anchor; it is not treated as an India East Coast route quote.

## Commodity anchor
The World Bank's February 2026 Pink Sheet lists Australian coal at **$109.8/mt for January 2026**. The Pink Sheet is a monthly commodity-price dataset and should be joined as an exogenous feature when modeling future freight.

## Port anchors
Paradip Port Authority's berth specification page (updated 23 Feb 2026) lists berth-specific admissible LOA, beam and draft limits. Examples include 300 m LOA / 46 m beam / 14.50 m draft for Coal Berth 01 and 300 m / 46 m / 14.50 m for Coal Berth 02, with higher draft possible under specified high-tide conditions in some berths.

Visakhapatnam Port Authority currently publishes berth particulars and lists 240 m LOA and 14.50 m permissible draft for East Quay 1, which handles steam coal.

Dhamra public/government material describes 18 m draft and large dry-bulk vessel capability; a current berth-level operational rule should be confirmed before production use.

## Data availability conclusion
The strongest prototype path is:

**public/official constraints + public macro/commodity features + transparent proxy freight series + adapter-ready licensed feeds**.

Do not fabricate “live” route assessments when commercial access is not actually available.

## Reference pages

- SIH26006 problem statement: https://sih2026.vuce.in/ps/SIH26006
- Baltic Exchange dry-bulk indices: https://www.balticexchange.com/en/data-services/market-information0/indices.html
- World Bank commodity markets / Pink Sheet: https://www.worldbank.org/en/research/commodity-markets
- Paradip Port Authority berth specifications: https://paradipport.gov.in/berth-specifications/
- Visakhapatnam Port Authority berth particulars: https://vpt.shipping.gov.in/Template/navigateTemplate/gnt/QmVydGhz
- UNCTADstat: https://unctadstat.unctad.org/datacentre/
- NOAA/MarineCadastre AIS portal: https://marinecadastre.gov/ais/
