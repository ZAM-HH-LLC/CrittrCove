# Generated by Django 4.2.16 on 2025-01-14 03:04

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="InteractionLog",
            fields=[
                ("interaction_id", models.AutoField(primary_key=True, serialize=False)),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                ("action", models.CharField(max_length=50)),
                ("target_id", models.CharField(max_length=100)),
                ("target_type", models.CharField(max_length=50)),
                ("metadata", models.JSONField()),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-timestamp"],
                "indexes": [
                    models.Index(
                        fields=["user", "-timestamp"],
                        name="interaction_user_id_b43e9b_idx",
                    ),
                    models.Index(
                        fields=["target_id", "target_type"],
                        name="interaction_target__df54fc_idx",
                    ),
                ],
            },
        ),
    ]
