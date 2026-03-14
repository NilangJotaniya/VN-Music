import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
  if (!socket) {
    const baseUrl = process.env.REACT_APP_API_URL || window.location.origin;
    socket = io(baseUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }

  return socket;
};
