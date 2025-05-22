from rest_framework import routers
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path, include
from django.contrib import admin
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .views import (
    UserViewSet,
    TicketOfferViewSet,
    TicketViewSet,
    AdminStatsViewSet,
    UserRegistrationView,
    CurrentUserView,
    debug_user,
)

@csrf_exempt
def run_migrations(request):
    if request.method == 'POST' and request.headers.get('X-Secret-Key') == 'django-insecure-a3xt+yyzqt=$5z@rz@=j6%e)hgh5#c=6maqx7h5nb!&i!$tlrr':
        from django.core.management import call_command
        call_command('migrate')
        return HttpResponse("Migrations appliquées !")
    return HttpResponse("Accès refusé", status=403)

# Initialisation du routeur DRF
router = routers.DefaultRouter()
router.register(r'api/users', UserViewSet, basename='users')
router.register(r'api/ticket-offers', TicketOfferViewSet, basename='ticket-offers')
router.register(r'api/tickets', TicketViewSet, basename='tickets')
router.register(r'api/admin-stats', AdminStatsViewSet, basename='admin-stats')

urlpatterns = [
    # Routes API principales via router
    path('', include(router.urls)),

    # Authentification
    path('api/auth/register/', UserRegistrationView.as_view(), name='register'),
    path('api/auth/login/', UserViewSet.as_view({'post': 'login'}), name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('api/user/me/', CurrentUserView.as_view(), name='current-user'),

    # Nouvelle route pour l'achat de tickets
    path('api/tickets/purchase/',TicketViewSet.as_view({'post': 'purchase'}),name='ticket-purchase'),

    #path('users/me/', debug_user),

    # Validation de tickets
    path('api/tickets/validate/', TicketViewSet.as_view({'post': 'validate'}), name='ticket-validate'),

    path('', TemplateView.as_view(template_name='index.html')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
