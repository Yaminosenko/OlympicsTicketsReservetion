# Generated by Django 5.2.1 on 2025-05-21 21:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0002_alter_user_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ticket',
            name='final_key',
            field=models.CharField(editable=False, max_length=256),
        ),
    ]
