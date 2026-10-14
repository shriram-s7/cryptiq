# Prompt for Claude Code — inspect Hash Patch (read-only) and copy reusable parts into CryptIQ

Fill in the two paths, then paste everything below the line into Claude Code.

- `SOURCE` = path to the SIH Hash Patch folder (e.g. `D:\CBOM-SIH\hash_patch`)
- `TARGET` = path to the new CryptIQ repo (e.g. `D:\cryptiq`)

---

You are helping build **CryptIQ**, a new product in a NEW folder. An older project, **Hash Patch**, lives in
a separate folder. Your job has two phases: (1) inspect Hash Patch **read-only** and report what can be
reused, (2) **copy** the selected parts into CryptIQ. The original folder must stay byte-for-byte unchanged.

**Paths**

- SOURCE (read-only): `<SOURCE>`
- TARGET (write here only): `<TARGET>`

**Hard rules — follow exactly**

1. Never create, edit, move, rename, format, or delete anything inside SOURCE. No `git` commands that write
   (no commit, checkout, stash, pull, reset, branch, clean) inside SOURCE. Do not run installers, builds,
   tests or formatters from inside SOURCE (they can create cache/lock files). Read files only.
2. Before starting, record a checksum manifest of SOURCE (path + SHA-256 for every file, excluding nothing)
   into `<TARGET>/.reuse/source_manifest_before.txt`. At the end, recompute it into
   `<TARGET>/.reuse/source_manifest_after.txt` and confirm both are identical. If they differ, stop and tell me.
3. All new files go under TARGET only.
4. Do not copy secrets, `.env` files, API keys, datasets, test corpora with real data, model weights,
   `node_modules`, virtual environments, build outputs, or `.git`.

**Phase 1 — Inventory (read-only). Write `<TARGET>/REUSE_REPORT.md` with:**

1. One-paragraph summary of what Hash Patch does and its architecture (languages, frameworks, entry points).
2. A table of modules: `path | purpose | key functions/classes | external dependencies | inputs → outputs |
   reusability (as-is / adapt / skip) | effort (S/M/L) | notes`.
3. Specifically locate and describe, with file paths and function names:
   - file/directory walker and language detection
   - crypto discovery: detection of hash functions (MD5, SHA-1, SHA-2), ciphers (AES modes, DES/3DES, RC4),
     public-key algorithms (RSA, ECC, DH) and key sizes, TLS/protocol versions, certificates, hard-coded keys/secrets
   - quantum-vulnerability classification and any PQC migration recommendations (ML-KEM, ML-DSA, etc.)
   - CBOM generation (CycloneDX format? which spec version? sample output shape)
   - severity / risk scoring
   - report generation (PDF/HTML/JSON)
   - any UI components or design tokens worth reusing
   - test fixtures that are synthetic and safe to reuse
4. The exact Python/Node version and dependency list needed by the parts marked as-is/adapt.
5. A recommended **adapter interface** for CryptIQ:
   `run_discovery(root: Path) -> (assets: list[Asset], raw_findings: list[RawFinding])`,
   mapping Hash Patch's output types to these CryptIQ types:
   - Asset: `{id, type: algorithm|key|certificate|library|protocol, name, details{keySize,mode}, quantumVulnerable, locations[{file,line}]}`
   - RawFinding: `{ruleId, title, file, line, snippet, severity, assetIds, confidence}`
   Show the field-by-field mapping.
6. Gaps: what CryptIQ needs that Hash Patch does not do (expected: personal-data/PII detection in DB schemas
   and models, web-config checks like cookie flags/debug mode, DPDP mapping, plain-English text, 0–100 score).

**Stop after Phase 1 and show me the summary and the reuse table. Wait for my "go" before Phase 2.**

**Phase 2 — Copy (after I say go)**

1. Copy only the modules I approve into `<TARGET>/api/engine/vendor_hashpatch/`, preserving relative structure.
   Do not modify copied files except: fix import paths so they work from the new location, and remove
   code paths that require secrets or network access. Record every change in `vendor_hashpatch/CHANGES.md`.
2. Add `<TARGET>/api/engine/vendor_hashpatch/PROVENANCE.md`: source folder, source git commit hash (read via
   `git -C <SOURCE> rev-parse HEAD`, read-only) if available, date, list of copied files with original paths.
3. Create `<TARGET>/PRE_EXISTING.md` stating in plain English: "The crypto-discovery engine in
   `api/engine/vendor_hashpatch/` was adapted from our team's earlier research project (Hash Patch). All other
   code in this repository was written during Founder's Code 2026." Then list the copied files.
4. Create `<TARGET>/api/engine/adapter.py` implementing `run_discovery` using the copied code and the mapping
   from Phase 1. Nothing else in CryptIQ may import `vendor_hashpatch` directly.
5. Create `<TARGET>/api/engine/requirements-vendor.txt` with pinned dependencies for the copied code.
6. Write a smoke test `<TARGET>/api/tests/test_adapter.py` that runs `run_discovery` on a tiny synthetic
   folder (create it under `<TARGET>/api/tests/fixtures/mini_app/` with one MD5 use, one RSA key generation,
   one hard-coded key string) and asserts at least three findings.
7. Recompute the SOURCE manifest (rule 2) and confirm it is unchanged.
8. Finish with a short summary: files copied, adapter status, test result, manifest check result.
