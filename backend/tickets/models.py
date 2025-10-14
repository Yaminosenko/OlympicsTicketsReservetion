from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from django.core.validators import MinLengthValidator
from django.core.exceptions import ValidationError


class User(AbstractUser):
    email = models.EmailField('email address', unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    account_key = models.UUIDField(default=uuid.uuid4, editable=False)
    password = models.CharField(
        max_length=128,
        validators=[
            MinLengthValidator(8),
       ]
    )

    groups = None
    user_permissions = None

    class Meta:
        app_label = 'tickets'
        db_table = 'tickets_user'


class TicketOffer(models.Model):
    OFFER_TYPES = [
        ('SOLO', 'Solo - 1 personne'),
        ('DUO', 'Duo - 2 personnes'),
        ('FAMILY', 'Familiale - 4 personnes'),
    ]

    name = models.CharField(max_length=100)
    offer_type = models.CharField(max_length=10, choices=OFFER_TYPES)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_offer_type_display()})"


class Ticket(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    offer = models.ForeignKey(TicketOffer, on_delete=models.PROTECT)
    purchase_key = models.UUIDField(default=uuid.uuid4, editable=False)
    final_key = models.CharField(max_length=256, editable=False)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True)
    purchase_date = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Génération de la clé finale
        if not self.final_key:
            self.final_key = f"{self.user.account_key}{self.purchase_key}"[:256]

        # Génération du QR code
        if not self.qr_code:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(self.final_key)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")

            buffer = BytesIO()
            img.save(buffer, format="PNG")
            filename = f"ticket_{self.user.username}_{self.purchase_key}.png"
            self.qr_code.save(filename, File(buffer), save=False)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Ticket {self.id} - {self.user.username}"


class AdminStats(models.Model):
    offer = models.OneToOneField(TicketOffer, on_delete=models.CASCADE, primary_key=True)
    sales_count = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Stats for {self.offer.name}: {self.sales_count} sales"


def validate_password_complexity(value):
    if len(value) < 8:
        raise ValidationError("Le mot de passe doit contenir au moins 8 caractères.")
    if not any(char.isdigit() for char in value):
        raise ValidationError("Le mot de passe doit contenir au moins un chiffre.")
    if not any(char.isupper() for char in value):
        raise ValidationError("Le mot de passe doit contenir au moins une majuscule.")
    if not any(char.islower() for char in value):
        raise ValidationError("Le mot de passe doit contenir au moins une minuscule.")
    if not any(not char.isalnum() for char in value):
        raise ValidationError("Le mot de passe doit contenir au moins un caractère spécial.")