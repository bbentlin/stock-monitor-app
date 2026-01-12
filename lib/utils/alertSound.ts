"use client";

let audioContext: AudioContext | null = null;

// Initiallize AudioContext (must be done after user interaction)
const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (err) {
      console.warn("Web Audio API not supported:", err);
      return null;
    }
  }

  // Resume if suspended (browsers require user interaction)
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
};

// Play a pleasant two-tone notification sound
export const playAlertSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // First tone (lower)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.frequency.value = 587.33; // D5
    osc1.type = "sine";

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second tone (higher) - delayed slightly
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.frequency.value = 880; // A5
    osc2.type = "sine";

    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);

    // Third tone (highest) - creates a pleasant chime effect
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();

    osc3.connect(gain3);
    gain3.connect(ctx.destination);

    osc3.frequency.value = 1174.66; // D6
    osc3.type = "sine";
    
    gain3.gain.setValueAtTime(0, now + 0.3);
    gain3.gain.linearRampToValueAtTime(0.25, now + 0.32);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    osc3.start(now + 0.3);
    osc3.stop(now + 0.7);

  } catch (err) {
    console.warn("Could not play alert sound:", err);
  }
};

// Play a simple click sound (for testing or UI feedback)
export const playClickSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 1000;
    osc.type = "sine";

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch (err) {
    console.warn("Could not play click sound:", err);
  }
};

//  Play an urgent/warning sound (multiple rapid beeps)
export const playUrgentSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Three rapid beeps
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.value = 880;
      osc.type = "square";

      const startTime = now + i * 0.15;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    }
  } catch (err) {
    console.warn("Could not play urgent sound:", err);
  }
};

// Initialize audio context on first user interaction
export const initAudioContext = () => {
  getAudioContext();
};