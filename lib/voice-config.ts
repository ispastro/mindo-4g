/**
 * Voice Recording Configuration
 * 
 * Fine-tune these parameters based on user feedback and testing
 */

export const VOICE_CONFIG = {
  /**
   * Silence Detection Threshold (in decibels)
   * 
   * Range: -100 (very quiet) to 0 (very loud)
   * 
   * Recommendations:
   * - Quiet environments: -55 to -60 dB
   * - Normal environments: -50 dB (default)
   * - Noisy environments: -40 to -45 dB
   */
  SILENCE_THRESHOLD: -50,

  /**
   * Silence Duration (in milliseconds)
   * 
   * How long to wait after silence before auto-stopping
   * 
   * Recommendations:
   * - Fast speakers: 1500ms
   * - Normal pace: 2000ms (default)
   * - Slow/thoughtful speakers: 2500-3000ms
   */
  SILENCE_DURATION: 2000,

  /**
   * Minimum Recording Time (in milliseconds)
   * 
   * Prevents accidental stops from brief pauses
   * 
   * Recommendations:
   * - Quick commands: 300-500ms
   * - Normal speech: 500ms (default)
   * - Long sentences: 800-1000ms
   */
  MIN_RECORDING_TIME: 500,

  /**
   * Maximum Recording Time (in milliseconds)
   * 
   * Auto-stop after this duration regardless of speech
   * Prevents infinite recording if silence detection fails
   * 
   * Default: 30 seconds
   */
  MAX_RECORDING_TIME: 30000,

  /**
   * Audio Analysis Settings
   */
  AUDIO: {
    /**
     * FFT Size for frequency analysis
     * Must be power of 2 (256, 512, 1024, 2048, 4096, etc.)
     * 
     * Higher = more precise but slower
     * Lower = faster but less precise
     */
    FFT_SIZE: 2048,

    /**
     * Smoothing Time Constant (0-1)
     * 
     * Higher = smoother but slower response
     * Lower = more responsive but jittery
     */
    SMOOTHING: 0.8,
  },

  /**
   * Visual Feedback
   */
  UI: {
    /**
     * Volume bar update interval (ms)
     * Lower = smoother animation but more CPU
     */
    VOLUME_UPDATE_INTERVAL: 50,

    /**
     * Show countdown timer in last N seconds
     */
    SHOW_COUNTDOWN_AT: 5,
  },
} as const

/**
 * Preset configurations for different use cases
 */
export const VOICE_PRESETS = {
  // For users who speak quickly with short pauses
  FAST_SPEAKER: {
    SILENCE_THRESHOLD: -55,
    SILENCE_DURATION: 1500,
    MIN_RECORDING_TIME: 300,
  },

  // For users who speak slowly or think while speaking
  SLOW_SPEAKER: {
    SILENCE_THRESHOLD: -50,
    SILENCE_DURATION: 3000,
    MIN_RECORDING_TIME: 800,
  },

  // For noisy environments (cafes, offices, etc.)
  NOISY_ENVIRONMENT: {
    SILENCE_THRESHOLD: -40,
    SILENCE_DURATION: 2500,
    MIN_RECORDING_TIME: 500,
  },

  // For quiet environments (home, library, etc.)
  QUIET_ENVIRONMENT: {
    SILENCE_THRESHOLD: -60,
    SILENCE_DURATION: 1800,
    MIN_RECORDING_TIME: 400,
  },

  // Default balanced settings
  DEFAULT: {
    SILENCE_THRESHOLD: -50,
    SILENCE_DURATION: 2000,
    MIN_RECORDING_TIME: 500,
  },
} as const

/**
 * Get voice config with optional overrides
 */
export function getVoiceConfig(preset?: keyof typeof VOICE_PRESETS) {
  if (preset && VOICE_PRESETS[preset]) {
    return { ...VOICE_CONFIG, ...VOICE_PRESETS[preset] }
  }
  return VOICE_CONFIG
}
