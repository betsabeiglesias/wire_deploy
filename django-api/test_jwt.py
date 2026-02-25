# test_jwt.py (script temporal)
import jwt
import os

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcwMjkzMjg4LCJpYXQiOjE3NzAyODk2ODgsImp0aSI6ImU3Y2Q1MzJmMDEyYjQ0NDRiMTliODNhNWU2NGMyOTVmIiwidXNlcl9pZCI6IjEiLCJjbGllbnRfaWQiOiJjdXN0b21lckEiLCJyb2xlcyI6WyJub19yb2xlIl0sInNjb3BlcyI6W119.3XypmEYUriIKHyKOqnUBdW8OEY_HHH6-Nd_RCHpLJQg"

secret = "django-insecure-9hpd2g^ktlo*9g3c-senca_tjxu125$vqbrknbv6%_kardj$^b"

try:
    payload = jwt.decode(token, secret, algorithms=["HS256"])
    print("✅ Token válido con este secret:")
    print(payload)
except jwt.InvalidSignatureError:
    print("❌ Secret incorrecto")
except Exception as e:
    print(f"❌ Error: {e}")