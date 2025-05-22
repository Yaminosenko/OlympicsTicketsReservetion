from django.test import TestCase
from backend.tickets.models import Ticket, TicketOffer
from django.contrib.auth import get_user_model

User = get_user_model()

class TicketModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.offer = TicketOffer.objects.create(
            name="Test Offer",
            price=100.00,
            offer_type="SOLO"
        )

    def test_ticket_creation(self):
        ticket = Ticket.objects.create(
            user=self.user,
            offer=self.offer
        )
        self.assertEqual(ticket.final_key, f"{self.user.account_key}{ticket.purchase_key}")
        self.assertTrue(ticket.qr_code.name.startswith('qr_codes/'))