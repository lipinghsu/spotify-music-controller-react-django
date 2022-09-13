# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
import string
import random

def generate_unique_code():
    code_length = 6

    while True:
        # generate a string, k length, only contains uppercase ascii char
        code = ''.join(random.choice(string.ascii_uppercase + string.digits) for i in range(code_length))
        if Room.objects.filter(code=code).count() == 0:
            break
    return code;

# Create your models here.
class Room(models.Model):
    code = models.CharField(max_length=12, default=generate_unique_code, unique=True)
    host = models.CharField(max_length=50, unique=True)
    guest_can_pause = models.BooleanField(null=False, default=False)        #null=False -> must pass a value
    votes_to_skip = models.IntegerField(null=False, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    current_song = models.CharField(max_length= 50, null=True)