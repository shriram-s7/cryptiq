"""Offline transactional migration. Stop the shop before invoking; mode commits with the data."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import time

from storage import DATA, DB, ROOT, connect, initialize
from src_before.crypto_utils import decrypt_id
from src_after.auth import wrap_existing_hash, pepper_key
from src_after.crypto_utils import data_key, encrypt
from src_after.models import email_lookup


def migrate(database=DB, fail_after=None, report=lambda completed,total:None):
    database = Path(database)
    initialize(database)
    lock = DATA / '.migration.lock'
    lock.parent.mkdir(parents=True, exist_ok=True)
    try:
        lock.open('x').close()
    except FileExistsError:
        raise RuntimeError('Migration already active or interrupted. Check no migration is running before removing its lock.')
    pepper_key()  # Create once before concurrent password wrapping.
    started = time.monotonic()
    try:
        data_key()  # Persist key material before any ciphertext can be committed.
        with connect(database) as conn:
            conn.execute('BEGIN IMMEDIATE')
            if conn.execute("SELECT value FROM metadata WHERE key='mode'").fetchone()['value'] == 'after':
                return {'status': 'already_after', 'customers': 0, 'durationMs': int((time.monotonic() - started) * 1000)}
            customers = conn.execute('SELECT * FROM customers ORDER BY id').fetchall()
            report(0,len(customers))
            if any(row['password_scheme'] != 'md5' for row in customers):
                raise ValueError('Before database contains unexpected password schemes')
            # Bounded concurrency: at most ~76 MiB of Argon2 working memory across four workers.
            with ThreadPoolExecutor(max_workers=4) as pool:
                wrapped = pool.map(wrap_existing_hash, [row['password_hash'] for row in customers])
                for index, (row, password_hash) in enumerate(zip(customers, wrapped), 1):
                    conn.execute('UPDATE customers SET phone=?,email=?,address=?,id_number=?,password_hash=?,password_scheme=?,email_lookup=? WHERE id=?',
                        (encrypt(row['phone']), encrypt(row['email']), encrypt(row['address']), encrypt(decrypt_id(row['id_number'])), password_hash, 'argon2id_md5_peppered', email_lookup(row['email']), row['id']))
                    if index % 50 == 0 or index == len(customers): report(index,len(customers))
                    if fail_after is not None and index >= fail_after:
                        raise RuntimeError('Injected failure for rollback acceptance')
            conn.execute("UPDATE metadata SET value='after' WHERE key='mode'")
        if database.resolve() == DB.resolve():
            # Informational mirror only; SQLite metadata is authoritative and transactional.
            temporary = ROOT / 'state.json.tmp'
            temporary.write_text('{"mode":"after"}\n', encoding='utf-8')
            temporary.replace(ROOT / 'state.json')
        return {'status': 'migrated', 'customers': len(customers), 'durationMs': int((time.monotonic() - started) * 1000), 'protection': 'ML-KEM-768 + AES-256-GCM + Argon2id'}
    finally:
        lock.unlink(missing_ok=True)


if __name__ == '__main__':
    argparse.ArgumentParser(description=__doc__).parse_args()
    print(json.dumps(migrate()))
