"""One acceptance pass: before-mode behavior and deterministic 3,000-row seed."""
import hashlib
import re
from pathlib import Path
import tempfile

from app import create_app
from seed import COMMON_PASSWORDS, generate_rows, seed
from storage import connect


def main():
    checks_root = Path(__file__).resolve().parents[1] / '.runtime'
    checks_root.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='shop-check-', dir=checks_root) as temp:
        db = Path(temp) / 'test.db'
        app = create_app(db, testing=True)
        client = app.test_client()

        def token(path):
            response = client.get(path)
            assert response.status_code == 200, (path, response.status_code)
            return re.search(r'name="csrf_token" value="([^"]+)"', response.get_data(as_text=True)).group(1)

        fields = dict(name='Judge Demo', phone='9000000000', email='judge@example.test', password='chennai123', id_number='FAKE-ONLY', address='Demo street')
        response = client.post('/signup', data={**fields, 'csrf_token': token('/signup')})
        assert response.status_code == 302
        with connect(db) as conn:
            row = conn.execute('SELECT * FROM customers').fetchone()
            assert row['password_hash'] == hashlib.md5(b'chennai123').hexdigest()
            assert row['phone'] == fields['phone'] and row['email'] == fields['email']
        assert client.post('/signup', data={**fields, 'csrf_token': token('/signup')}).status_code == 422
        assert client.post('/logout', data={'csrf_token': token('/')}).status_code == 302
        assert client.post('/login', data={'email': fields['email'], 'password': 'wrong', 'csrf_token': token('/login')}).status_code == 401
        assert client.post('/login', data={'email': fields['email'], 'password': fields['password'], 'csrf_token': token('/login')}).status_code == 302
        assert client.post('/cart', data={'product_id': 'tomatoes', 'csrf_token': token('/')}).status_code == 302
        response = client.post('/checkout', data={'csrf_token': token('/checkout'), 'total': '1'}, follow_redirects=True)
        assert response.status_code == 200 and b'DEMO ORDER CONFIRMED' in response.data
        with connect(db) as conn:
            assert conn.execute('SELECT total_paise FROM orders').fetchone()[0] == 4500
        assert client.post('/cart', data={'product_id': 'tomatoes'}).status_code == 400
        assert client.post('/checkout', data={'csrf_token': token('/checkout')}).status_code == 400
        print('PASS: signup, duplicate validation, stored MD5/plaintext, wrong/correct login, basket, server-priced checkout, empty cart and CSRF')

        snapshot = Path(temp) / 'snapshot.db'
        assert seed(force=True, database=db, snapshot=snapshot)['customers'] == 3000
        hashes = {hashlib.md5(p.encode()).hexdigest() for p in COMMON_PASSWORDS}
        with connect(db) as conn:
            customers = conn.execute('SELECT * FROM customers ORDER BY id').fetchall()
            assert len(customers) == 3000
            assert sum(r['password_hash'] in hashes for r in customers) == 1350
            assert customers[0]['email'] == 'priya@example.test'
        assert generate_rows() == generate_rows()
        with connect(snapshot) as conn:
            assert conn.execute('SELECT count(*) FROM customers').fetchone()[0] == 3000
        assert client.post('/login', data={'email': 'priya@example.test', 'password': 'priya@123', 'csrf_token': token('/login')}).status_code == 302
        try:
            seed(database=db)
        except ValueError:
            pass
        else:
            raise AssertionError('Seed must refuse overwriting populated data without --force')
        print('PASS: 3000 deterministic fake customers, 1350 common passwords (45%), Priya login, snapshot and overwrite guard')


if __name__ == '__main__':
    main()
