"""C08 integrated acceptance: rollback, 3000-row migration, login, protected signup and reset."""
from pathlib import Path
from contextlib import closing
import re
import sqlite3
import tempfile

from app import create_app
from migrate_to_after import migrate
from seed import seed
from storage import connect, mode
from src_after.crypto_utils import decrypt, encrypt


def main():
    runtime = Path(__file__).resolve().parents[1] / '.runtime'
    runtime.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=runtime, prefix='migration-check-') as temp:
        db = Path(temp) / 'shop.db'
        snapshot = Path(temp) / 'before.db'
        seed(database=db, snapshot=snapshot)
        # A small isolated rollback case avoids hashing the full population twice.
        rollback_db = Path(temp) / 'rollback.db'
        with closing(sqlite3.connect(db)) as source, closing(sqlite3.connect(rollback_db)) as target:
            source.backup(target)
        with connect(rollback_db) as conn: conn.execute('DELETE FROM customers WHERE id>3')
        try:
            migrate(rollback_db, fail_after=1)
        except RuntimeError as error:
            assert 'Injected failure' in str(error)
        else: raise AssertionError('Injected failure did not occur')
        assert mode(rollback_db) == 'before'
        with connect(rollback_db) as conn: assert conn.execute('SELECT email FROM customers WHERE id=1').fetchone()[0] == 'priya@example.test'
        print('PASS: failed migration rolled back data and mode', flush=True)

        result = migrate(db)
        print(f'MIGRATION: {result}', flush=True)
        assert result['customers'] == 3000 and mode(db) == 'after'
        assert migrate(db)['status'] == 'already_after'
        with connect(db) as conn:
            priya = conn.execute('SELECT * FROM customers WHERE id=1').fetchone()
            assert all(priya[k].startswith('pqc:v1:') for k in ('phone', 'email', 'address', 'id_number'))
            assert decrypt(priya['email']) == 'priya@example.test'
            assert decrypt(priya['id_number']) == 'DEMO-ID-000001'
            assert priya['password_hash'].startswith('$argon2id$') and priya['password_scheme'] == 'argon2id_md5_peppered'
        assert encrypt('same') != encrypt('same')
        corrupted = encrypt('tamper me')
        try: decrypt(corrupted[:-4] + 'AAAA')
        except Exception: pass
        else: raise AssertionError('Tampered ciphertext was accepted')
        app = create_app(db, testing=True)
        client = app.test_client()
        # HTTPS is deliberate: after-mode sessions set Secure; no weakened HTTP exception.
        def token(path):
            response = client.get(path, base_url='https://localhost')
            assert response.status_code == 200
            return re.search(r'name="csrf_token" value="([^"]+)"', response.get_data(as_text=True)).group(1)
        def post(path, values):
            return client.post(path, data={**values, 'csrf_token': token(path if path in ('/login','/signup','/checkout') else '/')}, base_url='https://localhost')
        assert post('/login', {'email': 'priya@example.test', 'password': 'wrong'}).status_code == 401
        assert post('/login', {'email': 'priya@example.test', 'password': 'priya@123'}).status_code == 302
        assert client.get('/checkout', base_url='https://localhost').status_code == 200
        assert post('/cart', {'product_id': 'tomatoes'}).status_code == 302
        assert post('/checkout', {}).status_code == 302
        assert post('/signup', {'name': 'Protected User', 'phone': '9111111111', 'email': 'protected@example.test', 'password': 'new-test-password', 'id_number': 'NEW-FAKE-ID'}).status_code == 302
        with connect(db) as conn:
            row = conn.execute('SELECT * FROM customers ORDER BY id DESC LIMIT 1').fetchone()
            assert row['password_scheme'] == 'argon2id_peppered'
            assert row['phone'].startswith('pqc:v1:') and decrypt(row['phone']) == '9111111111'
        assert post('/logout', {}).status_code == 302
        assert post('/login', {'email': 'protected@example.test', 'password': 'new-test-password'}).status_code == 302
        assert post('/signup', {'name': 'Duplicate', 'phone': '9111111111', 'email': 'protected@example.test', 'password': 'test'}).status_code == 422
        with closing(sqlite3.connect(snapshot)) as source, closing(sqlite3.connect(db)) as target: source.backup(target)
        assert mode(db) == 'before'
        print('PASS: actual ML-KEM/AES-GCM, Argon2 migration, idempotence, authenticated encryption, old/new login, encrypted signup, duplicate lookup, checkout and snapshot restore', flush=True)


if __name__ == '__main__': main()
