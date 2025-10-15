from rest_framework import serializers
from .models import User, TicketOffer, Ticket, AdminStats
from django.contrib.auth.password_validation import validate_password




class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'is_staff': {'read_only': True},
            'is_superuser': {'read_only': True},
        }

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'account_key', 'date_joined']
        read_only_fields = fields

class TicketOfferSerializer(serializers.ModelSerializer):
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    class Meta:
        model = TicketOffer
        fields = '__all__'


class TicketSerializer(serializers.ModelSerializer):
    offer = TicketOfferSerializer(read_only=True)
    qr_code_url = serializers.SerializerMethodField()
    final_key = serializers.CharField(read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'offer', 'purchase_date', 'qr_code', 'qr_code_url', 'is_used', 'final_key']
        extra_kwargs = {
            'qr_code': {'read_only': True},
            'purchase_date': {'read_only': True},
        }

    def get_qr_code_url(self, obj):
        request = self.context.get('request')
        if obj.qr_code and request:
            return request.build_absolute_uri(obj.qr_code.url)
        return None

    def create(self, validated_data):

        offer = self.context.get('offer')
        user = self.context.get('user')

        if not offer or not user:
            raise serializers.ValidationError("Missing required context")


        ticket = Ticket.objects.create(
            user=user,
            offer=offer,

        )

        return ticket


class AdminStatsSerializer(serializers.ModelSerializer):
    offer = TicketOfferSerializer(read_only=True)

    class Meta:
        model = AdminStats
        fields = ['offer', 'sales_count', 'last_updated']