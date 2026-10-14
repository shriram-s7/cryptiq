"""Evidence-based local demo rules; does not execute the scanned source."""
import ast
from pathlib import Path
import re


def discover(root: Path):
    root = Path(root).resolve()
    if not root.is_dir(): raise ValueError('Scan root must be an existing directory')
    findings, assets = [], []
    sources = {path: path.read_text(encoding='utf-8', errors='replace') for path in sorted(root.rglob('*.py')) if '__pycache__' not in path.parts and not path.is_symlink()}

    def add(rule, severity, title, path, line, snippet, fix=None, confidence=1.0):
        findings.append({'id': rule.lower(), 'ruleId': rule, 'severity': severity, 'titleOwner': title,
            'titleDev': title, 'whyOwner': 'Detected in the source being scanned; review the evidence and proposed change.',
            'file': str(path.relative_to(root)).replace('\\', '/'), 'line': line, 'snippet': snippet,
            'dpdpSafeguard': 'Security safeguards', 'fixId': fix, 'autoFixable': fix is not None,
            'status': 'open' if fix else 'manual', 'confidence': confidence, 'assetIds': []})

    for path, text in sources.items():
        try:
            tree = ast.parse(text, filename=str(path))
        except SyntaxError:
            continue  # Pipeline reports unsupported syntax as a coverage warning.
        lines = text.splitlines()
        functions = [n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
        has_argon = any(isinstance(n, ast.ImportFrom) and n.module == 'argon2' for n in ast.walk(tree))
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'md5' and isinstance(node.func.value, ast.Name) and node.func.value.id == 'hashlib':
                owner = next((f for f in functions if f.lineno <= node.lineno <= (f.end_lineno or f.lineno)), None)
                # Wrapped legacy accounts prehash only inside Argon2 verification, not storage.
                if owner and owner.name == 'verify_password' and has_argon and any(isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute) and n.func.attr == 'verify' and isinstance(n.func.value, ast.Name) and n.func.value.id == 'HASHER' for n in ast.walk(owner)):
                    continue
                add('WEAK_PASSWORD_HASH', 'critical', 'Passwords use an easily guessed hash', path, node.lineno, lines[node.lineno - 1], 'fix_argon2')
                assets.append({'id': 'a_md5', 'type': 'algorithm', 'name': 'MD5', 'details': {}, 'quantumVulnerable': False, 'locations': [{'file': path.name, 'line': node.lineno}]})
            if isinstance(node, ast.FunctionDef) and node.name == 'protect_contact':
                if node.args.args and any(isinstance(n, ast.Return) and isinstance(n.value, ast.Name) and n.value.id == node.args.args[0].arg for n in node.body):
                    add('PLAINTEXT_PII', 'critical', 'Contact fields are stored as plain text', path, node.lineno, ast.get_source_segment(text, node) or '', 'fix_field_enc')
            if isinstance(node, ast.ImportFrom):
                names = {alias.name for alias in node.names}
                for symbol, name, bits in [('PasswordHasher', 'Argon2id', None), ('AESGCM', 'AES-256-GCM', 256), ('ML_KEM_768', 'ML-KEM-768', 768)]:
                    if symbol in names:
                        assets.append({'id': 'a_' + symbol.lower(), 'type': 'algorithm', 'name': name, 'details': {'keySize': bits}, 'quantumVulnerable': False, 'locations': [{'file': path.name, 'line': node.lineno}]})
            if not isinstance(node, ast.Assign) or not isinstance(node.value, ast.Constant): continue
            for target in node.targets:
                if not isinstance(target, ast.Name): continue
                name, value = target.id, node.value.value
                if name == 'PAYMENT_KEY' and isinstance(value, str) and re.match(r'rzp_live_.+', value):
                    add('HARDCODED_SECRET', 'critical', 'Payment key is written in source code', path, node.lineno, 'PAYMENT_KEY = [redacted]', 'fix_secret_env')
                if name == 'SESSION_COOKIE_SECURE' and value is False:
                    add('COOKIE_SECURE', 'low', 'Session cookie lacks the Secure flag', path, node.lineno, lines[node.lineno - 1], 'fix_cookie')
                if name == 'ACCESS_LOGGING_ENABLED' and value is False:
                    add('WEAK_ACCESS_LOGGING', 'high', 'Personal-data access logging is disabled', path, node.lineno, lines[node.lineno - 1])
                if name == 'RSA_BITS' and isinstance(value, int):
                    add('RSA_STORAGE', 'high', 'ID numbers use a deliberately weak RSA demo key', path, node.lineno, lines[node.lineno - 1], 'fix_field_enc')
                    assets.append({'id': 'a_rsa', 'type': 'key', 'name': 'RSA', 'details': {'keySize': value, 'mode': 'textbook demo only'}, 'quantumVulnerable': True, 'locations': [{'file': path.name, 'line': node.lineno}]})
    for filename, rule, title in [('RETENTION.md', 'NO_RETENTION_POLICY', 'No retention policy found in the scanned folder'), ('security.txt', 'NO_SECURITY_TXT', 'No security contact found in the scanned folder')]:
        if not any(root.rglob(filename)):
            add(rule, 'low', title, root / filename, 1, f'{filename} absent from scanned root; external policies are not assessed.', confidence=0.7)
    # A rule may match more than one call site; retain the first concrete evidence location.
    distinct = {f['ruleId']: f for f in reversed(findings)}
    return assets, list(reversed(list(distinct.values())))
