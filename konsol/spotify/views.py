# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render, redirect
from requests import Request, Response, post

from api.models import Room
from .credentials import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET
from .util import *
from .models import Vote

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response

# Create your views here.
class AuthURL(APIView):
    print("AuthURL")
    def get(self, request, format=None):
        print("AuthURL - get")
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        # # request authorization to access data
        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
        }).prepare().url
        
        # take this url, then redirect to that page
        return Response({'url': url}, status=status.HTTP_200_OK)

class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)

class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)

        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)
        
        # no song playing
        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        album_name = item.get('album').get('name')
        is_playing = response.get('is_playing')
        explicit = item.get('explicit')
        song_id = item.get('id')
        votes_next = len(Vote.objects.filter(room=room, song_id=song_id, control="next"))
        votes_prev = len(Vote.objects.filter(room=room, song_id=song_id, control="prev"))

        artist_string = ""
        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name

        

        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'is_playing': is_playing,
            'votes_next': votes_next,
            'votes_prev': votes_prev,
            'votes_required': room.votes_to_skip,
            'id': song_id,
            'image_url': album_cover,
            'album_name': album_name,
            "explicit": explicit
        }

        self.update_room_song(room, song_id)

        return Response(song, status=status.HTTP_200_OK)
    
    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            # after updating the song, votes become invalid
            votes = Vote.objects.filter(room=room).delete()

class PauseSong(APIView):
    def put(self, response, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        return Response({}, status=status.HTTP_403_FORBIDDEN)
        
class PlaySong(APIView):
    def put(self, response, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)

            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)


class SkipToNext(APIView):
    def post(self, response, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        votes = Vote.objects.filter(room=room, song_id=room.current_song, control="next")
        votes_needed = room.votes_to_skip

        vote = Vote(user=self.request.session.session_key, room=room, song_id=room.current_song, control="next")
        vote.save()

        if self.request.session.session_key == room.host or len(votes) >= votes_needed:
            votes.delete() 
            skip_to_next(room.host)

        return Response({}, status=status.HTTP_204_NO_CONTENT)

class SkipToPrevious(APIView):
    def post(self, response, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        votes = Vote.objects.filter(room=room, song_id=room.current_song, control="prev")
        votes_needed = room.votes_to_skip

        vote = Vote(user=self.request.session.session_key, room = room, song_id=room.current_song, control="prev")
        vote.save()

        if self.request.session.session_key == room.host or len(votes) >= votes_needed:
            votes.delete() 
            skip_to_previous(room.host)


        return Response({}, status=status.HTTP_204_NO_CONTENT)



def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:')