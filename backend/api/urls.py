from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'rooms', views.RoomViewSet)
router.register(r'players', views.PlayerViewSet)
router.register(r'games', views.GameSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('rooms/<str:room_id>/join/', views.JoinRoomView.as_view(), name='join-room'),
    path('rooms/create/', views.CreateRoomView.as_view(), name='create-room'),
]
