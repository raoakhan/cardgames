import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from datetime import datetime

class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat in game rooms."""
    
    async def connect(self):
        """Connect to the chat room WebSocket group."""
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        """Leave the chat room WebSocket group."""
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        """Receive message from WebSocket and broadcast to group."""
        data = json.loads(text_data)
        message = data.get('message', '')
        sender = data.get('sender', 'Anonymous')
        sender_id = data.get('sender_id')
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender,
                'sender_id': sender_id,
                'timestamp': datetime.now().isoformat()
            }
        )

    async def chat_message(self, event):
        """Send message to WebSocket."""
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender': event['sender'],
            'sender_id': event['sender_id'],
            'timestamp': event['timestamp']
        }))
