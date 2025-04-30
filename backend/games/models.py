from django.db import models
from django.contrib.auth.models import User

class Room(models.Model):
    """Game room where players join to play together."""
    room_id = models.CharField(max_length=16, unique=True)
    name = models.CharField(max_length=100)
    game_type = models.CharField(max_length=50)  # e.g., 'hearts', 'spades', etc.
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.game_type})"

class Player(models.Model):
    """Player in a game room, can be authenticated user or guest."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    guest_name = models.CharField(max_length=50, null=True, blank=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='players')
    seat_position = models.IntegerField()
    is_host = models.BooleanField(default=False)
    is_bot = models.BooleanField(default=False)
    
    @property
    def display_name(self):
        return self.user.username if self.user else self.guest_name
    
    def __str__(self):
        return f"{self.display_name} in {self.room.name}"

class GameSession(models.Model):
    """Active game being played in a room."""
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='game_sessions')
    game_state = models.JSONField(default=dict)  # Store game state as JSON
    current_turn = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, related_name='turns')
    started_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_complete = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Game in {self.room.name} started at {self.started_at}"

class GameAction(models.Model):
    """Individual actions taken by players during a game."""
    game = models.ForeignKey(GameSession, on_delete=models.CASCADE, related_name='actions')
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=50)  # e.g., 'play_card', 'draw', etc.
    action_data = models.JSONField(default=dict)   # Details of the action
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.player.display_name} - {self.action_type} at {self.timestamp}"
