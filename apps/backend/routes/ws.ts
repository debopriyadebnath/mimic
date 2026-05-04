import type { IncomingMessage } from "http";
import type { Server as HttpServer } from "http";
import { WebSocketServer, type WebSocket } from "ws";

type AliveSocket = WebSocket & { isAlive?: boolean };

type WsMessage = {
  type: "ping" | "echo" | "subscribe";
  payload?: unknown;
};

function parseMessage(data: Buffer | ArrayBuffer | Buffer[]): WsMessage | null {
  const text = Buffer.isBuffer(data)
    ? data.toString("utf8")
    : Array.isArray(data)
      ? Buffer.concat(data).toString("utf8")
      : Buffer.from(data).toString("utf8");

  try {
    const parsed = JSON.parse(text) as Partial<WsMessage>;
    if (parsed && typeof parsed.type === "string") {
      return parsed as WsMessage;
    }
  } catch {
    return null;
  }

  return null;
}

export function registerWebSocketRoute(server: HttpServer): void {
  const routeKey = "__mimicWebSocketRouteInstalled";
  if ((server as HttpServer & Record<string, unknown>)[routeKey]) {
    return;
  }
  (server as HttpServer & Record<string, unknown>)[routeKey] = true;

  const wss = new WebSocketServer({ noServer: true });
  const sockets = new Set<AliveSocket>();

  const heartbeat = (socket: AliveSocket) => {
    socket.isAlive = true;
  };

  const interval = setInterval(() => {
    for (const socket of sockets) {
      if (!socket.isAlive) {
        sockets.delete(socket);
        socket.terminate();
        continue;
      }

      socket.isAlive = false;
      socket.ping();
    }
  }, 30000);

  interval.unref();

  wss.on("connection", (socket: AliveSocket, request: IncomingMessage) => {
    socket.isAlive = true;
    sockets.add(socket);

    socket.send(
      JSON.stringify({
        type: "connected",
        message: "WebSocket connection is open",
        path: request.url,
        timestamp: new Date().toISOString(),
      })
    );

    socket.on("pong", () => heartbeat(socket));

    socket.on("message", (raw) => {
      const message = parseMessage(raw as Buffer | ArrayBuffer | Buffer[]);

      if (!message) {
        socket.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format. Send JSON with a type field.",
          })
        );
        return;
      }

      if (message.type === "ping") {
        socket.send(
          JSON.stringify({
            type: "pong",
            timestamp: new Date().toISOString(),
          })
        );
        return;
      }

      if (message.type === "echo") {
        socket.send(
          JSON.stringify({
            type: "echo",
            payload: message.payload ?? null,
          })
        );
        return;
      }

      socket.send(
        JSON.stringify({
          type: "subscribed",
          payload: message.payload ?? null,
        })
      );
    });

    socket.on("close", () => {
      sockets.delete(socket);
    });

    socket.on("error", () => {
      sockets.delete(socket);
    });
  });

  server.on("upgrade", (request, socket, head) => {
    const url = request.url || "";
    if (!url.startsWith("/ws")) {
      return;
    }

    wss.handleUpgrade(request, socket, head, (websocket) => {
      wss.emit("connection", websocket, request);
    });
  });

  wss.on("close", () => {
    clearInterval(interval);
  });
}