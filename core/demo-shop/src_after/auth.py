import hashlib
import hmac
import secrets
from pathlib import Path
from functools import lru_cache
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

HASHER = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)


@lru_cache(maxsize=1)
def pepper_key():
    # Trusted server file, deliberately excluded from the leaked SQLite database.
    path = Path(__file__).resolve().parents[1] / 'data/password_pepper.key'
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        with path.open('xb') as stream:
            stream.write(secrets.token_bytes(32))
    except FileExistsError:
        pass
    key = path.read_bytes()
    if len(key) != 32:
        raise ValueError('Password pepper is unavailable or invalid')
    return key


def pepper(value):
    return hmac.new(pepper_key(), value.encode('utf-8'), hashlib.sha256).hexdigest()


def hash_password(password):
    return HASHER.hash(pepper(password))


def wrap_existing_hash(md5_hash):
    return HASHER.hash(pepper(md5_hash))


def verify_password(password, stored, scheme='argon2id_peppered'):
    if scheme in ('argon2id_md5', 'argon2id_md5_peppered'):
        password = hashlib.md5(password.encode('utf-8')).hexdigest()
    elif scheme not in ('argon2id', 'argon2id_peppered'):
        return False
    if scheme.endswith('_peppered'):
        password = pepper(password)
    try:
        return HASHER.verify(stored, password)
    except (VerificationError, InvalidHashError):
        return False
