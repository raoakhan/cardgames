import urllib.parse
from typing import Optional, Callable, Awaitable

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication

# Simple in-memory presence store for dev use only
ONLINE_USERS = set()

class TokenAuthMiddleware(BaseMiddleware):
    """Custom Channels middleware that authenticates a user via JWT.

    The token can be passed via:
      • Query param: ?token=<JWT>
      • Header: Authorization: Bearer <JWT>
    """

    def __init__(self, inner: Callable[..., Awaitable]):
        super().__init__(inner)
        self.jwt_auth = JWTAuthentication()

    async def __call__(self, scope, receive, send):
        token = self._get_token(scope)
        scope['user'] = AnonymousUser()
        if token:
            user = await self._get_user(token)
            scope['user'] = user or AnonymousUser()
            if user and user.is_authenticated:
                ONLINE_USERS.add(user.id)

        async def wrapped_receive():
            message = await receive()
            # When socket disconnects, remove user from presence list
            if message.get('type') == 'websocket.disconnect':
                user = scope.get('user')
                if user and user.is_authenticated:
                    ONLINE_USERS.discard(user.id)
            return message

        return await super().__call__(scope, wrapped_receive, send)

    def _get_token(self, scope) -> Optional[str]:
        # Header first
        headers = dict(scope.get('headers', []))
        auth_header = headers.get(b'authorization')
        if auth_header:
            auth = auth_header.decode()
            if auth.lower().startswith('bearer'):
                return auth.split(' ', 1)[1]
        # Query string
        query_string = scope.get('query_string', b'').decode()
        params = urllib.parse.parse_qs(query_string)
        return params.get('token', [None])[0]

    @database_sync_to_async
    def _get_user(self, raw_token):
        try:
            validated = self.jwt_auth.get_validated_token(raw_token)
            return self.jwt_auth.get_user(validated)
        except Exception:
            return None

# Helper to build middleware stack
def TokenAuthMiddlewareStack(inner):
    from channels.auth import AuthMiddlewareStack
    return TokenAuthMiddleware(AuthMiddlewareStack(inner))
