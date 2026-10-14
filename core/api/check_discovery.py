"""C07: check real planted evidence and mutation sensitivity without vendor reuse."""
from pathlib import Path
import shutil
import tempfile
from engine.simple_rules import discover

ROOT = Path(__file__).resolve().parents[2]
source = ROOT / 'core/demo-shop/src_before'
expected = {'WEAK_PASSWORD_HASH', 'PLAINTEXT_PII', 'HARDCODED_SECRET', 'RSA_STORAGE', 'WEAK_ACCESS_LOGGING', 'COOKIE_SECURE', 'NO_RETENTION_POLICY', 'NO_SECURITY_TXT'}
assets, findings = discover(source)
assert {f['ruleId'] for f in findings} == expected
assert len(findings) == 8 and {a['name'] for a in assets} == {'MD5', 'RSA'}
assert all(f['file'] and f['line'] > 0 and f['snippet'] for f in findings)
assert sum({'critical': 15, 'high': 7, 'medium': 3, 'low': 1}[f['severity']] for f in findings) == 62
with tempfile.TemporaryDirectory(dir=ROOT / 'core/.runtime', prefix='discovery-') as temp:
    copy = Path(temp) / 'source'
    shutil.copytree(source, copy)
    config = copy / 'config.py'
    config.write_text(config.read_text().replace('SESSION_COOKIE_SECURE = False', 'SESSION_COOKIE_SECURE = True'))
    _, modified = discover(copy)
    assert {f['ruleId'] for f in modified} == expected - {'COOKIE_SECURE'}
print('PASS: eight distinct evidence-backed findings, MD5/RSA assets, 38 score arithmetic, source mutation removes cookie finding')
