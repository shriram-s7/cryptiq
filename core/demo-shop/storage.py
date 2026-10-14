"""Local demo storage. Before-mode weaknesses are intentional, never production defaults."""
from contextlib import contextmanager
from pathlib import Path
import json
import secrets
import sqlite3
from src_before import auth, models, crypto_utils

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'data'
DB = DATA / 'shop.db'


def initialize(db=DB):
    db = Path(db)
    db.parent.mkdir(parents=True, exist_ok=True)
    with connect(db) as conn:
        conn.executescript('''
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
            phone TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL, id_number TEXT NOT NULL DEFAULT '',
            address TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT, customer_id INTEGER NOT NULL,
            items TEXT NOT NULL, total_paise INTEGER NOT NULL, created_at TEXT NOT NULL,
            FOREIGN KEY(customer_id) REFERENCES customers(id)
        );
        ''')


@contextmanager
def connect(db=DB):
    conn = sqlite3.connect(db, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys=ON')
    try:
        with conn:
            yield conn
    finally:
        conn.close()


def mode():
    path = ROOT / 'state.json'
    value = json.loads(path.read_text())['mode'] if path.exists() else 'before'
    if value != 'before':
        raise RuntimeError('Protected mode is not implemented yet; refusing to write unprotected data.')
    return value


def hash_password(password):
    mode()
    return auth.hash_password(password)


def verify_password(password, stored):
    mode()
    return auth.verify_password(password, stored)


def protect_contact(value):
    mode()
    return models.protect_contact(value)


def encrypt_id(value):
    mode()
    return crypto_utils.encrypt_id(value)


def session_secret():
    DATA.mkdir(parents=True, exist_ok=True)
    path = DATA / 'session.key'
    try:
        with path.open('x', encoding='utf-8') as f:
            f.write(secrets.token_hex(32))
    except FileExistsError:
        pass
    return path.read_text(encoding='utf-8').strip()
