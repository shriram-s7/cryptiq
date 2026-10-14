"""Real ML-KEM-768 key encapsulation with AES-256-GCM field encryption for this demo.

kyber-py is an educational implementation: do not describe it as hardened production key management.
The private key remains local; protecting the host/key store is outside this demo's database-leak model.
"""
import base64
from functools import lru_cache
import json
from pathlib import Path
import secrets

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from kyber_py.ml_kem import ML_KEM_768

KEY_FILE = Path(__file__).resolve().parents[1] / 'data/protected_keys.json'


def b64(value): return base64.b64encode(value).decode('ascii')
def unb64(value): return base64.b64decode(value, validate=True)


@lru_cache(maxsize=4)
def data_key(key_path=KEY_FILE):
    key_path = Path(key_path)
    if not key_path.exists():
        ek, dk = ML_KEM_768.keygen()
        shared, ciphertext = ML_KEM_768.encaps(ek)
        wrapping_key = HKDF(algorithm=hashes.SHA256(), length=32, salt=None, info=b'cryptiq-demo-wrap-v1').derive(shared)
        nonce = secrets.token_bytes(12)
        encrypted = AESGCM(wrapping_key).encrypt(nonce, secrets.token_bytes(32), b'cryptiq-data-key-v1')
        payload = {'algorithm': 'ML-KEM-768+AES-256-GCM', 'privateKey': b64(dk), 'publicKey': b64(ek),
                   'encapsulation': b64(ciphertext), 'nonce': b64(nonce), 'wrappedDataKey': b64(encrypted)}
        key_path.parent.mkdir(parents=True, exist_ok=True)
        # Exclusive creation prevents a concurrent process from replacing an established key.
        try:
            with key_path.open('x', encoding='utf-8') as f: json.dump(payload, f)
        except FileExistsError:
            pass
    payload = json.loads(key_path.read_text(encoding='utf-8'))
    shared = ML_KEM_768.decaps(unb64(payload['privateKey']), unb64(payload['encapsulation']))
    wrapping_key = HKDF(algorithm=hashes.SHA256(), length=32, salt=None, info=b'cryptiq-demo-wrap-v1').derive(shared)
    return AESGCM(wrapping_key).decrypt(unb64(payload['nonce']), unb64(payload['wrappedDataKey']), b'cryptiq-data-key-v1')


def encrypt(value):
    nonce = secrets.token_bytes(12)
    ciphertext = AESGCM(data_key()).encrypt(nonce, value.encode('utf-8'), b'cryptiq-field-v1')
    return 'pqc:v1:' + b64(nonce + ciphertext)


def decrypt(value):
    if not value.startswith('pqc:v1:'): raise ValueError('Expected protected field')
    payload = unb64(value.removeprefix('pqc:v1:'))
    return AESGCM(data_key()).decrypt(payload[:12], payload[12:], b'cryptiq-field-v1').decode('utf-8')
