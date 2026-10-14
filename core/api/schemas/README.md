# Validation schema

bom-1.6.schema.json is the official CycloneDX 1.6 JSON schema, downloaded from
https://cyclonedx.org/schema/bom-1.6.schema.json on 2026-10-14.
The schema declares Apache License 2.0 in its $comment. It is retained unchanged for offline
validation of the exported subset; unused external license/signature schemas are not bundled.
Run core/.venv/Scripts/python.exe core/api/check_evidence.py after installing requirements-dev.txt.
