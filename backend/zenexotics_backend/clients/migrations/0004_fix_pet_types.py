from django.db import migrations

def fix_pet_types(apps, schema_editor):
    Client = apps.get_model('clients', 'Client')
    for client in Client.objects.all():
        if not client.pet_types or client.pet_types == '':
            client.pet_types = '[]'
            client.save()

def reverse_fix_pet_types(apps, schema_editor):
    pass  # No need to reverse this migration

class Migration(migrations.Migration):
    dependencies = [
        ('clients', '0002_initial'),  # Replace with your last migration name
    ]

    operations = [
        migrations.RunPython(fix_pet_types, reverse_fix_pet_types),
    ] 