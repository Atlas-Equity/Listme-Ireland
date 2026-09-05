// Web Audio API sound synthesizer for call ringtones and message chimes
// Works across all browsers with zero external audio assets or network latency

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  } catch (e) {
    console.warn('AudioContext not available:', e);
    return null;
  }
}

/**
 * Plays a pleasant double chime for new incoming messages.
 */
export function playMessageChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // First bell tone (F5 - 698.46 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second bell tone (A5 - 880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.14, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.warn('Error playing message chime:', e);
  }
}

/**
 * Ringtone loop management for incoming calls.
 */
let ringtoneInterval: NodeJS.Timeout | null = null;
let ringtoneActive = false;

function playSingleRingBurst(ctx: AudioContext) {
  try {
    const now = ctx.currentTime;
    
    // Dual-tone US/European telephone standard: 440Hz + 480Hz
    [440, 480].forEach((freq) => {
      // First pulse
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.setValueAtTime(0.08, now + 0.4);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Second pulse
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq, now + 0.55);
      gain2.gain.setValueAtTime(0.08, now + 0.55);
      gain2.gain.setValueAtTime(0.08, now + 0.95);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.55);
      osc2.stop(now + 1.0);
    });
  } catch (e) {
    console.warn('Error playing ring burst:', e);
  }
}

export function startRingtone() {
  if (ringtoneActive) return;
  ringtoneActive = true;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Play immediately
  playSingleRingBurst(ctx);

  // Repeat every 3 seconds
  ringtoneInterval = setInterval(() => {
    if (!ringtoneActive) {
      if (ringtoneInterval) clearInterval(ringtoneInterval);
      return;
    }
    const currentCtx = getAudioContext();
    if (currentCtx) playSingleRingBurst(currentCtx);
  }, 3000);
}

export function stopRingtone() {
  ringtoneActive = false;
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}

/**
 * Gentle tone played when call connects.
 */
export function playCallConnectedTone() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {
    console.warn('Error playing call connected tone:', e);
  }
}

/**
 * Short descending chime when call ends.
 */
export function playCallEndedTone() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440.0, now); // A4
    osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.2); // E4
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.warn('Error playing call ended tone:', e);
  }
}
