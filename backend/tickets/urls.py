from rest_framework import routers
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path, include
from django.contrib import admin
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import TicketOffer
from django.core.exceptions import PermissionDenied
from .views import (
    UserViewSet,
    TicketOfferViewSet,
    TicketViewSet,
    UserRegistrationView,
    CurrentUserView,
    debug_user,
    admin_dashboard,
    admin_sales_stats,
    AdminTicketOfferViewSet,
    admin_verify_ticket,
)


@csrf_exempt
def create_sample_offers(request):
    # Protection basique (à supprimer après usage)
    if request.headers.get('X-Secret-Key') != 'cle':
        raise PermissionDenied

    # Offres par défaut à créer
    sample_offers = [
        {
            'name': 'Pass Solo Jour 1',
            'offer_type': 'SOLO',
            'description': 'Accès 1 personne pour la journée d\'ouverture',
            'price': 50.00
        },
        {
            'name': 'Pass Duo Weekend',
            'offer_type': 'DUO',
            'description': 'Accès 2 personnes pour le weekend',
            'price': 85.00
        },
        {
            'name': 'Pack Famille',
            'offer_type': 'FAMILY',
            'description': 'Accès 4 personnes pour 3 jours',
            'price': 200.00
        }
    ]

    created_offers = []
    for offer_data in sample_offers:
        offer, created = TicketOffer.objects.get_or_create(
            name=offer_data['name'],
            defaults=offer_data
        )
        created_offers.append({
            'id': offer.id,
            'name': offer.name,
            'created': created
        })

    return JsonResponse({'status': 'success', 'offers': created_offers})

@csrf_exempt
def create_superuser(request):
    if request.method == 'POST':
        try:
            username = request.POST.get('username')
            email = request.POST.get('email')
            password = request.POST.get('password')

            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Cet utilisateur existe déjà'}, status=400)

            User.objects.create_superuser(username, email, password)
            return JsonResponse({'status': 'Superuser créé avec succès'})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

@csrf_exempt
def run_migrations(request): #pas d'acces au shell Render
    if request.method == 'POST' and request.headers.get('X-Secret-Key') == 'cle':
        from django.core.management import call_command
        call_command('migrate')
        return HttpResponse("Migrations appliquées !")
    return HttpResponse("Accès refusé", status=403)

# Initialisation du routeur DRF
router = routers.DefaultRouter()
router.register(r'api/users', UserViewSet, basename='users')
router.register(r'api/ticket-offers', TicketOfferViewSet, basename='ticket-offers')
router.register(r'api/tickets', TicketViewSet, basename='tickets')
#.register(r'api/admin-stats', AdminStatsViewSet, basename='admin-stats')
router.register(r'api/admin/offers', AdminTicketOfferViewSet, basename='admin-offers')

urlpatterns = [
    # Routes API principales via router
    path('', include(router.urls)),

    # Authentification
    path('api/auth/register/', UserRegistrationView.as_view(), name='register'),
    path('api/auth/login/', UserViewSet.as_view({'post': 'login'}), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('api/user/me/', CurrentUserView.as_view(), name='current-user'),

    # Route pour l'achat de tickets
    path('api/tickets/purchase/',TicketViewSet.as_view({'post': 'purchase'}),name='ticket-purchase'),

    # Routes admin supplémentaires pour les tickets
    path('api/admin/tickets/',TicketViewSet.as_view({'get': 'admin_tickets'}), name='admin-tickets-list'),
    path('api/admin/tickets/<int:pk>/validate/',TicketViewSet.as_view({'post': 'validate_ticket'}),name='admin-validate-ticket'),
    path('api/admin/verify-ticket/', admin_verify_ticket, name='admin-verify-ticket'),

    # Routes pour la gestion admin des offres
    path('api/admin/offers/',AdminTicketOfferViewSet.as_view({'get': 'list', 'post': 'create'}),name='admin-offers-list'),
    path('api/admin/offers/<int:pk>/', AdminTicketOfferViewSet.as_view({'put': 'update', 'delete': 'destroy'}),name='admin-offers-detail'),
    path('api/admin/offers/<int:pk>/activate/',AdminTicketOfferViewSet.as_view({'post': 'activate'}),name='admin-offers-activate'),
    path('api/admin/offers/<int:pk>/permanent-delete/', AdminTicketOfferViewSet.as_view({'delete': 'permanent_delete'}),name='admin-offers-permanent-delete'),

    # Routes ADMIN pour le dashboard
    path('api/admin/dashboard/', admin_dashboard, name='admin-dashboard'),
    path('api/admin/sales-stats/', admin_sales_stats, name='admin-sales-stats'),


    #route pour outrepasser le shell
    path('api/secret-migrate/', run_migrations),
    path('api/secret-superuser/', create_superuser),
    path('api/create-sample-offers/', create_sample_offers, name='create_offers'),

    #path('users/me/', debug_user),

    # Validation de tickets
    #path('api/tickets/validate/', TicketViewSet.as_view({'post': 'validate'}), name='ticket-validate'),

    path('', TemplateView.as_view(template_name='index.html')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
