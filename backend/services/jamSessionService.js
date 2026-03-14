const crypto = require('crypto');

const SESSION_TTL_MS = 1000 * 60 * 60 * 4;
const MEMBER_TTL_MS = 1000 * 60 * 5;
const sessions = new Map();

const cleanupSessions = () => {
  const now = Date.now();

  for (const [code, session] of sessions.entries()) {
    session.members = session.members.filter((member) => now - member.lastSeenAt < MEMBER_TTL_MS);

    if (!session.members.some((member) => member.id === session.hostMemberId)) {
      const nextHost = session.members[0];
      if (nextHost) {
        session.hostMemberId = nextHost.id;
      }
    }

    session.moderatorIds = session.moderatorIds.filter((id) => session.members.some((member) => member.id === id));
    session.chat = session.chat.slice(-60);
    session.reactions = session.reactions.filter((reaction) => now - reaction.createdAt < 15000);

    if (!session.members.length || now - session.updatedAt > SESSION_TTL_MS) {
      sessions.delete(code);
    }
  }
};

const generateCode = () => {
  let code = '';
  do {
    code = crypto.randomBytes(3).toString('hex').toUpperCase();
  } while (sessions.has(code));
  return code;
};

const buildMember = (displayName) => ({
  id: crypto.randomUUID(),
  name: (displayName || 'Guest').trim().slice(0, 32) || 'Guest',
  lastSeenAt: Date.now(),
});

const sanitizePlayback = (playback = {}) => ({
  song: playback.song || null,
  queue: Array.isArray(playback.queue) ? playback.queue : [],
  isPlaying: Boolean(playback.isPlaying),
  currentTime: Number.isFinite(playback.currentTime) ? Math.max(0, playback.currentTime) : 0,
  updatedAt: Date.now(),
});

const isModerator = (session, memberId) => session.hostMemberId === memberId || session.moderatorIds.includes(memberId);

const getVoteSummary = (session) => {
  const queue = Array.isArray(session.playback.queue) ? session.playback.queue : [];

  return queue.map((song) => {
    const voters = session.queueVotes[song.videoId] || [];
    return {
      videoId: song.videoId,
      votes: voters.length,
      voterIds: voters,
    };
  });
};

const buildResponse = (session, memberId) => ({
  code: session.code,
  hostMemberId: session.hostMemberId,
  isHost: session.hostMemberId === memberId,
  isModerator: isModerator(session, memberId),
  members: session.members.map((member) => ({
    id: member.id,
    name: member.name,
    isHost: member.id === session.hostMemberId,
    isModerator: session.hostMemberId === member.id || session.moderatorIds.includes(member.id),
  })),
  playback: session.playback,
  chat: session.chat,
  reactions: session.reactions,
  votes: getVoteSummary(session),
  updatedAt: session.updatedAt,
  serverTime: Date.now(),
});

const touchMember = (session, memberId) => {
  const member = session.members.find((entry) => entry.id === memberId);
  if (member) {
    member.lastSeenAt = Date.now();
  }
  return member;
};

const getSessionOrThrow = (code) => {
  cleanupSessions();
  const session = sessions.get(String(code || '').toUpperCase());
  if (!session) {
    const error = new Error('Jam session not found.');
    error.status = 404;
    throw error;
  }
  return session;
};

const createSession = ({ displayName, playback }) => {
  cleanupSessions();
  const host = buildMember(displayName);
  const code = generateCode();
  const session = {
    code,
    hostMemberId: host.id,
    members: [host],
    moderatorIds: [],
    playback: sanitizePlayback(playback),
    chat: [],
    reactions: [],
    queueVotes: {},
    updatedAt: Date.now(),
  };

  sessions.set(code, session);
  return { memberId: host.id, session: buildResponse(session, host.id) };
};

const joinSession = (code, { displayName }) => {
  const session = getSessionOrThrow(code);
  const member = buildMember(displayName);
  session.members.push(member);
  session.updatedAt = Date.now();
  return { memberId: member.id, session: buildResponse(session, member.id) };
};

const getSession = (code, memberId) => {
  const session = getSessionOrThrow(code);
  if (memberId && !touchMember(session, memberId)) {
    const error = new Error('You are no longer part of this jam session.');
    error.status = 403;
    throw error;
  }
  session.updatedAt = Date.now();
  return buildResponse(session, memberId);
};

const syncSessionPlayback = (code, { memberId, playback }) => {
  const session = getSessionOrThrow(code);
  const member = touchMember(session, memberId);
  if (!member) {
    const error = new Error('Join the jam session before syncing playback.');
    error.status = 403;
    throw error;
  }
  if (session.hostMemberId !== memberId) {
    const error = new Error('Only the host can control this jam session.');
    error.status = 403;
    throw error;
  }

  session.playback = sanitizePlayback(playback);
  session.updatedAt = Date.now();
  return buildResponse(session, memberId);
};

