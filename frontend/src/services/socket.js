import { io } from 'socket.io-client';
import { getSocketBaseUrl } from './config';

let socket;

export const getSocket = () => {
  if (!socket) {
    const baseUrl = getSocketBaseUrl();
    socket = io(baseUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }

  return socket;
};
