import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Copy, Link as LinkIcon, LogOut, MessageCircle, PlayCircle, Radio, Shield, ThumbsUp, Users,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useJamSession } from '../context/JamContext';
import { usePlayer } from '../context/PlayerContext';

const reactionOptions = ['🔥', '❤️', '👏', '🎶', '⚡'];

export default function JamSession() {
  const [searchParams] = useSearchParams();
  const {
    session,
    loading,
    inviteLink,
    createSession,
    joinSession,
    leaveSession,
    canControlPlayback,
    sendMessage,
    sendReaction,
    toggleVote,
    transferHost,
    toggleModerator,
  } = useJamSession();
  const { currentSong } = usePlayer();
  const [codeInput, setCodeInput] = useState(searchParams.get('code') || '');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (code && !session?.code) {
      joinSession(code);
    }
  }, [joinSession, searchParams, session?.code]);

  const host = useMemo(() => session?.members?.find((member) => member.isHost), [session]);
  const voteMap = useMemo(
    () => Object.fromEntries((session?.votes || []).map((vote) => [vote.videoId, vote])),
    [session?.votes]
  );

  const copyText = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {}
  };

  return (
    <div className="min-h-full pb-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8">
        <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-vn-muted">Listen Together</p>
              <h1 className="max-w-2xl text-[1.9rem] font-bold leading-tight tracking-[-0.03em] text-vn-text">Real-time jam sessions for synced listening with friends.</h1>
              <p className="mt-3 max-w-2xl text-sm text-vn-muted">
                Live playback, instant reactions, group chat, invite links, host transfer, moderator controls, and queue voting.
              </p>
            </div>
            <div className="rounded-3xl border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.3em] text-purple-300">Current source</p>
              <p className="mt-2 text-sm text-vn-text">{currentSong ? currentSong.title : 'Select a song, then go live'}</p>
            </div>
          </div>
        </section>

        {!session ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[28px] border border-white/8 bg-[#111118] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-[#7c3aed]/15 p-3 text-purple-300">
                  <Radio size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-vn-text">Create a live room</h2>
                  <p className="text-sm text-vn-muted">Use your current player state as the starting track.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={createSession}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                <PlayCircle size={16} />
                {loading ? 'Creating...' : 'Start Jam Session'}
              </button>
            </section>

            <section className="rounded-[28px] border border-white/8 bg-[#111118] p-6">
              <h2 className="text-lg font-bold text-vn-text">Join with a code or link</h2>
              <p className="mt-2 text-sm text-vn-muted">Paste the room code or open a shared invite link.</p>
              <div className="mt-5 flex gap-3">
                <input
                  value={codeInput}
                  onChange={(event) => setCodeInput(event.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-vn-text outline-none transition focus:border-[#7c3aed]"
                />
                <button
                  type="button"
                  onClick={() => joinSession(codeInput)}
                  disabled={loading || codeInput.trim().length < 6}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-vn-text transition hover:border-[#7c3aed]/50 hover:text-purple-300 disabled:opacity-50"
                >
                  Join
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6">
              <section className="rounded-[28px] border border-white/8 bg-[#111118] p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-vn-muted">Room Code</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[2rem] font-bold tracking-[0.18em] text-vn-text">{session.code}</span>
                      <button type="button" onClick={() => copyText(session.code)} className="rounded-xl border border-white/10 p-2 text-vn-muted transition hover:border-[#7c3aed]/40 hover:text-purple-300">
                        <Copy size={16} />
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-vn-muted">
                      {session.isHost ? 'You are hosting this jam.' : `${host?.name || 'Host'} is controlling playback.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={leaveSession}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-400/20 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
                  >
                    <LogOut size={15} />
                    Leave Session
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => copyText(inviteLink)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2.5 text-sm text-vn-text transition hover:border-[#7c3aed]/40">
                    <LinkIcon size={15} />
                    Copy invite link
                  </button>
                  {reactionOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => sendReaction(emoji)}
                      className="rounded-2xl border border-white/10 px-3 py-2 text-lg transition hover:border-[#7c3aed]/40"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {session.reactions?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {session.reactions.slice(-10).map((reaction) => (
                      <span key={reaction.id} className="rounded-full bg-white/[0.04] px-3 py-1.5 text-sm text-vn-text">
                        {reaction.emoji} {reaction.memberName}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-vn-muted">Live Playback</p>
                  <h3 className="mt-3 text-lg font-bold text-vn-text">
                    {session.playback?.song?.title || 'Waiting for the first song'}
                  </h3>
                  <p className="mt-1 text-sm text-vn-muted">
                    {session.playback?.song?.channelName || 'Once the host plays something, everyone will sync here.'}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full border border-white/10 px-3 py-1.5 text-vn-text">
                      {session.playback?.isPlaying ? 'Playing now' : 'Paused'}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1.5 text-vn-text">
                      {Math.floor(session.playback?.currentTime || 0)}s synced
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1.5 text-vn-text">
                      {canControlPlayback ? 'Host controls enabled' : 'Listener mode'}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/8 bg-[#111118] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                    <ThumbsUp size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-vn-text">Collaborative Queue Votes</h2>
                    <p className="text-sm text-vn-muted">Listeners can vote the current queue up or down.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {(session.playback?.queue || []).slice(0, 6).map((song) => {
                    const voteEntry = voteMap[song.videoId];
                    const votes = voteEntry?.votes || 0;
                    const voted = voteEntry?.voterIds?.includes(session.memberId);

                    return (
                      <div key={song.videoId} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                        <img src={song.thumbnail} alt={song.title} className="h-11 w-11 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-vn-text">{song.title}</p>
                          <p className="truncate text-xs text-vn-muted">{song.channelName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleVote(song.videoId)}
                          className={`rounded-xl px-3 py-2 text-sm transition ${voted ? 'bg-[#7c3aed] text-white' : 'border border-white/10 text-vn-text'}`}
                        >
                          {votes} vote{votes === 1 ? '' : 's'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            </section>

            <section className="space-y-6">
              <section className="rounded-[28px] border border-white/8 bg-[#111118] p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-vn-text">People in the room</h2>
                    <p className="text-sm text-vn-muted">{session.members.length} connected listeners</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {session.members.map((member) => (
                    <div key={member.id} className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-vn-text">{member.name}</p>
                          <p className="text-xs text-vn-muted">
                            {member.isHost ? 'Host' : member.isModerator ? 'Moderator' : 'Listener'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {member.isHost ? <span className="rounded-full bg-[#7c3aed]/15 px-3 py-1 text-xs font-semibold text-purple-300">Host</span> : null}
                          {member.isModerator && !member.isHost ? <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">Mod</span> : null}
                        </div>
                      </div>

                      {session.isHost && !member.isHost ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" onClick={() => transferHost(member.id)} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-vn-text transition hover:border-[#7c3aed]/40">
                            Transfer host
                          </button>
                          <button type="button" onClick={() => toggleModerator(member.id)} className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs text-vn-text transition hover:border-cyan-400/40">
                            <Shield size={12} />
                            {member.isModerator ? 'Remove mod' : 'Make mod'}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/8 bg-[#111118] p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-[#7c3aed]/15 p-3 text-purple-300">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-vn-text">Room Chat</h2>
                    <p className="text-sm text-vn-muted">Real-time messages for everyone in the jam.</p>
                  </div>
                </div>
                <div className="mb-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                  {(session.chat || []).length ? (
                    session.chat.map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-vn-muted">{entry.memberName}</p>
                        <p className="mt-2 text-sm text-vn-text">{entry.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/8 px-4 py-5 text-sm text-vn-muted">
                      No chat messages yet.
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Send a message to the room"
                    className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-vn-text outline-none transition focus:border-[#7c3aed]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      sendMessage(message);
                      setMessage('');
                    }}
                    className="rounded-2xl bg-[#7c3aed] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Send
                  </button>
                </div>
              </section>
            </section>
          </div>
        )}
      </motion.div>
    </div>
  );
}
