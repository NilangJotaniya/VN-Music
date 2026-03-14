const { Server } = require('socket.io');
const jamSessionService = require('../services/jamSessionService');

const roomName = (code) => `jam:${String(code || '').toUpperCase()}`;

const emitSession = (io, code, session) => {
  io.to(roomName(code)).emit('jam:session', { session });
};

const emitError = (socket, error) => {
  socket.emit('jam:error', { message: error.message || 'Jam session error.' });
};

const clearSocketRoom = (socket) => {
  const activeCode = socket.data?.jamCode;
  if (activeCode) {
    socket.leave(roomName(activeCode));
  }
  socket.data.jamCode = null;
  socket.data.memberId = null;
};

const initializeJamSocket = (server, allowedOrigins) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`Origin not allowed by CORS: ${origin}`));
      },
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('jam:subscribe', ({ code, memberId }) => {
      try {
        const session = jamSessionService.getSession(code, memberId);
        clearSocketRoom(socket);
        socket.join(roomName(code));
        socket.data.jamCode = session.code;
        socket.data.memberId = memberId;
        socket.emit('jam:session', { session });
        emitSession(io, code, session);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('jam:unsubscribe', () => {
      clearSocketRoom(socket);
    });

    socket.on('jam:sync', ({ code, memberId, playback }) => {
      try {
        const session = jamSessionService.syncSessionPlayback(code, { memberId, playback });
        emitSession(io, code, session);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('jam:chat', ({ code, memberId, message }) => {
      try {
        const session = jamSessionService.addChatMessage(code, { memberId, message });
        emitSession(io, code, session);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('jam:reaction', ({ code, memberId, emoji }) => {
      try {
        const session = jamSessionService.addReaction(code, { memberId, emoji });
        emitSession(io, code, session);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('jam:vote', ({ code, memberId, videoId }) => {
      try {
        const session = jamSessionService.voteQueueItem(code, { memberId, videoId });
        emitSession(io, code, session);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('jam:transfer-host', ({ code, memberId, targetMemberId }) => {
      try {
        const session = jamSessionService.transferHost(code, { memberId, targetMemberId });
        emitSession(io, code, session);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('jam:toggle-moderator', ({ code, memberId, targetMemberId }) => {
      try {
        const session = jamSessionService.toggleModerator(code, { memberId, targetMemberId });
        emitSession(io, code, session);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on('disconnect', () => {
      clearSocketRoom(socket);
    });
  });

  return io;
};

module.exports = { initializeJamSocket };
