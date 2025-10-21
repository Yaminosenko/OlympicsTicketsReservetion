import os
import django
import requests
import json

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from backend.tickets.models import User, TicketOffer, Ticket
from django.contrib.auth import get_user_model


def test_backend():
    if os.environ.get('RAILWAY_ENVIRONMENT'):
        BASE_URL = "https://olympic-reservation-ticket.up.railway.app"
    else:
        BASE_URL = "http://localhost:8000"

    print("🧪 TEST COMPLET DU SYSTÈME DE VALIDATION")
    print("=" * 50)

    #Créer un superutilisateur pour les tests
    print("1. Création du compte admin...")
    User = get_user_model()
    admin, created = User.objects.get_or_create(
        email='testadmin@olympics.fr',
        defaults={
            'username': 'testadmin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin.set_password('testpassword123')
        admin.save()
        print("   ✅ Compte admin créé")
    else:
        print("   ℹ️  Compte admin existe déjà")

    #Créer une offre de test
    print("2. Création d'une offre de test...")
    offer, created = TicketOffer.objects.get_or_create(
        name='Offre Test Validation',
        defaults={
            'offer_type': 'SOLO',
            'description': 'Offre pour tester la validation',
            'price': 25.00,
            'available': True
        }
    )
    print(f"   ✅ Offre créée: {offer.name}")

    #Créer un utilisateur normal
    print("3. Création d'un utilisateur test...")
    user, created = User.objects.get_or_create(
        email='testuser@olympics.fr',
        defaults={
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    if created:
        user.set_password('testpassword123')
        user.save()
        print("   ✅ Utilisateur créé")

    #Créer un ticket pour cet utilisateur
    print("4. Création d'un ticket de test...")
    ticket, created = Ticket.objects.get_or_create(
        user=user,
        offer=offer,
        defaults={}
    )
    if created:
        print(f"   ✅ Ticket créé - ID: {ticket.id}")
        print(f"   🔑 Final Key: {ticket.final_key}")
    else:
        print("   ℹ️  Ticket existe déjà")

    #Obtenir un token JWT pour l'admin
    print("5. Authentification admin...")
    auth_response = requests.post(
        f"{BASE_URL}/api/auth/login/",
        json={'email': 'testadmin@olympics.fr', 'password': 'testpassword123'}
    )

    if auth_response.status_code == 200:
        token = auth_response.json()['access']
        print("   ✅ Authentification réussie")
    else:
        print(f"   ❌ Erreur auth: {auth_response.status_code}")
        return

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    #Tester la vérification du ticket
    print("6. Test vérification du ticket...")
    verify_response = requests.post(
        f"{BASE_URL}/api/admin/verify-ticket/",
        headers=headers,
        json={'final_key': ticket.final_key}
    )

    if verify_response.status_code == 200:
        verify_data = verify_response.json()
        print("Vérification réussie")
        print(f"Utilisateur: {verify_data['user']['first_name']} {verify_data['user']['last_name']}")
        print(f"Offre: {verify_data['offer']['name']}")
        print(f"Statut: {'Déjà utilisé' if verify_data['is_used'] else 'Valide'}")
    else:
        print(f"Erreur vérification: {verify_response.status_code} - {verify_response.text}")

    #Tester la validation du ticket
    print("7. Test validation du ticket...")
    validate_response = requests.post(
        f"{BASE_URL}/api/admin/tickets/{ticket.id}/validate/",
        headers=headers
    )

    if validate_response.status_code == 200:
        validate_data = validate_response.json()
        print("Validation réussie")
        print(f"Message: {validate_data['message']}")
    else:
        print(f"Erreur validation: {validate_response.status_code} - {validate_response.text}")

    #Vérifier que le ticket est bien marqué comme utilisé
    print("8. Vérification du statut après validation...")
    ticket.refresh_from_db()
    print(f"Ticket utilisé: {ticket.is_used}")

    #Tester la vérification d'un ticket déjà utilisé
    print("9. Test vérification ticket déjà utilisé...")
    verify_used_response = requests.post(
        f"{BASE_URL}/api/admin/verify-ticket/",
        headers=headers,
        json={'final_key': ticket.final_key}
    )

    if verify_used_response.status_code == 200:
        verify_used_data = verify_used_response.json()
        print(f"Statut: {'Déjà utilisé' if verify_used_data['is_used'] else 'Valide'}")
    else:
        print(f"Erreur vérification: {verify_used_response.text}")

    print("=" * 50)
    print("TESTS TERMINÉS!")


if __name__ == '__main__':
    test_backend()