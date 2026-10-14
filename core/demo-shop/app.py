"""Intentionally vulnerable local grocery demo. Use fake data and test passwords only."""
from datetime import datetime, timezone
import hmac
import json
import re
import secrets
import sqlite3

from flask import Flask, abort, flash, redirect, render_template, request, session, url_for
from catalog import PRODUCTS
from demo_events import record as record_demo_event
from storage import DB, DATA, connect, hash_password, initialize, mode, session_secret, verify_password, protect_contact, encrypt_id, lookup_email, lookup_phone, implementation


def create_app(database=DB, testing=False):
    app = Flask(__name__)
    app.config.update(SECRET_KEY=session_secret(), DATABASE=str(database), TESTING=testing,
                      SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE='Lax',
                      SESSION_COOKIE_SECURE=False, MAX_CONTENT_LENGTH=32 * 1024)
    initialize(database)

    def current_user():
        if 'customer_id' not in session:
            return None
        with connect(app.config['DATABASE']) as conn:
            return conn.execute('SELECT id,name,email FROM customers WHERE id=?', (session['customer_id'],)).fetchone()

    def cart_lines():
        quantities = session.get('cart', {})
        return [{**p, 'quantity': min(20, max(0, int(quantities[p['id']])))} for p in PRODUCTS if p['id'] in quantities]

    @app.context_processor
    def context():
        session.setdefault('csrf_token', secrets.token_hex(24))
        lines = cart_lines()
        return {'customer': current_user(), 'csrf_token': session['csrf_token'],
                'cart_count': sum(p['quantity'] for p in lines), 'mode': mode(app.config['DATABASE']),
                'core_url': '' if request.script_root else 'http://localhost:5173',
                'money': lambda paise: f'₹{paise / 100:,.2f}'}

    @app.before_request
    def guard_forms():
        if (DATA / '.migration.lock').exists():
            return 'Demo maintenance in progress. Retry shortly.', 503
        app.config['SESSION_COOKIE_PATH'] = request.script_root or '/'
        app.config['SESSION_COOKIE_SECURE'] = implementation('config', app.config['DATABASE']).SESSION_COOKIE_SECURE
        if request.method == 'POST':
            supplied = request.form.get('csrf_token', '')
            if not supplied or not hmac.compare_digest(supplied, session.get('csrf_token', '')):
                abort(400, description='Form expired. Reload the page and try again.')

    @app.get('/')
    def index():
        return render_template('index.html', products=PRODUCTS)

    @app.get('/health')
    def health():
        return {'ok': True, 'service': 'demo-shop', 'mode': mode(app.config['DATABASE'])}

    @app.route('/signup', methods=['GET', 'POST'])
    def signup():
        values = {k: request.form.get(k, '').strip() for k in ['name', 'phone', 'email', 'id_number', 'address']}
        errors = {}
        if request.method == 'POST':
            password = request.form.get('password', '')
            values['email'] = values['email'].lower() or f'demo-{secrets.token_hex(12)}@example.test'
            if not 2 <= len(values['name']) <= 100: errors['name'] = 'Enter a name between 2 and 100 characters.'
            if not re.fullmatch(r'[6-9]\d{9}', values['phone']): errors['phone'] = 'Enter a 10-digit test phone number starting with 6–9.'
            if len(values['email']) > 254 or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', values['email']): errors['email'] = 'Enter a valid test email address.'
            if not 4 <= len(password) <= 128: errors['password'] = 'Use a test password between 4 and 128 characters.'
            if len(values['id_number']) > 64: errors['id_number'] = 'Use a fake ID of at most 64 characters.'
            if len(values['address']) > 500: errors['address'] = 'Keep the address under 500 characters.'
            if not errors:
                try:
                    with connect(app.config['DATABASE']) as conn:
                        db = app.config['DATABASE']
                        conn.execute('BEGIN IMMEDIATE')
                        current_mode = mode(db)
                        cursor = conn.execute('INSERT INTO customers(name,phone,email,password_hash,id_number,address,created_at,password_scheme,email_lookup,phone_lookup) VALUES (?,?,?,?,?,?,?,?,?,?)',
                            (values['name'], protect_contact(values['phone'], db), protect_contact(values['email'], db), hash_password(password, db), encrypt_id(values['id_number'], db), protect_contact(values['address'], db), datetime.now(timezone.utc).isoformat(), 'argon2id_peppered' if current_mode == 'after' else 'md5', lookup_email(values['email'], db), lookup_phone(values['phone'])))
                        customer_id = cursor.lastrowid
                    cart = session.get('cart', {})
                    session.clear(); session.update(customer_id=customer_id, cart=cart)
                    flash('Your demo account is ready. No real payment or delivery will take place.')
                    if not testing: record_demo_event('signup', customer_id)
                    return redirect(url_for('index'))
                except sqlite3.IntegrityError:
                    errors['email'] = 'This email already has a demo account. Please log in.'
        return render_template('signup.html', errors=errors, values=values), 422 if errors else 200

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        error = None
        if request.method == 'POST':
            with connect(app.config['DATABASE']) as conn:
                db = app.config['DATABASE']
                email = request.form.get('email', '').strip().lower()
                if re.fullmatch(r'[6-9]\d{9}', email):
                    customer = conn.execute('SELECT * FROM customers WHERE phone_lookup=? ORDER BY id DESC LIMIT 1', (lookup_phone(email),)).fetchone()
                elif mode(db) == 'after':
                    customer = conn.execute('SELECT * FROM customers WHERE email_lookup=?', (lookup_email(email, db),)).fetchone()
                else:
                    customer = conn.execute('SELECT * FROM customers WHERE email=?', (email,)).fetchone()
            if customer and verify_password(request.form.get('password', ''), customer['password_hash'], customer['password_scheme'], db):
                cart = session.get('cart', {})
                session.clear(); session.update(customer_id=customer['id'], cart=cart)
                flash('You are signed in to the demo store.')
                if not testing: record_demo_event('login', customer['id'])
                return redirect(url_for('index'))
            error = 'Phone number, email or password is incorrect.'
        return render_template('login.html', error=error), 401 if error else 200

    @app.post('/logout')
    def logout():
        session.clear()
        return redirect(url_for('index'))

    @app.post('/cart')
    def cart():
        product_id = request.form.get('product_id', '')
        if product_id not in {p['id'] for p in PRODUCTS}: abort(400, description='Unknown product.')
        quantities = dict(session.get('cart', {}))
        if request.form.get('action') == 'remove':
            quantities.pop(product_id, None)
        else:
            quantities[product_id] = min(20, quantities.get(product_id, 0) + 1)
        session['cart'] = quantities
        flash('Basket updated.')
        return redirect(url_for('index'))

    @app.route('/checkout', methods=['GET', 'POST'])
    def checkout():
        customer = current_user()
        if not customer:
            flash('Please log in before placing a demo order.')
            return redirect(url_for('login'))
        lines = cart_lines()
        total = sum(p['price'] * p['quantity'] for p in lines)
        if request.method == 'POST':
            if not lines: abort(400, description='Your basket is empty.')
            with connect(app.config['DATABASE']) as conn:
                cursor = conn.execute('INSERT INTO orders(customer_id,items,total_paise,created_at) VALUES(?,?,?,?)',
                                      (customer['id'], json.dumps(lines), total, datetime.now(timezone.utc).isoformat()))
                order_id = cursor.lastrowid
            session.pop('cart', None)
            if not testing: record_demo_event('checkout', customer['id'], order_id)
            return redirect(url_for('order', order_id=order_id))
        return render_template('checkout.html', lines=lines, total=total)

    @app.get('/orders/<int:order_id>')
    def order(order_id):
        customer = current_user()
        if not customer: return redirect(url_for('login'))
        with connect(app.config['DATABASE']) as conn:
            row = conn.execute('SELECT * FROM orders WHERE id=? AND customer_id=?', (order_id, customer['id'])).fetchone()
        if row is None: abort(404)
        return render_template('order.html', order=row)

    @app.errorhandler(400)
    @app.errorhandler(404)
    @app.errorhandler(413)
    def request_error(error):
        return render_template('error.html', error=error), error.code

    return app


if __name__ == '__main__':
    create_app().run(host='127.0.0.1', port=5050, debug=False, use_reloader=False)
