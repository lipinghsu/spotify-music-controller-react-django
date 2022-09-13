from django.conf.urls import url
from .views import *


urlpatterns = [
    url(r'^get-auth-url', AuthURL.as_view()),
    url(r'^redirect', spotify_callback),
    url(r'^is-authenticated', IsAuthenticated.as_view()),
    url(r'^current-song', CurrentSong.as_view()), 
    url(r'^pause', PauseSong.as_view()), 
    url(r'^play', PlaySong.as_view()), 
    url(r'^skip-to-next', SkipToNext.as_view()), 
    url(r'^skip-to-previous', SkipToPrevious.as_view()), 
]