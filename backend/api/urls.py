from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'rooms', views.RoomViewSet)
router.register(r'players', views.PlayerViewSet)
router.register(r'games', views.GameSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('rooms/<str:room_id>/join/', views.JoinRoomView.as_view(), name='join-room'),
    path('rooms/create/', views.CreateRoomView.as_view(), name='create-room'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', views.MeView.as_view(), name='me'),
    path('friends/online/', views.FriendsOnlineView.as_view(), name='friends-online'),
]
