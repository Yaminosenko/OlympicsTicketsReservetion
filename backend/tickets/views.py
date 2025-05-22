from rest_framework.generics import RetrieveAPIView
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import User, TicketOffer, Ticket, AdminStats
from .serializers import UserSerializer, TicketOfferSerializer, TicketSerializer, AdminStatsSerializer, CurrentUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view

@api_view(['GET'])
def debug_user(request):
   return Response({"data": "Test réussi !"})

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)

        if not user:
            print("Échec auth. User exists?", User.objects.filter(email=email).exists())
            return Response({'error': 'Identifiants invalides'}, status=401)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        })

    @action(detail=False, methods=['post'])
    def validate(self, request):
        ticket_id = request.data.get('ticket_id')
        return Response({'status': 'validated'})

class CurrentUserView(RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CurrentUserSerializer

    def get_object(self):
        return self.request.user

class TicketOfferViewSet(viewsets.ModelViewSet):
    queryset = TicketOffer.objects.filter(available=True)
    serializer_class = TicketOfferSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()




class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]


    def get_queryset(self):
        if self.request.user.is_staff:
            return Ticket.objects.all()
        return Ticket.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        offer = get_object_or_404(TicketOffer, id=self.request.data.get('offer_id'))


        serializer.context.update({
            'offer': offer,
            'user': self.request.user,
            'request': self.request
        })


        ticket = serializer.save()


        stats, created = AdminStats.objects.get_or_create(offer=offer)
        stats.sales_count += 1
        stats.save()



    @action(detail=False, methods=['post'])
    def purchase(self, request):

        offer = get_object_or_404(TicketOffer, id=request.data.get('offer_id'))


        serializer = self.get_serializer(data={
            'offer': offer.id,
            'user': request.user.id
        })
        serializer.is_valid(raise_exception=True)


        self.perform_create(serializer)
        ticket = serializer.instance

        return Response({
            'status': 'purchased',
            'ticket_id': ticket.id,
            'qr_code_url': ticket.qr_code.url if ticket.qr_code else None,
            'final_key': ticket.final_key,
            'offer': offer.name
        }, status=201)

    @action(detail=False, methods=['post'])
    def validate(self, request):

        ticket_id = request.data.get('ticket_id')
        return Response({'status': 'validated'})





class AdminStatsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AdminStats.objects.all()
    serializer_class = AdminStatsSerializer
    permission_classes = [permissions.IsAdminUser]


class UserRegistrationView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": UserSerializer(user).data,
            "message": "User created successfully",
        }, status=status.HTTP_201_CREATED)




