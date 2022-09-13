from django.conf.urls import url
from .views import RoomView, CreateRoomView, GetRoom, JoinRoom, UpdateRoom, UserInRoom, LeaveRoom

urlpatterns = [
    url(r'^room', RoomView.as_view()),
    url(r'^create-room', CreateRoomView.as_view()),
    url(r'^get-room', GetRoom.as_view()),
    url(r'^join-room', JoinRoom.as_view()),
    url(r'^user-in-room', UserInRoom.as_view()),
    url(r'^leave-room', LeaveRoom.as_view()),
    url(r'^update-room', UpdateRoom.as_view())
]