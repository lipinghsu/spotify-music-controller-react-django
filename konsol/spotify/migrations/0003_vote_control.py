# -*- coding: utf-8 -*-
# Generated by Django 1.11.29 on 2022-09-11 23:47
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spotify', '0002_vote'),
    ]

    operations = [
        migrations.AddField(
            model_name='vote',
            name='control',
            field=models.CharField(max_length=4, null=True, unique=True),
        ),
    ]
