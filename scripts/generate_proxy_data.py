"""Reproducibility note for the demo freight proxy.

This project intentionally ships a static proxy/synthetic series so the SIH demo is
repeatable and does not misrepresent licensed route assessments as public data.
For production, replace this artifact through an approved data-ingestion adapter.
"""
from pathlib import Path
import csv

ROOT = Path(__file__).resolve().parents[1]
path = ROOT/'backend/data/freight_history.csv'
print(f'Proxy data file: {path}')
with path.open(newline='', encoding='utf-8') as f:
    rows=list(csv.DictReader(f))
print(f'Rows: {len(rows)}')
print('Replace via licensed route assessments/AIS/port telemetry in production.')
