"""Local demo storage. Before-mode weaknesses are intentional, never production defaults."""
from contextlib import contextmanager
from pathlib import Path
import secrets
import sqlite3
from importlib import import_module

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
        columns = {r['name'] for r in conn.execute('PRAGMA table_info(customers)')}
        if 'password_scheme' not in columns:
            conn.execute("ALTER TABLE customers ADD COLUMN password_scheme TEXT NOT NULL DEFAULT 'md5'")
        if 'email_lookup' not in columns:
            conn.execute('ALTER TABLE customers ADD COLUMN email_lookup TEXT')
        conn.execute('CREATE UNIQUE INDEX IF NOT EXISTS customer_email_lookup ON customers(email_lookup)')
        conn.execute('CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
        conn.execute("INSERT OR IGNORE INTO metadata VALUES ('mode', 'before')")


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


def mode(db=DB):
    with connect(db) as conn:
        value = conn.execute("SELECT value FROM metadata WHERE key='mode'").fetchone()['value']
    if value not in ('before', 'after'):
        raise RuntimeError('Unknown storage mode')
    return value


def implementation(module, db=DB):
    return import_module(f'src_{mode(db)}.{module}')


def hash_password(password, db=DB):
    return implementation('auth', db).hash_password(password)


def verify_password(password, stored, scheme='md5', db=DB):
    auth = implementation('auth', db)
    return auth.verify_password(password, stored, scheme) if mode(db) == 'after' else auth.verify_password(password, stored)


def protect_contact(value, db=DB):
    return implementation('models', db).protect_contact(value)


def reveal_contact(value, db=DB):
    return implementation('models', db).reveal_contact(value)


def encrypt_id(value, db=DB):
    crypto = implementation('crypto_utils', db)
    return crypto.encrypt(value) if mode(db) == 'after' else crypto.encrypt_id(value)


def lookup_email(value, db=DB):
    return implementation('models', db).email_lookup(value) if mode(db) == 'after' else value.strip().lower()


def session_secret():
    DATA.mkdir(parents=True, exist_ok=True)
    path = DATA / 'session.key'
    try:
        with path.open('x', encoding='utf-8') as f:
            f.write(secrets.token_hex(32))
    except FileExistsError:
        pass
    return path.read_text(encoding='utf-8').strip()
