import asyncio
import websockets
import json
import logging
from threading import Thread

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("WebSocketServer")

class WebSocketServer:
    def __init__(self, host="localhost", port=8765):
        self.host = host
        self.port = port
        self.clients = set()
        self.loop = None
        self.thread = None
        self.running = False

    def start(self):
        """Starts the WebSocket server in a separate thread."""
        self.running = True
        self.thread = Thread(target=self._run_server, daemon=True)
        self.thread.start()
        logger.info(f"WebSocket Server started on ws://{self.host}:{self.port}")

    async def _async_serve(self):
        """Async entry point for the server."""
        async with websockets.serve(self.handler, self.host, self.port):
            await asyncio.Future()  # run forever

    def _run_server(self):
        """Internal method to run the asyncio event loop."""
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        self.loop.run_until_complete(self._async_serve())

    async def handler(self, websocket):
        """Handles new WebSocket connections."""
        self.clients.add(websocket)
        logger.info(f"Client connected. Total clients: {len(self.clients)}")
        try:
            await websocket.wait_closed()
        except Exception as e:
            logger.error(f"Error in connection handler: {e}")
        finally:
            self.clients.remove(websocket)
            logger.info("Client disconnected.")

    def broadcast(self, message_type: str, data: dict):
        """Broadcasts a JSON message to all connected clients."""
        if not self.clients or not self.loop:
            return

        payload = json.dumps({
            "type": message_type,
            "data": data,
            "timestamp": asyncio.get_event_loop().time() if self.loop.is_running() else 0
        })

        asyncio.run_coroutine_threadsafe(self._send_all(payload), self.loop)

    async def _send_all(self, payload):
        """Async helper to send messages to all clients."""
        if self.clients:
            await asyncio.gather(*[client.send(payload) for client in self.clients], return_exceptions=True)

# Example Usage:
# server = WebSocketServer()
# server.start()
# server.broadcast("node_update", {"id": 1, "lat": 44.0, "lng": -105.0})
