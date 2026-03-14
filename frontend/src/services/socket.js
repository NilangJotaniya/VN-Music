import { io } from 'socket.io-client';
import { getSocketBaseUrl } from './config';

let socket;

export const getSocket = () => {
  if (!socket) {
    const baseUrl = getSocketBaseUrl();
    socket = io(baseUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }

  return socket;
};
