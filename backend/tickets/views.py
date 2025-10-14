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
from django.db.models import Count, Sum
from django.db import models
import json

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


    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def admin_tickets(self, request):
        """Route admin pour voir tous les tickets"""
        tickets = Ticket.objects.select_related('user', 'offer').all()
        tickets_data = []

        for ticket in tickets:
            tickets_data.append({
                'ticket_id': ticket.id,
                'user': {
                    'id': ticket.user.id,
                    'email': ticket.user.email,
                    'first_name': ticket.user.first_name,
                    'last_name': ticket.user.last_name,
                },
                'offer': {
                    'name': ticket.offer.name,
                    'type': ticket.offer.get_offer_type_display(),
                    'price': float(ticket.offer.price)
                },
                'purchase_date': ticket.purchase_date.isoformat(),
                'is_used': ticket.is_used,
                'final_key_preview': str(ticket.final_key)[:20] + '...' if ticket.final_key else None,
                'qr_code_url': ticket.qr_code.url if ticket.qr_code else None
            })

        return Response({'tickets': tickets_data})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def validate_ticket(self, request, pk=None):
        """Valider un ticket (marquer comme utilisé)"""
        ticket = self.get_object()

        if ticket.is_used:
            return Response({'error': 'Ticket déjà utilisé'}, status=status.HTTP_400_BAD_REQUEST)

        ticket.is_used = True
        ticket.save()

        return Response({
            'message': 'Ticket validé avec succès',
            'ticket_id': ticket.id,
            'user': f"{ticket.user.first_name} {ticket.user.last_name}",
            'offer': ticket.offer.name
        })


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


class AdminTicketOfferViewSet(viewsets.ModelViewSet):
    """ViewSet spécial pour la gestion admin des offres"""
    queryset = TicketOffer.objects.all()
    serializer_class = TicketOfferSerializer
    permission_classes = [permissions.IsAdminUser]

    def list(self, request):
        """Liste toutes les offres avec statistiques pour l'admin"""
        offers = TicketOffer.objects.all().annotate(
            ticket_count=Count('ticket')
        )

        offers_data = []
        for offer in offers:
            offers_data.append({
                'id': offer.id,
                'name': offer.name,
                'offer_type': offer.offer_type,
                'offer_type_display': offer.get_offer_type_display(),
                'description': offer.description,
                'price': float(offer.price),
                'available': offer.available,
                'ticket_count': offer.ticket_count,
                'revenue': float(offer.price * offer.ticket_count),
                'created_at': offer.created_at.isoformat(),
                'updated_at': offer.updated_at.isoformat(),
            })

        return Response({'offers': offers_data})

    def create(self, request):
        """Créer une nouvelle offre"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Offre créée avec succès',
                'offer': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        """Modifier une offre existante"""
        offer = self.get_object()
        serializer = self.get_serializer(offer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Offre modifiée avec succès',
                'offer': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Supprimer une offre (désactivation)"""
        offer = self.get_object()
        offer.available = False
        offer.save()
        return Response({'message': 'Offre désactivée avec succès'})


