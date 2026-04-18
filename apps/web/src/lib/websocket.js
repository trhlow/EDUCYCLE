import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { resolveWsOrigin } from './api-base';

const wsOrigin = () => resolveWsOrigin();

/**
 * Create a STOMP client subscribed to a transaction chat room.
 * @param {string} token
 * @param {string} transactionId
 * @param {(payload: any) => void} onMessage
 * @param {{onConnect?: () => void, onDisconnect?: () => void, onError?: () => void}} lifecycle
 * @returns {Client}
 */
export function createChatClient(token, transactionId, onMessage, lifecycle = {}) {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${wsOrigin()}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    onConnect: () => {
      lifecycle.onConnect?.();
      client.subscribe(`/topic/transaction.${transactionId}`, (frame) => {
        try {
          onMessage(JSON.parse(frame.body));
        } catch {
          // ignore malformed frame
        }
      });
    },
    onStompError: (frame) => {
      lifecycle.onError?.();
      console.error('STOMP error:', frame.headers?.message);
    },
    onWebSocketClose: () => lifecycle.onDisconnect?.(),
    onWebSocketError: () => lifecycle.onError?.(),
  });

  return client;
}

/**
 * Publish chat message via STOMP.
 */
export function sendChatMessage(client, transactionId, content) {
  if (client?.connected) {
    client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ transactionId, content }),
    });
  }
}
