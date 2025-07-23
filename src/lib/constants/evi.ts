export const EVI_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_HUME_API_KEY!,
  configId: process.env.NEXT_PUBLIC_HUME_CONFIG_ID!,
  websocketUrl: "wss://api.hume.ai/v0/evi/chat",
} as const

export const AUDIO_CONFIG = {
  // Optimized settings for high-quality audio
  recordingTimeslice: 100, // 100ms chunks for smooth streaming
  playbackSampleRate: 24000, // High quality audio
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
} as const

export const CONNECTION_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  connectionTimeout: 10000,
  verboseTranscription: true, // Enable for faster interruption handling
} as const