@api_view(['GET'])
def admin_sales_stats(request):
    """Statistiques des ventes pour les graphiques"""
    if not request.user.is_authenticated or not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    try:
        # Statistiques détaillées par offre
        sales_by_offer = Ticket.objects.values(
            'offer__id',
            'offer__name',
            'offer__offer_type'
        ).annotate(
            total_sales=Count('id'),
            total_revenue=Sum('offer__price')
        ).order_by('-total_sales')

        # Préparer les données pour le graphique
        chart_labels = []
        chart_sales_data = []
        chart_revenue_data = []
        offers_details = []

        for stat in sales_by_offer:
            offer_name = f"{stat['offer__name']} ({stat['offer__offer_type']})"
            chart_labels.append(offer_name)
            chart_sales_data.append(stat['total_sales'])
            chart_revenue_data.append(float(stat['total_revenue']) if stat['total_revenue'] else 0)

            offers_details.append({
                'id': stat['offer__id'],
                'name': stat['offer__name'],
                'type': stat['offer__offer_type'],
                'type_display': dict(TicketOffer.OFFER_TYPES).get(stat['offer__offer_type'], stat['offer__offer_type']),
                'total_sales': stat['total_sales'],
                'total_revenue': float(stat['total_revenue']) if stat['total_revenue'] else 0,
                'average_revenue_per_sale': float(stat['total_revenue'] / stat['total_sales']) if stat[
                                                                                                      'total_sales'] > 0 else 0
            })

        # Statistiques globales
        total_stats = Ticket.objects.aggregate(
            total_tickets=Count('id'),
            total_revenue=Sum('offer__price'),
            used_tickets=Count('id', filter=models.Q(is_used=True))
        )

        # Statistiques par type d'offre
        stats_by_type = Ticket.objects.values(
            'offer__offer_type'
        ).annotate(
            total_sales=Count('id'),
            total_revenue=Sum('offer__price')
        )

        type_stats = {}
        for stat in stats_by_type:
            type_stats[stat['offer__offer_type']] = {
                'total_sales': stat['total_sales'],
                'total_revenue': float(stat['total_revenue']) if stat['total_revenue'] else 0
            }

        return Response({
            'chart_data': {
                'labels': chart_labels,
                'sales': chart_sales_data,
                'revenue': chart_revenue_data,
            },
            'offers_details': offers_details,
            'global_stats': {
                'total_tickets': total_stats['total_tickets'],
                'total_revenue': float(total_stats['total_revenue']) if total_stats['total_revenue'] else 0,
                'used_tickets': total_stats['used_tickets'],
                'available_tickets': total_stats['total_tickets'] - total_stats['used_tickets'],
                'usage_rate': (total_stats['used_tickets'] / total_stats['total_tickets'] * 100) if total_stats[
                                                                                                        'total_tickets'] > 0 else 0
            },
            'type_stats': type_stats
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def admin_dashboard(request):
    """Page principale de l'admin avec tous les données"""
    if not request.user.is_authenticated or not (request.user.is_staff or request.user.is_superuser):
        return Response({'error': 'Accès non autorisé'}, status=status.HTTP_403_FORBIDDEN)

    try:
        # Récupérer toutes les offres pour l'onglet gestion
        offers = TicketOffer.objects.all().annotate(
            ticket_count=Count('ticket')
        )

        offers_data = []
        for offer in offers:
            offers_data.append({
                'id': offer.id,
                'name': offer.name,
                'offer_type': offer.offer_type,
                'offer_type_display': offer.get_offer_type_display(),
                'description': offer.description,
                'price': float(offer.price),
                'available': offer.available,
                'ticket_count': offer.ticket_count,
                'revenue': float(offer.price * offer.ticket_count),
                'created_at': offer.created_at.strftime('%d/%m/%Y %H:%M'),
                'updated_at': offer.updated_at.strftime('%d/%m/%Y %H:%M'),
            })

        # Statistiques pour les graphiques
        sales_by_offer = Ticket.objects.values(
            'offer__id',
            'offer__name',
            'offer__offer_type'
        ).annotate(
            total_sales=Count('id'),
            total_revenue=Sum('offer__price')
        ).order_by('-total_sales')

        chart_labels = []
        chart_sales_data = []
        chart_revenue_data = []

        for stat in sales_by_offer:
            offer_name = f"{stat['offer__name']}"
            chart_labels.append(offer_name)
            chart_sales_data.append(stat['total_sales'])
            chart_revenue_data.append(float(stat['total_revenue']) if stat['total_revenue'] else 0)

        # Statistiques globales
        total_stats = Ticket.objects.aggregate(
            total_tickets=Count('id'),
            total_revenue=Sum('offer__price'),
            used_tickets=Count('id', filter=models.Q(is_used=True))
        )

        return Response({
            'offers': offers_data,
            'chart_data': {
                'labels': chart_labels,
                'sales': chart_sales_data,
                'revenue': chart_revenue_data,
            },
            'global_stats': {
                'total_tickets': total_stats['total_tickets'],
                'total_revenue': float(total_stats['total_revenue']) if total_stats['total_revenue'] else 0,
                'used_tickets': total_stats['used_tickets'],
                'available_tickets': total_stats['total_tickets'] - total_stats['used_tickets']
            }
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



