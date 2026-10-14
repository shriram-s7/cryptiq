export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type Counts = Record<Severity, number>;
export interface Asset { id: string; type: 'algorithm' | 'key' | 'certificate' | 'library' | 'protocol'; name: string; details: { keySize?: number | null; mode?: string | null }; quantumVulnerable: boolean; locations: { file: string; line: number }[] }
export interface Finding { id: string; ruleId: string; severity: Severity; titleOwner: string; whyOwner: string; titleDev: string; file: string; line: number; snippet: string; dpdpSafeguard: string; fixId: string | null; autoFixable: boolean; status: 'open' | 'fixed' | 'manual'; confidence: number; assetIds: string[] }
export interface DataMapItem { dataType: 'phone' | 'email' | 'password' | 'address' | 'id_number' | 'payment_key'; store: string; protection: 'unknown' | 'plaintext' | 'weak_hash' | 'strong_hash' | 'rsa_quantum_vulnerable' | 'pqc_encrypted' | 'secret_in_code' | 'env_secret'; status: 'risk' | 'warning' | 'ok' }
export interface Scan { id: string; projectId: string; mode: 'before' | 'after'; status: 'running' | 'done' | 'error'; stages: { key: string; label: string; done: boolean; count: number }[]; score: number; counts: Counts; findings: Finding[]; assets: Asset[]; dataMap: DataMapItem[]; finishedAt: string }
export interface AttackRun { id: string; kind: 'dictionary' | 'shor_sim'; status: 'running' | 'done' | 'error'; lines: string[]; tried: number; cracked: number; total: number; revealed: { customerId: number; field: string; value: string }[]; verdict: 'cracked' | 'protected' | 'not_applicable'; durationMs: number }
export interface PullRequest { id: string; title: string; fixes: string[]; files: { path: string; diff: string }[]; manual: string[]; status: 'open' | 'merged' }
export interface Verification { id: string; status: 'running' | 'passed' | 'failed'; checks: { key: string; label: string; status: 'pass' | 'fail' | 'running'; detail: string }[]; scoreBefore: number; scoreAfter: number }
export interface WorkspaceData { scan: Scan; attacks: AttackRun[]; pullRequest: PullRequest; verification: Verification }
export type MockScenario = 'before' | 'after' | 'error';

// Live workflow contract for replacement frontends. Optional state is explicit; never synthesize results.
export interface ReviewJob {
  id: string; projectId: string; revision: number; title: string;
  fixes: string[]; files: { path: string; diff: string }[]; manual: string[];
  status: 'open' | 'merging' | 'merged' | 'error'; completed: number; total: number;
  localOnly: true; verified: false; error?: string;
}
export interface VerificationJob {
  id: string; projectId: string; revision: number; status: 'running' | 'passed' | 'failed';
  scoreBefore: number | null; scoreAfter?: number; finishedAt?: string; error?: string;
  checks: { key: string; label: string; status: 'pending' | 'running' | 'pass' | 'fail'; detail: string }[];
  attackEvidence?: { tried: number; cracked: number; total: number; durationMs: number; budgetExhausted: boolean };
}
export interface LiveAttackJob {
  id: string; projectId: string; kind: 'dictionary' | 'shor_sim'; status: 'running' | 'done' | 'error';
  lines: string[]; tried: number; cracked: number; total: number; durationMs: number;
  revealed: { customerId: number; field: 'password' | 'id_number'; value: string }[];
  verdict?: 'cracked' | 'protected' | 'not_applicable' | 'timeout'; error?: string;
}
export interface WorkflowState {
  project: { id: string; name: string; revision: number; mode: 'before' | 'after' | null };
  scan: Scan | null; attacks: { dictionary: LiveAttackJob | null; shor_sim: LiveAttackJob | null };
  review: ReviewJob | null; verification: VerificationJob | null; verified: boolean; busy: boolean;
  nextAction: 'scan' | 'wait' | 'report' | 'verify' | 'review' | 'attack' | 'findings';
  capabilities: Record<'scan' | 'sourceZip' | 'leakPreview' | 'dictionary' | 'rsaSimulation' | 'reviewFixes' | 'merge' | 'verify' | 'cbom' | 'evidencePdf' | 'resetDemo', boolean>;
  subscription: { enforced: false; billingAvailable: false }; scope: string;
}
