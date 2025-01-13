# Generated by Django 4.2.16 on 2025-01-13 23:05

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Availability",
            fields=[
                (
                    "availability_id",
                    models.AutoField(primary_key=True, serialize=False),
                ),
                ("date", models.DateField()),
                ("start_time", models.TimeField()),
                ("end_time", models.TimeField()),
                (
                    "type",
                    models.CharField(
                        choices=[("UNAVAILABLE", "Unavailable"), ("BOOKED", "Booked")],
                        max_length=50,
                    ),
                ),
                ("reason", models.CharField(blank=True, max_length=255, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name_plural": "availabilities",
                "db_table": "availability",
                "ordering": ["date", "start_time"],
            },
        ),
    ]
