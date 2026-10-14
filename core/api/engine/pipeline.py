"""Small local source/schema scan. This is not a comprehensive security audit."""
import ast
from datetime import datetime, timezone
import json
from pathlib import Path
import sqlite3
from contextlib import closing

from .simple_rules import discover
from .score import calculate

RULES = json.loads(Path(__file__).with_name('rules.yaml').read_text(encoding='utf-8'))


def scan(root, database=None, report=lambda *_: None):
    root = Path(root).resolve()
    files = [p for p in root.rglob('*') if p.is_file() and not p.is_symlink() and '__pycache__' not in p.parts]
    report('files', 'Reading files', len(files))
    warnings = ['Local rules cover the demo patterns; absence of a finding is not proof of security.']
    python_files = [p for p in files if p.suffix == '.py']
    for path in python_files:
        try: ast.parse(path.read_text(encoding='utf-8', errors='replace'))
        except SyntaxError: warnings.append(f'Unsupported Python syntax: {path.relative_to(root)}')
    if not python_files: warnings.append('No Python source files found; results are partial.')
    assets, findings = discover(root)
    report('crypto', 'Finding crypto', len(assets))
    rows = []
    if database:
        with closing(sqlite3.connect(f'{Path(database).resolve().as_uri()}?mode=ro', uri=True)) as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute('SELECT phone,email,address,password_hash,id_number FROM customers ORDER BY id LIMIT 100').fetchall()
            customer_count = conn.execute('SELECT count(*) FROM customers').fetchone()[0]
    else:
        customer_count = None
        warnings.append('No database supplied; personal-data protection is inferred only from source.')
    present = {f['ruleId'] for f in findings}
    # Stored rows may contradict protected-looking source; retain those real risks.
    for rule, severity, title, columns, predicate, fix in [
        ('PLAINTEXT_PII', 'critical', 'Contact data is not protected in the database sample', ('phone','email','address'), lambda value: not value.startswith('pqc:v1:'), 'fix_field_enc'),
        ('WEAK_PASSWORD_HASH', 'critical', 'Stored passwords do not use Argon2id', ('password_hash',), lambda value: not value.startswith('$argon2id$'), 'fix_argon2'),
        ('RSA_STORAGE', 'high', 'Stored IDs retain the small RSA demo key', ('id_number',), lambda value: value.startswith('rsa-demo:'), 'fix_field_enc'),
    ]:
        if rule not in present and any(predicate(row[col]) for row in rows for col in columns if row[col]):
            findings.append({'id': rule.lower(), 'ruleId': rule, 'severity': severity, 'titleOwner': title, 'titleDev': title, 'file': 'data/shop.db', 'line': 1, 'snippet': f'customers: inconsistent protection in {", ".join(columns)} (values redacted)', 'fixId': fix, 'autoFixable': True, 'status': 'open', 'confidence': 1.0, 'assetIds': []})
    present = {f['ruleId'] for f in findings}
    data_map = []
    algorithms = {asset['name'] for asset in assets}
    for field in ('phone','email','password','address','id_number','payment_key'):
        if field == 'password': protection, risk = ('weak_hash', 'risk') if 'WEAK_PASSWORD_HASH' in present else ('strong_hash', 'ok')
        elif field == 'payment_key': protection, risk = ('secret_in_code', 'risk') if 'HARDCODED_SECRET' in present else ('env_secret', 'ok')
        elif field == 'id_number': protection, risk = ('rsa_quantum_vulnerable', 'warning') if 'RSA_STORAGE' in present else ('pqc_encrypted', 'ok')
        else: protection, risk = ('plaintext', 'risk') if 'PLAINTEXT_PII' in present else ('pqc_encrypted', 'ok')
        # A clean pattern scan of arbitrary code cannot establish data protection.
        supported = (field == 'password' and 'Argon2id' in algorithms) or (field == 'payment_key' and (root / 'config.py').is_file()) or (field in ('phone','email','address','id_number') and {'AES-256-GCM','ML-KEM-768'} <= algorithms)
        if risk == 'ok' and not supported:
            protection, risk = 'unknown', 'warning'
        data_map.append({'dataType': field, 'store': f'customers.{field}' if field != 'payment_key' else 'config.PAYMENT_KEY', 'protection': protection, 'status': risk})
    report('pii', 'Finding personal data', len(rows))
    for finding in findings:
        rule = RULES[finding['ruleId']]
        finding.update(whyOwner=rule['why'], howToFix=rule['fix'], dpdpSafeguard=rule['safeguard'])
    report('settings', 'Checking settings', len(findings))
    score, counts = calculate(findings)
    report('score', 'Scoring', len(findings))
    return {'score': score, 'counts': counts, 'findings': findings, 'assets': assets, 'dataMap': data_map,
            'customerCount': customer_count, 'sampledCustomers': len(rows), 'warnings': warnings,
            'finishedAt': datetime.now(timezone.utc).isoformat(), 'candidateOnly': True}
