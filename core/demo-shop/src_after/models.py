import hashlib
import hmac
from .crypto_utils import data_key, encrypt, decrypt


def protect_contact(value):
    return encrypt(value)


def reveal_contact(value):
    return decrypt(value)


def email_lookup(email):
    return hmac.new(data_key(), b'email-lookup-v1:' + email.strip().lower().encode(), hashlib.sha256).hexdigest()
