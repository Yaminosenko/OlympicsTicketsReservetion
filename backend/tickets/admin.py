from django.contrib import admin
from .models import Ticket, TicketOffer

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'offer', 'purchase_date', 'is_used')
    list_filter = ('is_used', 'offer')
    search_fields = ('user__username', 'final_key')
    readonly_fields = ('final_key', 'purchase_key', 'purchase_date')

@admin.register(TicketOffer)
class TicketOfferAdmin(admin.ModelAdmin):
    list_display = ('name', 'offer_type', 'price', 'available')
    list_editable = ('price', 'available')