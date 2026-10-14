"""Tiny textbook RSA for fake ID numbers only. Deliberately weak simulation target."""
import json
from math import gcd
from pathlib import Path
import random

KEY_PATH = Path(__file__).resolve().parents[1] / 'data/demo_rsa_key.json'
RSA_BITS = 64


def prime(candidate):
    if candidate < 2: return False
    for small in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37):
        if candidate % small == 0: return candidate == small
    d, s = candidate - 1, 0
    while d % 2 == 0:
        d //= 2; s += 1
    for a in (2, 3, 5, 7, 11):  # Deterministic for these 32-bit candidates.
        x = pow(a, d, candidate)
        if x in (1, candidate - 1): continue
        for _ in range(s - 1):
            x = pow(x, 2, candidate)
            if x == candidate - 1: break
        else: return False
    return True


def demo_key():
    if KEY_PATH.exists():
        key = json.loads(KEY_PATH.read_text(encoding='utf-8'))
        publish_public_key(key)
        return key
    # Fixed seed makes the fake snapshot decryptable after checkout/reset. NOT secure key generation.
    rng = random.Random(20261014)
    primes = []
    while len(primes) < 2:
        candidate = rng.randrange(2**31, 2**32) | 1
        if candidate not in primes and prime(candidate) and gcd(candidate - 1, 65537) == 1:
            primes.append(candidate)
    p, q = primes
    key = {'algorithm': 'RSA', 'demo': True, 'n': p * q, 'e': 65537, 'd': pow(65537, -1, (p - 1) * (q - 1)), 'p': p, 'q': q}
    KEY_PATH.parent.mkdir(parents=True, exist_ok=True)
    KEY_PATH.write_text(json.dumps(key), encoding='utf-8')
    publish_public_key(key)
    return key


def publish_public_key(key):
    public = {k: key[k] for k in ('algorithm', 'demo', 'n', 'e')}
    path = KEY_PATH.with_name('demo_rsa_public.json')
    if not path.exists():
        path.write_text(json.dumps(public), encoding='utf-8')


def encrypt_id(value):
    if not value: return ''
    key = demo_key()
    data = value.encode('utf-8')
    chunks = [data[i:i + 7] for i in range(0, len(data), 7)]
    return 'rsa-demo:' + json.dumps([[len(chunk), pow(int.from_bytes(chunk, 'big'), key['e'], key['n'])] for chunk in chunks], separators=(',', ':'))


def decrypt_id(value):
    if not value: return ''
    if not value.startswith('rsa-demo:'): raise ValueError('Expected demo RSA ciphertext')
    key = demo_key()
    return b''.join(pow(block, key['d'], key['n']).to_bytes(size, 'big') for size, block in json.loads(value.removeprefix('rsa-demo:'))).decode('utf-8')
