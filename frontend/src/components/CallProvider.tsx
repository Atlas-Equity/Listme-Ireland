'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Phone,
  PhoneOff,
  PhoneCall,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { createClient as createBrowserSupabase } from '@/utils/supabase/client';
import {
  playMessageChime,
  startRingtone,
  stopRingtone,
  playCallConnectedTone,
  playCallEndedTone,
} from '@/utils/callSounds';

export type CallStatus = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  conversationId?: string;
}

interface MessageToast {
  id: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  conversationId: string;
}

interface CallContextType {
  startCall: (targetUserId: string, targetUsername: string, targetAvatar?: string, conversationId?: string) => Promise<void>;
  endCall: () => void;
  callStatus: CallStatus;
  currentParticipant: CallParticipant | null;
}

const CallContext = createContext<CallContextType>({
  startCall: async () => {},
  endCall: () => {},
  callStatus: 'idle',
  currentParticipant: null,
});

export function useCall() {
  return useContext(CallContext);
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export function CallProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = useRef(createBrowserSupabase()).current;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('User');
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>('');

  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [currentParticipant, setCurrentParticipant] = useState<CallParticipant | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [messageToast, setMessageToast] = useState<MessageToast | null>(null);

  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const outgoingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Call session tracking & deduplication refs
  const isCallerRef = useRef<boolean>(false);
  const hasLoggedCallRef = useRef<boolean>(false);
  const callDurationRef = useRef<number>(0);
  const participantRef = useRef<CallParticipant | null>(null);
  const callStatusRef = useRef<CallStatus>('idle');

  const updateCallStatus = (status: CallStatus) => {
    callStatusRef.current = status;
    setCallStatus(status);
  };

  const updateParticipant = (participant: CallParticipant | null) => {
    participantRef.current = participant;
    setCurrentParticipant(participant);
  };

  // 1. Load authenticated user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
        setCurrentUserName(user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
        setCurrentUserAvatar(user.user_metadata?.avatar_url || '');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setCurrentUserId(session.user.id);
        setCurrentUserName(session.user.user_metadata?.username || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User');
        setCurrentUserAvatar(session.user.user_metadata?.avatar_url || '');
      } else {
        setCurrentUserId(null);
      }
    });

    // Request browser notification permission on mount if supported
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Clean up WebRTC tracks and timers
  const cleanupMedia = useCallback(() => {
    stopRingtone();
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (outgoingTimeoutRef.current) {
      clearTimeout(outgoingTimeoutRef.current);
      outgoingTimeoutRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    pendingCandidatesRef.current = [];
    setCallDuration(0);
    callDurationRef.current = 0;
    setIsMuted(false);
  }, []);

  // Post call log event to conversation chat feed (Snapchat/WhatsApp style)
  const logCallToChat = useCallback(
    async (status: 'completed' | 'missed' | 'declined', duration: number) => {
      // Only the caller records the call event to prevent duplicates
      if (!isCallerRef.current || hasLoggedCallRef.current) return;
      hasLoggedCallRef.current = true;

      const participant = participantRef.current;
      if (!participant) return;

      const convId = participant.conversationId;
      const participantId = participant.id;
      if (!convId && !participantId) return;

      const payloadContent = `CALL_LOG:${JSON.stringify({
        status,
        duration: Math.max(0, Math.floor(duration)),
        timestamp: new Date().toISOString(),
      })}`;

      try {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: convId || undefined,
            recipientId: participantId,
            content: payloadContent,
          }),
        });
      } catch (err) {
        console.error('Failed to log call event to chat:', err);
      }
    },
    []
  );

  // End Call handler
  const endCall = useCallback(() => {
    const participant = participantRef.current || currentParticipant;
    if (participant && currentUserId) {
      // Send hangup event to other user
      const targetChannel = supabase.channel(`user_call_signals_${participant.id}`);
      targetChannel.send({
        type: 'broadcast',
        event: 'call_signal',
        payload: {
          type: 'hangup',
          senderId: currentUserId,
        },
      });
    }

    if (callStatusRef.current === 'calling') {
      logCallToChat('missed', 0);
    } else if (callStatusRef.current === 'connected') {
      logCallToChat('completed', callDurationRef.current);
    }

    playCallEndedTone();
    cleanupMedia();
    updateCallStatus('ended');
    setTimeout(() => {
      updateCallStatus('idle');
      updateParticipant(null);
    }, 1200);
  }, [currentParticipant, currentUserId, cleanupMedia, logCallToChat, supabase]);

  // Handle incoming call signal
  const handleSignal = useCallback(
    async (payload: any) => {
      if (!currentUserId) return;

      // Ignore signals from self
      if (payload.senderId === currentUserId) return;

      switch (payload.type) {
        case 'offer': {
          // If already in a call, send busy signal
          if (callStatusRef.current !== 'idle') {
            const replyChannel = supabase.channel(`user_call_signals_${payload.callerId}`);
            replyChannel.send({
              type: 'broadcast',
              event: 'call_signal',
              payload: { type: 'busy', senderId: currentUserId },
            });
            return;
          }

          isCallerRef.current = false;
          hasLoggedCallRef.current = false;
          callDurationRef.current = 0;

          const callerParticipant: CallParticipant = {
            id: payload.callerId,
            name: payload.callerName,
            avatar: payload.callerAvatar,
            conversationId: payload.conversationId,
          };
          updateParticipant(callerParticipant);

          // Store offer payload for when user clicks Accept
          (window as any).__pendingCallOffer = payload.sdp;
          updateCallStatus('incoming');
          startRingtone();

          // Also trigger browser push notification if permitted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`Incoming Call from ${payload.callerName}`, {
                body: `${payload.callerName} is calling you on ListMe. Click to view.`,
                icon: payload.callerAvatar || '/clover-logo.png',
              });
            } catch (e) {}
          }
          break;
        }

        case 'answer': {
          if (peerConnectionRef.current && callStatusRef.current === 'calling') {
            stopRingtone();
            if (outgoingTimeoutRef.current) {
              clearTimeout(outgoingTimeoutRef.current);
              outgoingTimeoutRef.current = null;
            }

            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
            
            // Process any queued candidates
            while (pendingCandidatesRef.current.length > 0) {
              const candidate = pendingCandidatesRef.current.shift();
              if (candidate) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
              }
            }

            playCallConnectedTone();
            updateCallStatus('connected');

            // Start duration timer
            durationTimerRef.current = setInterval(() => {
              setCallDuration((prev) => {
                const next = prev + 1;
                callDurationRef.current = next;
                return next;
              });
            }, 1000);
          }
          break;
        }

        case 'candidate': {
          if (payload.candidate) {
            if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
              try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
              } catch (err) {
                console.warn('Error adding ICE candidate:', err);
              }
            } else {
              pendingCandidatesRef.current.push(payload.candidate);
            }
          }
          break;
        }

        case 'decline': {
          logCallToChat('declined', 0);
          stopRingtone();
          playCallEndedTone();
          cleanupMedia();
          updateCallStatus('ended');
          setTimeout(() => {
            updateCallStatus('idle');
            updateParticipant(null);
          }, 1500);
          break;
        }

        case 'busy': {
          logCallToChat('declined', 0);
          stopRingtone();
          playCallEndedTone();
          cleanupMedia();
          updateCallStatus('ended');
          setTimeout(() => {
            updateCallStatus('idle');
            updateParticipant(null);
          }, 1500);
          break;
        }

        case 'hangup': {
          if (callStatusRef.current === 'connected') {
            logCallToChat('completed', callDurationRef.current);
          }
          playCallEndedTone();
          cleanupMedia();
          updateCallStatus('ended');
          setTimeout(() => {
            updateCallStatus('idle');
            updateParticipant(null);
          }, 1200);
          break;
        }
      }
    },
    [currentUserId, cleanupMedia, logCallToChat, supabase]
  );

  // Accept incoming call
  const acceptCall = async () => {
    stopRingtone();
    const participant = participantRef.current || currentParticipant;
    if (!participant || !currentUserId) return;

    try {
      const sdpOffer = (window as any).__pendingCallOffer;
      if (!sdpOffer) {
        endCall();
        return;
      }

      // 1. Get microphone audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // 2. Initialize RTCPeerConnection
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote audio stream
      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && participantRef.current) {
          const targetChannel = supabase.channel(`user_call_signals_${participantRef.current.id}`);
          targetChannel.send({
            type: 'broadcast',
            event: 'call_signal',
            payload: {
              type: 'candidate',
              candidate: event.candidate,
              senderId: currentUserId,
            },
          });
        }
      };

      // 3. Set remote description from caller's offer
      await pc.setRemoteDescription(new RTCSessionDescription(sdpOffer));

      // 4. Create and set local answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // 5. Send answer to caller
      const targetChannel = supabase.channel(`user_call_signals_${participant.id}`);
      targetChannel.send({
        type: 'broadcast',
        event: 'call_signal',
        payload: {
          type: 'answer',
          sdp: answer,
          senderId: currentUserId,
        },
      });

      playCallConnectedTone();
      updateCallStatus('connected');

      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => {
          const next = prev + 1;
          callDurationRef.current = next;
          return next;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Error accepting call:', err);
      alert('Could not access microphone: ' + (err?.message || 'Please check microphone permissions.'));
      endCall();
    }
  };

  // Decline incoming call
  const declineCall = () => {
    stopRingtone();
    const participant = participantRef.current || currentParticipant;
    if (participant && currentUserId) {
      const targetChannel = supabase.channel(`user_call_signals_${participant.id}`);
      targetChannel.send({
        type: 'broadcast',
        event: 'call_signal',
        payload: {
          type: 'decline',
          senderId: currentUserId,
        },
      });
    }

    cleanupMedia();
    updateCallStatus('idle');
    updateParticipant(null);
  };

  // Start outgoing call
  const startCall = async (
    targetUserId: string,
    targetUsername: string,
    targetAvatar?: string,
    conversationId?: string
  ) => {
    if (!currentUserId) {
      alert('Please log in to make calls.');
      return;
    }

    if (targetUserId === currentUserId) {
      alert('You cannot call yourself.');
      return;
    }

    cleanupMedia();

    isCallerRef.current = true;
    hasLoggedCallRef.current = false;
    callDurationRef.current = 0;

    try {
      const targetParticipant: CallParticipant = {
        id: targetUserId,
        name: targetUsername,
        avatar: targetAvatar,
        conversationId,
      };
      updateParticipant(targetParticipant);
      updateCallStatus('calling');

      // 1. Get microphone audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // 2. Initialize RTCPeerConnection
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local audio track
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote audio stream
      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const targetChannel = supabase.channel(`user_call_signals_${targetUserId}`);
          targetChannel.send({
            type: 'broadcast',
            event: 'call_signal',
            payload: {
              type: 'candidate',
              candidate: event.candidate,
              senderId: currentUserId,
            },
          });
        }
      };

      // 3. Create SDP Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 4. Send offer to recipient
      const targetChannel = supabase.channel(`user_call_signals_${targetUserId}`);
      await targetChannel.send({
        type: 'broadcast',
        event: 'call_signal',
        payload: {
          type: 'offer',
          callerId: currentUserId,
          callerName: currentUserName,
          callerAvatar: currentUserAvatar,
          sdp: offer,
          conversationId,
          senderId: currentUserId,
        },
      });

      // Ringing timeout (30 seconds no answer)
      outgoingTimeoutRef.current = setTimeout(() => {
        if (callStatusRef.current === 'calling') {
          logCallToChat('missed', 0);
          endCall();
        }
      }, 30000);
    } catch (err: any) {
      console.error('Error starting call:', err);
      alert('Could not start call: ' + (err?.message || 'Check microphone access.'));
      cleanupMedia();
      updateCallStatus('idle');
      updateParticipant(null);
    }
  };

  // Toggle microphone mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks[0].enabled = nextState;
        setIsMuted(!nextState);
      }
    }
  };

  // Toggle speaker mute
  const toggleSpeaker = () => {
    if (remoteAudioRef.current) {
      const nextMuted = !remoteAudioRef.current.muted;
      remoteAudioRef.current.muted = nextMuted;
      setIsSpeakerMuted(nextMuted);
    }
  };

  // Subscribe to personal call signaling channel & message notifications
  useEffect(() => {
    if (!currentUserId) return;

    // Listen for call signals on personal channel
    const callChannel = supabase
      .channel(`user_call_signals_${currentUserId}`)
      .on('broadcast', { event: 'call_signal' }, ({ payload }) => {
        handleSignal(payload);
      })
      .subscribe();

    // Listen for incoming messages across the site
    const messagesChannel = supabase
      .channel(`global_message_notifications_${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const msg = payload.new as any;
          if (msg.sender_id === currentUserId) return;

          // Fetch sender username & check if user is a participant
          try {
            const { data: conv } = await supabase
              .from('conversations')
              .select('buyer_id, seller_id')
              .eq('id', msg.conversation_id)
              .single();

            if (!conv) return;
            // Only notify if current user is the buyer or seller
            if (conv.buyer_id !== currentUserId && conv.seller_id !== currentUserId) return;

            // Fetch sender username
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', msg.sender_id)
              .single();

            const senderName = senderProfile?.username || 'A ListMe user';

            const rawContent = msg.content || '';
            let displayContent = rawContent;
            if (rawContent.startsWith('CALL_LOG:')) {
              try {
                const data = JSON.parse(rawContent.slice(9));
                if (data.status === 'missed') {
                  displayContent = 'Missed voice call';
                } else if (data.status === 'declined') {
                  displayContent = 'Call declined';
                } else {
                  const mins = Math.floor((data.duration || 0) / 60);
                  const secs = (data.duration || 0) % 60;
                  const dur = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                  displayContent = `Voice call ended (${dur})`;
                }
              } catch {
                displayContent = 'Voice call';
              }
            }

            // Play message sound chime!
            playMessageChime();

            // Display in-app toast notification
            setMessageToast({
              id: msg.id,
              senderName,
              content: displayContent,
              conversationId: msg.conversation_id,
            });

            // Browser notification if in background
            if (
              typeof window !== 'undefined' &&
              document.hidden &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification(`New message from ${senderName}`, {
                body: displayContent,
                icon: '/clover-logo.png',
              });
            }
          } catch (e) {
            console.warn('Error displaying message notification:', e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(callChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [currentUserId, handleSignal, supabase]);

  // Auto-dismiss message toast after 5s
  useEffect(() => {
    if (!messageToast) return;
    const timer = setTimeout(() => {
      setMessageToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [messageToast]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const participantInitials = currentParticipant?.name
    ? currentParticipant.name.substring(0, 2).toUpperCase()
    : 'U';

  return (
    <CallContext.Provider
      value={{
        startCall,
        endCall,
        callStatus,
        currentParticipant,
      }}
    >
      {children}

      {/* Hidden audio element for receiving remote peer audio */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {/* ================= IN-APP MESSAGE NOTIFICATION TOAST ================= */}
      {messageToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 flex items-start gap-3 backdrop-blur-md">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
              <MessageSquare className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                  {messageToast.senderName}
                </span>
                <span className="text-[10px] text-primary font-medium">Just now</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5">
                {messageToast.content}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => {
                    setMessageToast(null);
                    router.push(`/messages?conversationId=${messageToast.conversationId}`);
                  }}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Reply <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setMessageToast(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= INCOMING CALL MODAL ================= */}
      {callStatus === 'incoming' && currentParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
            {/* Pulsing visual circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full animate-ping pointer-events-none" />

            <div className="relative mb-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden relative border-4 border-primary/30 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shadow-xl mb-4">
                {currentParticipant.avatar ? (
                  <Image
                    src={currentParticipant.avatar}
                    alt={currentParticipant.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary dark:text-green-400">
                    {participantInitials}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentParticipant.name}
              </h3>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Incoming Voice Call
              </p>
            </div>

            {/* Accept / Decline Action Buttons */}
            <div className="flex items-center justify-center gap-6 relative">
              {/* Decline Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={declineCall}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                  title="Decline Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Decline</span>
              </div>

              {/* Accept Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={acceptCall}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 animate-bounce"
                  title="Accept Call"
                >
                  <Phone className="w-7 h-7" />
                </button>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">Accept</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ACTIVE / OUTGOING CALL MODAL ================= */}
      {(callStatus === 'calling' || callStatus === 'connected' || callStatus === 'ended') && currentParticipant && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 rounded-3xl p-5 shadow-2xl w-80 sm:w-88 flex flex-col items-center backdrop-blur-xl">
            {/* Header info */}
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                Voice Call
              </span>
              <span className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">
                {callStatus === 'connected' ? formatTimer(callDuration) : callStatus === 'calling' ? 'Ringing...' : 'Call Ended'}
              </span>
            </div>

            {/* Avatar & status */}
            <div className="flex flex-col items-center mb-6">
              <div className={`w-20 h-20 rounded-full overflow-hidden relative border-2 border-primary/40 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shadow-lg mb-3 ${
                callStatus === 'calling' ? 'animate-pulse' : ''
              }`}>
                {currentParticipant.avatar ? (
                  <Image
                    src={currentParticipant.avatar}
                    alt={currentParticipant.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary dark:text-green-400">
                    {participantInitials}
                  </span>
                )}
              </div>

              <h4 className="font-bold text-base text-gray-900 dark:text-white">
                {currentParticipant.name}
              </h4>

              {callStatus === 'connected' && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                  {/* Waveform graphic */}
                  <span className="inline-block w-1 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="inline-block w-1 h-4 bg-green-500 rounded-full animate-pulse delay-75" />
                  <span className="inline-block w-1 h-2 bg-green-500 rounded-full animate-pulse delay-150" />
                  <span>Connected</span>
                </div>
              )}

              {callStatus === 'calling' && (
                <p className="text-xs text-amber-500 font-medium mt-1 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-500" /> Calling on ListMe...
                </p>
              )}

              {callStatus === 'ended' && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  Call Disconnected
                </p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 w-full pt-3 border-t border-gray-100 dark:border-zinc-800">
              {/* Mute button */}
              <button
                type="button"
                disabled={callStatus !== 'connected'}
                onClick={toggleMute}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                  isMuted
                    ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                } disabled:opacity-40`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Speaker Mute button */}
              <button
                type="button"
                disabled={callStatus !== 'connected'}
                onClick={toggleSpeaker}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                  isSpeakerMuted
                    ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                } disabled:opacity-40`}
                title={isSpeakerMuted ? 'Unmute speaker' : 'Mute speaker'}
              >
                {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Hang up button */}
              <button
                type="button"
                onClick={endCall}
                className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </CallContext.Provider>
  );
}
