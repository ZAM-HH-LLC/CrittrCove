# Generated by Django 4.2.16 on 2024-11-22 00:27

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("sitters", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="sitter",
            name="user",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="sitter_profile",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