const leaveSession = (code, memberId) => {
  cleanupSessions();
  const session = sessions.get(String(code || '').toUpperCase());
  if (!session) return null;

  session.members = session.members.filter((member) => member.id !== memberId);
  session.moderatorIds = session.moderatorIds.filter((id) => id !== memberId);

  Object.keys(session.queueVotes).forEach((videoId) => {
    session.queueVotes[videoId] = session.queueVotes[videoId].filter((id) => id !== memberId);
  });

  if (!session.members.length) {
    sessions.delete(session.code);
    return null;
  }

  if (session.hostMemberId === memberId) {
    session.hostMemberId = session.members[0].id;
  }

  session.updatedAt = Date.now();
  return buildResponse(session, session.hostMemberId);
};

const addChatMessage = (code, { memberId, message }) => {
  const session = getSessionOrThrow(code);
  const member = touchMember(session, memberId);
  if (!member) {
    const error = new Error('Join the jam session before sending messages.');
    error.status = 403;
    throw error;
  }
  const trimmed = String(message || '').trim().slice(0, 240);
  if (!trimmed) {
    const error = new Error('Message cannot be empty.');
    error.status = 400;
    throw error;
  }
  session.chat.push({
    id: crypto.randomUUID(),
    memberId,
    memberName: member.name,
    message: trimmed,
    createdAt: Date.now(),
  });
  session.updatedAt = Date.now();
  return buildResponse(session, memberId);
};

const addReaction = (code, { memberId, emoji }) => {
  const session = getSessionOrThrow(code);
  const member = touchMember(session, memberId);
  if (!member) {
    const error = new Error('Join the jam session before reacting.');
    error.status = 403;
    throw error;
  }
  const value = String(emoji || '').trim().slice(0, 8);
  if (!value) {
    const error = new Error('Reaction is required.');
    error.status = 400;
    throw error;
  }
  session.reactions.push({
    id: crypto.randomUUID(),
    memberId,
    memberName: member.name,
    emoji: value,
    createdAt: Date.now(),
  });
  session.updatedAt = Date.now();
  return buildResponse(session, memberId);
};

const transferHost = (code, { memberId, targetMemberId }) => {
  const session = getSessionOrThrow(code);
  if (session.hostMemberId !== memberId) {
    const error = new Error('Only the host can transfer hosting.');
    error.status = 403;
    throw error;
  }
  if (!session.members.some((member) => member.id === targetMemberId)) {
    const error = new Error('Target member not found.');
    error.status = 404;
    throw error;
  }
  session.hostMemberId = targetMemberId;
  session.moderatorIds = session.moderatorIds.filter((id) => id !== targetMemberId);
  session.updatedAt = Date.now();
  return buildResponse(session, memberId);
};

const toggleModerator = (code, { memberId, targetMemberId }) => {
  const session = getSessionOrThrow(code);
  if (session.hostMemberId !== memberId) {
    const error = new Error('Only the host can manage moderators.');
    error.status = 403;
    throw error;
  }
  if (!session.members.some((member) => member.id === targetMemberId)) {
    const error = new Error('Target member not found.');
    error.status = 404;
    throw error;
  }
  if (session.hostMemberId === targetMemberId) {
    return buildResponse(session, memberId);
  }
  if (session.moderatorIds.includes(targetMemberId)) {
    session.moderatorIds = session.moderatorIds.filter((id) => id !== targetMemberId);
  } else {
    session.moderatorIds.push(targetMemberId);
  }
  session.updatedAt = Date.now();
  return buildResponse(session, memberId);
};

const voteQueueItem = (code, { memberId, videoId }) => {
  const session = getSessionOrThrow(code);
  const member = touchMember(session, memberId);
  if (!member) {
    const error = new Error('Join the jam session before voting.');
    error.status = 403;
    throw error;
  }
  if (!videoId) {
    const error = new Error('Queue item is required.');
    error.status = 400;
    throw error;
  }
  const current = session.queueVotes[videoId] || [];
  session.queueVotes[videoId] = current.includes(memberId)
    ? current.filter((id) => id !== memberId)
    : [...current, memberId];
  session.updatedAt = Date.now();
  return buildResponse(session, memberId);
};

module.exports = {
  createSession,
  joinSession,
  getSession,
  syncSessionPlayback,
  leaveSession,
  addChatMessage,
  addReaction,
  transferHost,
  toggleModerator,
  voteQueueItem,
  getSessionOrThrow,
  buildResponse,
};
