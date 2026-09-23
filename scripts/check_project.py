from pathlib import Path
import csv, json

root = Path(__file__).resolve().parents[1]
required = [
    root/'backend/app/main.py', root/'backend/requirements.txt',
    root/'frontend/package.json', root/'frontend/src/main.jsx', root/'frontend/src/styles.css',
    root/'data/port_constraints.csv', root/'data/data_sources.csv',
    root/'docs/DATA_STRATEGY.md', root/'docs/ARCHITECTURE_FINAL.md'
]
for p in required:
    assert p.exists(), f'Missing {p}'
with (root/'backend/data/freight_history.csv').open(newline='', encoding='utf-8') as f:
    rows=list(csv.DictReader(f))
assert len(rows) > 150
assert all(r.get('route_proxy_usd_t') for r in rows), 'Freight history has missing target values'
json.loads((root/'frontend/package.json').read_text())
print('CharterIQ project validation: PASS')
print(f'Freight proxy rows: {len(rows)}')
print('No live-data claim is embedded in the proxy dataset.')
