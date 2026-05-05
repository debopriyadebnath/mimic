# WebSocket Route Documentation

## Overview

The backend now includes a persistent, always-on WebSocket route that enables real-time bidirectional communication between clients and the server.

### Endpoint

- **URL:** `ws://localhost:8000/ws` (development) or `wss://your-backend-domain.com/ws` (production)
- **Always Open:** Yes — the WebSocket server is initialized on startup and persists for the lifetime of the process

## Connection

### Basic Connection (Browser)

```javascript
const ws = new WebSocket("ws://localhost:8000/ws");

ws.onopen = () => {
  console.log("Connected to backend WebSocket");
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log("Received:", message);
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

ws.onclose = () => {
  console.log("Connection closed");
};
```

### Node.js / React Native

```javascript
import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8000/ws");

ws.on("open", () => {
  console.log("Connected");
});

ws.on("message", (data) => {
  const message = JSON.parse(data.toString());
  console.log("Received:", message);
});
```

## Message Protocol

All messages are **JSON** with a required `type` field. Send messages like:

```json
{
  "type": "ping",
  "payload": { "optional": "data" }
}
```

### Message Types

#### `ping`
Sends a heartbeat to the server; server responds with a `pong` message.

**Request:**
```json
{ "type": "ping" }
```

**Response:**
```json
{ "type": "pong", "timestamp": "2026-05-04T12:00:00.000Z" }
```

#### `echo`
Server echoes back the payload you send.

**Request:**
```json
{ "type": "echo", "payload": { "foo": "bar" } }
```

**Response:**
```json
{ "type": "echo", "payload": { "foo": "bar" } }
```

#### `subscribe`
General-purpose subscription/notification message.

**Request:**
```json
{ "type": "subscribe", "payload": { "channel": "avatar-updates" } }
```

**Response:**
```json
{ "type": "subscribed", "payload": { "channel": "avatar-updates" } }
```

#### Connection Acknowledgement
When you first connect, the server sends:

```json
{
  "type": "connected",
  "message": "WebSocket connection is open",
  "path": "/ws",
  "timestamp": "2026-05-04T12:00:00.000Z"
}
```

#### Error
Invalid messages receive an error response:

```json
{
  "type": "error",
  "message": "Invalid message format. Send JSON with a type field."
}
```

## Heartbeat & Connection Management

- **Server Heartbeat:** Every 30 seconds, the server sends a `ping` frame to all connected clients to detect dead connections.
- **Client Responsibility:** Respond with a `pong` frame (automatic in most WebSocket libraries).
- **Timeout:** Clients that don't respond to `ping` frames within 30 seconds are terminated.

## Error Handling

- **Invalid JSON:** Disconnected automatically.
- **Malformed Messages:** Server sends error response but keeps connection alive.
- **Network Errors:** Check browser/client console for network stack errors.

## Use Cases

1. **Real-time Chat / Notifications** — Push updates to clients without polling.
2. **Live Data Streaming** — Avatar status, trainer updates, memory changes.
3. **Collaborative Features** — Multi-user avatar training sessions.
4. **Health Checks** — Monitor backend availability via `/ws` ping.

## Implementation Notes

- The WebSocket server is registered on the HTTP `upgrade` event, so it coexists with Express routes.
- The route is guarded by a flag to prevent double-registration in case the server is restarted.
- All WebSocket connections are tracked in memory; they will be lost if the backend restarts (consider persisting if needed).
- CORS is **not** applied to WebSocket handshakes; authentication should be added as needed.

## Future Enhancements

- Add Clerk authentication checks during WebSocket upgrade.
- Implement message queuing and replay for disconnected clients.
- Add per-user/per-avatar message filtering and routing.
- Store connection metadata (userId, avatarId) for targeted broadcasts.

