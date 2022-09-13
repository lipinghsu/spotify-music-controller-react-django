# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models
from api.models import Room

# Create your models here.

# store spitify token
class SpotifyToken(models.Model):
    user = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    refresh_token = models.CharField(max_length=150)
    access_token = models.CharField(max_length=150)
    expires_in = models.DateTimeField()
    token_type = models.CharField(max_length=50)


class Vote(models.Model):
    user = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    song_id = models.CharField(max_length=50)
    # store a reference to the Room in our vote. 
    # on_delete: do when Room gets deleted -> delete all votes if room is deleted
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    # if control is unique, only one user can vote in either type of contreol
    control = models.CharField(max_length=4, null=True)
