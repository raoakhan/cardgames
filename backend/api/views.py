import random
import string
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from games.models import Room, Player, GameSession, GameAction
from .serializers import (
    RoomSerializer, PlayerSerializer, GameSessionSerializer, GameActionSerializer,
    CreateRoomSerializer, JoinRoomSerializer
)

def generate_room_id(length=8):
    """Generate a random room ID."""
    letters = string.ascii_lowercase + string.digits
    return ''.join(random.choice(letters) for i in range(length))

class RoomViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for game rooms."""
    queryset = Room.objects.filter(is_active=True)
    serializer_class = RoomSerializer

class PlayerViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for players."""
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class GameSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for game sessions."""
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        room_id = self.request.query_params.get('room_id', None)
        if room_id is not None:
            queryset = queryset.filter(room__room_id=room_id)
        return queryset

class CreateRoomView(APIView):
    """API endpoint to create a new game room."""
    
    def post(self, request):
        serializer = CreateRoomSerializer(data=request.data)
        if serializer.is_valid():
            # Generate a unique room ID
            room_id = generate_room_id()
            while Room.objects.filter(room_id=room_id).exists():
                room_id = generate_room_id()
            
            # Create the room
            room = Room.objects.create(
                room_id=room_id,
                name=serializer.validated_data['name'],
                game_type=serializer.validated_data['game_type']
            )
            
            # Create the host player
            player_name = serializer.validated_data.get('player_name', 'Host')
            player = Player.objects.create(
                room=room,
                guest_name=player_name,
                user=request.user if request.user.is_authenticated else None,
                seat_position=0,  # Host gets first seat
                is_host=True
            )
            
            # Return both room and player info
            return Response({
                'room': RoomSerializer(room).data,
                'player': PlayerSerializer(player).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class JoinRoomView(APIView):
    """API endpoint to join an existing game room."""
    
    def post(self, request, room_id):
        try:
            room = Room.objects.get(room_id=room_id, is_active=True)
        except Room.DoesNotExist:
            return Response(
                {'error': 'Room not found or inactive'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = JoinRoomSerializer(data=request.data)
        if serializer.is_valid():
            seat_position = serializer.validated_data['seat_position']
            
            # Check if seat is available
            if Player.objects.filter(room=room, seat_position=seat_position).exists():
                return Response(
                    {'error': 'Seat already taken'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create player
            player_name = serializer.validated_data.get('player_name', f'Player_{seat_position}')
            player = Player.objects.create(
                room=room,
                guest_name=player_name,
                user=request.user if request.user.is_authenticated else None,
                seat_position=seat_position,
                is_host=False
            )
            
            return Response(PlayerSerializer(player).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
