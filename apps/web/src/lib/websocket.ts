import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { resolveWsOrigin } from './api-base';

type ChatClientLifecycle = {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: () => void;
};

export type TransactionChatPayload = {
  id?: string | number;
  transactionId?: string | number;
  senderId?: string | number;
  senderName?: string;
  content?: string;
  createdAt?: string;
  [key: string]: unknown;
};

const wsOrigin = () => resolveWsOrigin();

export function createChatClient(
  token: string,
  transactionId: string,
  onMessage: (payload: TransactionChatPayload) => void,
  lifecycle: ChatClientLifecycle = {},
): Client {
  const client = new Client({
    webSocketFactory: () => new SockJS(`${wsOrigin()}/ws`),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    onConnect: () => {
      lifecycle.onConnect?.();
      client.subscribe(`/topic/transaction.${transactionId}`, (frame: IMessage) => {
        try {
          onMessage(JSON.parse(frame.body) as TransactionChatPayload);
        } catch {
          /* ignore malformed frame */
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

export function sendChatMessage(
  client: Client | null | undefined,
  transactionId: string,
  content: string,
) {
  if (client?.connected) {
    client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ transactionId, content }),
    });
  }
}
