from rest_framework import serializers
from games.models import Room, Player, GameSession, GameAction
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = ['email']

class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Player
        fields = ['id', 'user', 'guest_name', 'room', 'seat_position', 'is_host', 'is_bot', 'display_name']
        read_only_fields = ['display_name']

class RoomSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Room
        fields = ['id', 'room_id', 'name', 'game_type', 'created_at', 'is_active', 'players']
        read_only_fields = ['created_at']

class GameSessionSerializer(serializers.ModelSerializer):
    room = RoomSerializer(read_only=True)
    current_turn = PlayerSerializer(read_only=True)
    
    class Meta:
        model = GameSession
        fields = ['id', 'room', 'game_state', 'current_turn', 'started_at', 'updated_at', 'is_complete']
        read_only_fields = ['started_at', 'updated_at']

class GameActionSerializer(serializers.ModelSerializer):
    player = PlayerSerializer(read_only=True)
    
    class Meta:
        model = GameAction
        fields = ['id', 'game', 'player', 'action_type', 'action_data', 'timestamp']
        read_only_fields = ['timestamp']

class CreateRoomSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    game_type = serializers.CharField(max_length=50)
    player_name = serializers.CharField(max_length=50, required=False, allow_blank=True)

class JoinRoomSerializer(serializers.Serializer):
    player_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    seat_position = serializers.IntegerField(min_value=0)
