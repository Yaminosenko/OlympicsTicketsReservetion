import requests
import sys
import os


def test_ticket_purchase():
    if os.environ.get('RAILWAY_ENVIRONMENT'):
        BASE_URL = "https://olympic-reservation-ticket.up.railway.app"
    else:
        BASE_URL = "http://localhost:8000"

    TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ3ODY0Nzk4LCJpYXQiOjE3NDc4NjExOTgsImp0aSI6IjlkZjdiOGEwYTQzMDQ1NGM5ZTEwMjJkMTU5OTlhYjRjIiwidXNlcl9pZCI6InRlc3RAZW1haWwuY29tIn0.sSd6xdA6VhMoy3PYvuR-yhAsrnf1wrKVNQDKcGCslQU"  # Obtenez-le via /api/auth/login/

    try:
        response = requests.post(
            f"{BASE_URL}/api/tickets/purchase/",
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "Content-Type": "application/json"
            },
            json={"offer_id": 1},
            timeout=5
        )

        response.raise_for_status()

        try:
            data = response.json()
            print(" Succès:", data)
            return data
        except ValueError:
            print("Réponse non-JSON. Contenu brut:", response.text)
            return None

    except requests.exceptions.RequestException as e:
        print(" Erreur réseau:", str(e))
        return None


if __name__ == "__main__":
    test_ticket_purchase()