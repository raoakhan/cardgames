"""
ASGI config for cardgames project.

It exposes the ASGI callable as a module-level variable named `application`.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from .ws_token_auth import TokenAuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cardgames.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi = get_asgi_application()

# Import after Django is initialized
from chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from games.routing import websocket_urlpatterns as game_websocket_urlpatterns

application = ProtocolTypeRouter({
    # Django's ASGI application to handle traditional HTTP requests
    "http": django_asgi,
    
    # WebSocket handler with authentication and routing
    "websocket": TokenAuthMiddlewareStack(
        AuthMiddlewareStack(
            URLRouter(
                chat_websocket_urlpatterns + game_websocket_urlpatterns
            )
        )
    ),
})
