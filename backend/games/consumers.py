import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Room, Player, GameSession, GameAction

class GameConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for game actions and real-time updates."""
    
    async def connect(self):
        """Connect to the game room WebSocket group."""
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'game_{self.room_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        """Leave the game room WebSocket group."""
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Receive message from WebSocket and process game action."""
        data = json.loads(text_data)
        action_type = data.get('action_type')
        action_data = data.get('data', {})
        player_id = data.get('player_id')
        
        # Handle different types of game actions
        if action_type == 'join_game':
            await self.handle_join_game(player_id, action_data)
        elif action_type == 'play_card':
            await self.handle_play_card(player_id, action_data)
        elif action_type == 'draw_card':
            await self.handle_draw_card(player_id, action_data)
        elif action_type == 'end_turn':
            await self.handle_end_turn(player_id, action_data)
        # Add more action handlers as needed

    async def handle_join_game(self, player_id, data):
        """Handle a player joining the game."""
        # Logic for adding player to the game
        # Update game state
        # Broadcast to all players in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'event': 'player_joined',
                'player_id': player_id,
                'data': data
            }
        )

    async def handle_play_card(self, player_id, data):
        """Handle a player playing a card."""
        # Logic for playing a card
        # Validate move, update game state
        # Broadcast to all players in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'event': 'card_played',
                'player_id': player_id,
                'data': data
            }
        )

    async def handle_draw_card(self, player_id, data):
        """Handle a player drawing a card."""
        # Logic for drawing a card
        # Update game state
        # Broadcast to all players in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'event': 'card_drawn',
                'player_id': player_id,
                'data': data
            }
        )

    async def handle_end_turn(self, player_id, data):
        """Handle a player ending their turn."""
        # Logic for ending turn
        # Update game state, set next player's turn
        # Broadcast to all players in the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'event': 'turn_ended',
                'player_id': player_id,
                'data': data
            }
        )

    async def game_update(self, event):
        """Send game update to WebSocket."""
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event))
