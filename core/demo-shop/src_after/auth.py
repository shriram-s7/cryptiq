import hashlib
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

HASHER = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)


def hash_password(password):
    return HASHER.hash(password)


def wrap_existing_hash(md5_hash):
    return HASHER.hash(md5_hash)


def verify_password(password, stored, scheme='argon2id'):
    if scheme == 'argon2id_md5':
        password = hashlib.md5(password.encode('utf-8')).hexdigest()
    elif scheme != 'argon2id':
        return False
    try:
        return HASHER.verify(stored, password)
    except (VerificationError, InvalidHashError):
        return False
