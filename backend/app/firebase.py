import os
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

_SERVICE_ACCOUNT_PATH = "/app/firebase-service-account.json"

if not os.path.isfile(_SERVICE_ACCOUNT_PATH):
    raise RuntimeError(
        f"Firebase service account not found at {_SERVICE_ACCOUNT_PATH}. "
        "Download your service account JSON from Firebase Console → Project settings → "
        "Service accounts → Generate new private key, and place it at "
        "backend/firebase-service-account.json"
    )

cred = credentials.Certificate(_SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)


def verify_token(token: str) -> dict:
    return firebase_auth.verify_id_token(token)
