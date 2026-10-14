import hashlib
import hmac


def hash_password(password):
    return hashlib.md5(password.encode('utf-8')).hexdigest()


def verify_password(password, stored):
    return hmac.compare_digest(hash_password(password), stored)
