"""Deterministic fake-only demo data; never read real customer datasets."""
import argparse
from contextlib import closing
from datetime import datetime, timedelta, timezone
import hashlib
import json
import random
from pathlib import Path
import sqlite3

from storage import DATA, DB, ROOT, connect, initialize
from src_before.auth import hash_password
from src_before.crypto_utils import encrypt_id
from src_before.models import protect_contact

COMMON_PASSWORDS = ['priya@123', 'chennai123', 'password1', 'welcome123', 'india123', 'admin123', 'tamil123', 'summer2026', 'ravi@123', 'arjun123']
FIRST_NAMES = ['Priya', 'Arjun', 'Kavya', 'Ravi', 'Meena', 'Suresh', 'Ananya', 'Vijay', 'Divya', 'Karthik', 'Lakshmi', 'Arun', 'Deepa', 'Nandini', 'Ganesh', 'Revathi', 'Hari', 'Sneha', 'Rohit', 'Asha']
LAST_NAMES = ['S', 'R', 'Kumar', 'Raman', 'Krishnan', 'Nair', 'Menon', 'Iyer', 'Rao', 'Balan', 'Devi', 'Sharma']


def generate_rows():
    rng = random.Random(20261014)
    start = datetime(2026, 10, 1, tzinfo=timezone.utc)
    rows, truth = [], {}
    for i in range(3000):
        name = 'Priya S' if i == 0 else f'{rng.choice(FIRST_NAMES)} {rng.choice(LAST_NAMES)}'
        password = 'priya@123' if i == 0 else rng.choice(COMMON_PASSWORDS) if i < 1350 else hashlib.sha256(f'cryptiq-fake-only-{i}'.encode()).hexdigest()[:22]
        email = 'priya@example.test' if i == 0 else f'customer{i + 1:04d}@example.test'
        rows.append((name, protect_contact(f'9{i:09d}'), protect_contact(email), hash_password(password), encrypt_id(f'DEMO-ID-{i + 1:06d}'), protect_contact(f'{i + 1}, Fictional Demo Street, Chennai'), (start + timedelta(seconds=i)).isoformat()))
        truth[str(i + 1)] = password
    return rows, truth


def seed(force=False, database=DB, snapshot=None, truth_path=None):
    database = Path(database)
    initialize(database)
    with connect(database) as conn:
        count = conn.execute('SELECT count(*) FROM customers').fetchone()[0]
        if count and not force:
            raise ValueError('Database already contains customers. Use --force only to replace demo data intentionally.')
        rows, truth = generate_rows()
        conn.execute('DELETE FROM orders')
        conn.execute('DELETE FROM customers')
        conn.execute("DELETE FROM sqlite_sequence WHERE name IN ('customers','orders')")
        conn.execute("UPDATE metadata SET value='before' WHERE key='mode'")
        conn.executemany('INSERT INTO customers(name,phone,email,password_hash,id_number,address,created_at) VALUES (?,?,?,?,?,?,?)', rows)
    if snapshot:
        snapshot = Path(snapshot)
        snapshot.parent.mkdir(parents=True, exist_ok=True)
        with closing(sqlite3.connect(database)) as source, closing(sqlite3.connect(snapshot)) as target:
            source.backup(target)
    if truth_path:
        Path(truth_path).write_text(json.dumps(truth, indent=2), encoding='utf-8')
    return {'customers': 3000, 'common_passwords': 1350, 'common_percent': 45}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--force', action='store_true', help='Replace existing fake demo data; stop the shop first')
    args = parser.parse_args()
    try:
        print(json.dumps(seed(args.force, snapshot=DATA / 'shop_before.db', truth_path=DATA / '_seed_truth.json')))
        (ROOT / 'state.json').write_text('{"mode":"before"}\n', encoding='utf-8')
    except ValueError as error:
        parser.exit(1, f'{error}\n')
