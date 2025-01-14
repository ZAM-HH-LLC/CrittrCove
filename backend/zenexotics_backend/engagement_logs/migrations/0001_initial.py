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
            name="EngagementLog",
            fields=[
                ("engagement_id", models.AutoField(primary_key=True, serialize=False)),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                ("page_name", models.CharField(max_length=100)),
                (
                    "duration",
                    models.IntegerField(help_text="Time spent on the page in seconds"),
                ),
                (
                    "interactions",
                    models.JSONField(help_text="List of interactions on the page"),
                ),
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
                        name="engagement__user_id_257007_idx",
                    ),
                    models.Index(
                        fields=["page_name"], name="engagement__page_na_b27619_idx"
                    ),
                ],
            },
        ),
    ]
