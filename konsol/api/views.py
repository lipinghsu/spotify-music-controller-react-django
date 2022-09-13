# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from os import stat
import string
import random
from django.http import JsonResponse
from django.shortcuts import render
from rest_framework import generics, status

from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer

from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView
from django.http import JsonResponse

import string
import random



    
# Create your views here.

class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class CreateRoomView(generics.ListCreateAPIView):
    serializer_class = CreateRoomSerializer
    queryset = Room.objects.all()

    def post(self, request, format=None):
        code_length = 6
        # check if the current user has an active session, if not create one.
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            # grab info from data
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            user_id = self.request.session.session_key

            # check if the current user is the host of a room
            queryset_host = Room.objects.filter(host=user_id)

            if queryset_host.exists():   # room already exists
                room = queryset_host[0]
                # update the room and user status
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

            else:   # room does not exist -> create a new room
                room = Room(host=user_id, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = (self.request.session.session_key == room[0].host)        # host is the session key
                return Response(data, status= status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Reuest': 'Code paramater not found in request.'}, status=status.HTTP_400_BAD_REQUEST)

class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        # check if the current user has an active session, if not create one.
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # get the code from the post request.
        code = request.data.get(self.lookup_url_kwarg)

        # if code exist, find and set the room to join
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                # make a node on the backend: user's current session is in the room before returning
                self.request.session['room_code'] = code
                return Response({'messgae': 'Room joined!', 'join': 'true'}, status= status.HTTP_200_OK)

            return Response({'Bad Request': 'Invalid room code.'}, status= status.HTTP_400_BAD_REQUEST)

        # code does not exist
        return Response({'Bad Request': 'Invalid post data, did not find a code key.'}, status= status.HTTP_400_BAD_REQUEST)


class UserInRoom(APIView):
    def get(self, request, format=None):
        # check if the current user has an active session, if not create one.
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code')
        }
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            # remove room code from the session
            code = self.request.session.pop('room_code')
            
            # check if the user is the host of the room
            user_id = self.request.session.session_key
            room_results = Room.objects.filter(host=user_id)

            # close the room if the host leaves.
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()

        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)

class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        # check if the current user has an active session, if not create one.
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data) 
        
        if serializer.is_valid():
            print(serializer.data)
            # grab info from data
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            # search for the target room to update
            queryset = Room.objects.filter(code=code)

            if not queryset.exists():
                return Response({'Message': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

            room = queryset[0]

            # make sure the person who updates the room is the host
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({'Message': 'You are not the host of this room.'}, status=status.HTTP_403_FORBIDDEN)

            # update the room
            room.guest_can_pause = guest_can_pause 
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])

            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({'Bad Request': 'Invalid Data...'}, status= status.HTTP_400_BAD_REQUEST)