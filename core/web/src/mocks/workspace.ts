import type { Finding, MockScenario, WorkspaceData } from '@/lib/contracts';

const rules = [
  ['WEAK_PASSWORD_HASH', 'Passwords use a weak hash', 'MD5 password hashing', 'critical', 'auth.py', 'fix_argon2'],
  ['PLAINTEXT_PII', 'Contact details are stored as plain text', 'Unencrypted PII fields', 'critical', 'models.py', 'fix_field_enc'],
  ['HARDCODED_SECRET', 'A payment key is written into code', 'Hard-coded payment secret', 'critical', 'config.py', 'fix_secret_env'],
  ['RSA_STORAGE', 'ID protection uses a vulnerable demo key', 'RSA demo storage key', 'high', 'crypto_utils.py', 'fix_field_enc'],
  ['WEAK_ACCESS_LOGGING', 'Personal-data access is not logged', 'Missing access audit log', 'high', 'app.py', null],
  ['COOKIE_SECURE', 'Session cookies need a secure flag', 'SESSION_COOKIE_SECURE is false', 'low', 'app.py', 'fix_cookie'],
  ['NO_RETENTION_POLICY', 'Retention policy needs documenting', 'No retention policy', 'low', 'README.md', null],
  ['NO_SECURITY_TXT', 'A security contact is missing', 'No security.txt', 'low', 'static/security.txt', null],
] as const;

export function mockWorkspace(scenario: MockScenario): WorkspaceData {
  if (scenario === 'error') throw new Error('Mock scenario: scan service unavailable. Switch to Before or After to recover.');
  const after = scenario === 'after';
  const findings: Finding[] = rules.map(([ruleId, titleOwner, titleDev, severity, file, fixId], i) => ({
    id: `f${i + 1}`, ruleId, titleOwner, titleDev, severity, file: `src/${file}`, line: 1,
    whyOwner: 'Illustrative demo finding; this is not evidence from your code.', snippet: '# Mock evidence only',
    dpdpSafeguard: 'Security safeguards', fixId, autoFixable: fixId !== null,
    status: fixId === null ? 'manual' : after ? 'fixed' : 'open', confidence: 1, assetIds: [],
  }));
  return {
    scan: {
      id: `mock-scan-${scenario}`, projectId: 'p_demo', mode: scenario, status: 'done', score: after ? 91 : 38,
      counts: after ? { critical: 0, high: 1, medium: 0, low: 2 } : { critical: 3, high: 2, medium: 0, low: 3 },
      stages: ['Reading files', 'Finding crypto', 'Finding personal data', 'Checking settings', 'Scoring'].map((label, i) => ({ key: `stage${i}`, label, done: true, count: i === 0 ? 6 : 8 })),
      findings, assets: [{ id: 'a1', type: 'algorithm', name: after ? 'Argon2id' : 'MD5', details: {}, quantumVulnerable: false, locations: [{ file: 'src/auth.py', line: 1 }] }],
      dataMap: (['phone', 'email', 'password', 'address', 'id_number', 'payment_key'] as const).map(dataType => ({
        dataType, store: dataType === 'payment_key' ? 'config.PAYMENT_KEY' : `customers.${dataType}`,
        protection: dataType === 'password' ? after ? 'strong_hash' : 'weak_hash' : dataType === 'payment_key' ? after ? 'env_secret' : 'secret_in_code' : after ? 'pqc_encrypted' : dataType === 'id_number' ? 'rsa_quantum_vulnerable' : 'plaintext',
        status: after ? 'ok' : dataType === 'id_number' ? 'warning' : 'risk',
      })), finishedAt: '2026-10-14T15:00:00+05:30',
    },
    attacks: [
      { id: 'mock-dictionary', kind: 'dictionary', status: 'done', lines: ['Mock result — no attack executed'], tried: after ? 300 : 10000, cracked: after ? 0 : 1350, total: 3000, revealed: after ? [] : [{ customerId: 1, field: 'password', value: 'priya@123' }], verdict: after ? 'protected' : 'cracked', durationMs: after ? 15000 : 2100 },
      { id: 'mock-shor', kind: 'shor_sim', status: 'done', lines: ['Simulation fixture — no quantum hardware involved'], tried: 0, cracked: 0, total: 3000, revealed: [], verdict: after ? 'not_applicable' : 'cracked', durationMs: after ? 0 : 800 },
    ],
    pullRequest: { id: 'mock-pr', title: 'Mock: four security fixes', fixes: ['fix_argon2', 'fix_field_enc', 'fix_secret_env', 'fix_cookie'], files: [{ path: 'src/auth.py', diff: '- MD5 password hash\n+ Argon2id password hash\n# Illustrative fixture, not an applicable patch' }], manual: rules.filter(r => r[5] === null).map(r => r[0]), status: after ? 'merged' : 'open' },
    verification: { id: 'mock-verification', status: after ? 'passed' : 'running', checks: ['Re-scan', 'Re-attack', 'App still works', 'New data protected'].map((label, i) => ({ key: `check${i}`, label, status: after ? 'pass' : 'running', detail: after ? 'Mock check passed; no live verification performed' : 'Mock pending state' })), scoreBefore: 38, scoreAfter: after ? 91 : 38 },
  };
}
