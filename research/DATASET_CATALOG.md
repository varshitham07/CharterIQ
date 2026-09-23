# Dataset Catalog for CharterIQ

| Dataset / source | Use | Public? | Prototype status |
|---|---|---|---|
| Baltic Exchange dry-bulk assessments | target freight signal | licensed | benchmark only |
| BDI historical reference | broad market factor | mixed / licensed by source | external reference |
| World Bank Pink Sheet | Australian coal price | yes | benchmark reference |
| UNCTADstat | port/trade context | yes | planned adapter |
| Port authority specs | hard vessel-port constraints | yes | partially seeded |
| AIS / vessel provider | vessel positions/ETA | licensed/institutional | adapter-ready |
| Weather/tide | operational uncertainty | depends on provider | adapter-ready |
| Demo freight proxy | reproducible forecast | internal synthetic | active demo |

## Recommended data join key

`date + origin + destination + vessel_class`

## Recommended ML feature block

`freight_lag_1, freight_roll_7, freight_roll_30, bdi, coal_price, bunker, port_congestion, vessel_availability, season_month, shipment_count, cargo_coverage`
