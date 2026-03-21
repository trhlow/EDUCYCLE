import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

/**
 * Create a STOMP client subscribed to a transaction's chat room.
 * Auth via JWT in STOMP CONNECT header.
 *
 * @param {string} token         - JWT access token
 * @param {string} transactionId - UUID of the transaction
 * @param {function} onMessage   - callback(MessageResponse)
 * @returns {Client} — call client.activate() to connect, client.deactivate() to disconnect
 */
export function createChatClient(token, transactionId, onMessage) {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${WS_BASE}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    onConnect: () => {
      client.subscribe(
        `/topic/transaction.${transactionId}`,
        (frame) => {
          try {
            onMessage(JSON.parse(frame.body));
          } catch {
            // malformed frame — ignore
          }
        }
      );
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame.headers?.message);
    },
  });

  return client;
}

/**
 * Publish a chat message via STOMP (bypasses HTTP, server persists + broadcasts).
 */
export function sendChatMessage(client, transactionId, content) {
  if (client?.connected) {
    client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ transactionId, content }),
    });
  }
}
