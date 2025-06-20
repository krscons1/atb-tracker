# Generated by Django 5.2.1 on 2025-06-17 16:04

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_settings', '0003_alter_userprofile_options_and_more'),
        ('users', '0003_member_password'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to='users.member'),
        ),
    ]
