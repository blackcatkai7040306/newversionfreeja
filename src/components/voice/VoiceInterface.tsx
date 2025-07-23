"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { HumeClient } from "hume"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { cn } from "@/lib/utils/cn"

interface VoiceInterfaceProps {
  className?: string
}

interface AudioQueueItem {
  blob: Blob
  timestamp: number
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ className }) => {
  // State management
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected")
  const [audioLevel, setAudioLevel] = useState(0)

  // Refs for audio handling
  const socketRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const audioQueueRef = useRef<AudioQueueItem[]>([])
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>(0)

  // Audio configuration for optimal quality
  const AUDIO_CONFIG = {
    recordingTimeslice: 100, // 100ms chunks for smooth streaming
    sampleRate: 44100, // High-quality audio
    echoCancellation: true, // Eliminate feedback
    noiseSuppression: true, // Clean audio input
    autoGainControl: true, // Consistent levels
  }

  // Convert blob to base64
  const convertBlobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1]) // Remove data URL prefix
      }
      reader.readAsDataURL(blob)
    })
  }, [])

  // Convert base64 to blob
  const convertBase64ToBlob = useCallback(
    (base64: string, mimeType: string = "audio/wav"): Blob => {
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      return new Blob([byteArray], { type: mimeType })
    },
    []
  )

  // Get supported MIME type for recording
  const getSupportedMimeType = useCallback((): string => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/wav",
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return "audio/webm" // fallback
  }, [])

  // Initialize audio stream with high-quality settings
  const initializeAudioStream = useCallback(async (): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: AUDIO_CONFIG.sampleRate,
          channelCount: 1,
          echoCancellation: AUDIO_CONFIG.echoCancellation,
          noiseSuppression: AUDIO_CONFIG.noiseSuppression,
          autoGainControl: AUDIO_CONFIG.autoGainControl,
        },
      })

      // Set up audio analysis for visual feedback
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      analyserRef.current.fftSize = 256

      return stream
    } catch (error) {
      console.error("Error accessing microphone:", error)
      throw error
    }
  }, [])

  // Audio level monitoring for visual feedback
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    const average =
      dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
    setAudioLevel(average / 255) // Normalize to 0-1

    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel)
  }, [])

  // Start recording with optimized settings
  const startRecording = useCallback(async () => {
    try {
      const stream = await initializeAudioStream()
      audioStreamRef.current = stream

      const mimeType = getSupportedMimeType()
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000, // High bitrate for quality
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size < 1 || !socketRef.current) return

        try {
          let audioData: Blob

          if (isMuted) {
            // Send silence when muted to maintain connection
            audioData = new Blob([new Uint8Array(event.data.size)], {
              type: mimeType,
            })
          } else {
            audioData = event.data
          }

          const base64Data = await convertBlobToBase64(audioData)

          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
              JSON.stringify({
                type: "audio_input",
                data: base64Data,
              })
            )
          }
        } catch (error) {
          console.error("Error processing audio data:", error)
        }
      }

      mediaRecorder.start(AUDIO_CONFIG.recordingTimeslice)
      setIsRecording(true)
      monitorAudioLevel()
    } catch (error) {
      console.error("Error starting recording:", error)
      setConnectionStatus("error")
    }
  }, [
    initializeAudioStream,
    getSupportedMimeType,
    convertBlobToBase64,
    isMuted,
    monitorAudioLevel,
  ])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop())
      audioStreamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    setIsRecording(false)
    setAudioLevel(0)
  }, [])

  // Play audio from queue with smooth transitions
  const playAudioFromQueue = useCallback(() => {
    if (audioQueueRef.current.length === 0 || isPlaying) return

    setIsPlaying(true)
    const audioItem = audioQueueRef.current.shift()
    if (!audioItem) {
      setIsPlaying(false)
      return
    }

    const audioUrl = URL.createObjectURL(audioItem.blob)
    const audio = new Audio(audioUrl)
    currentAudioRef.current = audio

    // Optimize audio playback
    audio.preload = "auto"
    audio.volume = 1.0

    audio.onloadeddata = () => {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error)
        setIsPlaying(false)
      })
    }

    audio.onended = () => {
      URL.revokeObjectURL(audioUrl)
      setIsPlaying(false)
      currentAudioRef.current = null

      // Play next item in queue
      if (audioQueueRef.current.length > 0) {
        setTimeout(playAudioFromQueue, 10) // Small delay for smooth transition
      }
    }

    audio.onerror = (error) => {
      console.error("Audio playback error:", error)
      URL.revokeObjectURL(audioUrl)
      setIsPlaying(false)
      currentAudioRef.current = null
    }
  }, [isPlaying])

  // Stop current audio and clear queue
  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    audioQueueRef.current = []
    setIsPlaying(false)
  }, [])

  // WebSocket connection with retry logic
  const connectToEVI = useCallback(async () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return

    setConnectionStatus("connecting")

    try {
      const apiKey =
        process.env.NEXT_PUBLIC_HUME_API_KEY ||
        "7jqO69xY0CDNAb7W3JLMantyRQCCACnQAkVwEGwAA9AKHtYI"
      const configId =
        process.env.NEXT_PUBLIC_HUME_CONFIG_ID ||
        "b0cc7c5a-5f9f-4ec9-94ee-71bdaafd147c"

      const wsUrl = `wss://api.hume.ai/v0/evi/chat?api_key=${encodeURIComponent(
        apiKey
      )}&config_id=${encodeURIComponent(configId)}&verbose_transcription=true`

      const socket = new WebSocket(wsUrl)
      socketRef.current = socket

      socket.onopen = () => {
        console.log("Connected to EVI")
        setIsConnected(true)
        setConnectionStatus("connected")
        startRecording()
      }

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          switch (message.type) {
            case "user_message":
              if (!message.interim) {
                setTranscript((prev) => [
                  ...prev,
                  `You: ${message.message.content}`,
                ])
              }
              stopAudio() // Stop EVI audio when user speaks
              break

            case "assistant_message":
              setTranscript((prev) => [
                ...prev,
                `EVI: ${message.message.content}`,
              ])
              break

            case "audio_output":
              const audioBlob = convertBase64ToBlob(message.data, "audio/wav")
              audioQueueRef.current.push({
                blob: audioBlob,
                timestamp: Date.now(),
              })

              // Start playing if not already playing
              if (!isPlaying) {
                playAudioFromQueue()
              }
              break

            case "user_interruption":
              stopAudio()
              break

            case "error":
              console.error("EVI Error:", message)
              setConnectionStatus("error")
              break
          }
        } catch (error) {
          console.error("Error parsing message:", error)
        }
      }

      socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        setConnectionStatus("error")
      }

      socket.onclose = () => {
        console.log("Disconnected from EVI")
        setIsConnected(false)
        setConnectionStatus("disconnected")
        stopRecording()
        stopAudio()
      }
    } catch (error) {
      console.error("Error connecting to EVI:", error)
      setConnectionStatus("error")
    }
  }, [
    startRecording,
    stopAudio,
    convertBase64ToBlob,
    playAudioFromQueue,
    isPlaying,
  ])

  // Disconnect from EVI
  const disconnectFromEVI = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
    stopRecording()
    stopAudio()
    setIsConnected(false)
    setConnectionStatus("disconnected")
  }, [stopRecording, stopAudio])

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript([])
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromEVI()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [disconnectFromEVI])

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* Connection Status */}
      <Card
        title="Voice Translation Interface"
        description="High-quality voice-to-voice translation powered by Hume's EVI"
      >
        <div className="flex flex-col space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  connectionStatus === "connected"
                    ? "bg-green-500"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500 animate-pulse"
                    : connectionStatus === "error"
                    ? "bg-red-500"
                    : "bg-gray-400"
                )}
              />
              <span className="text-sm font-medium">
                {connectionStatus === "connected"
                  ? "Connected"
                  : connectionStatus === "connecting"
                  ? "Connecting..."
                  : connectionStatus === "error"
                  ? "Connection Error"
                  : "Disconnected"}
              </span>
            </div>

            {/* Audio Level Indicator */}
            {isRecording && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">Audio Level:</span>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-100"
                    style={{ width: `${audioLevel * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-3">
            {!isConnected ? (
              <Button
                variant="primary"
                size="lg"
                onClick={connectToEVI}
                disabled={connectionStatus === "connecting"}
              >
                {connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Start Voice Translation"}
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={disconnectFromEVI}>
                  Disconnect
                </Button>
                <Button
                  variant={isMuted ? "outline" : "ghost"}
                  onClick={toggleMute}
                >
                  {isMuted ? "🔇 Unmute" : "🎤 Mute"}
                </Button>
                <Button variant="ghost" onClick={clearTranscript}>
                  Clear
                </Button>
              </>
            )}
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>Recording... {isMuted ? "(Muted)" : ""}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Transcript Display */}
      {transcript.length > 0 && (
        <Card
          title="Conversation Transcript"
          className="max-h-96 overflow-y-auto"
        >
          <div className="space-y-2">
            {transcript.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg text-sm",
                  message.startsWith("You:")
                    ? "bg-blue-50 border-l-4 border-blue-400"
                    : "bg-gray-50 border-l-4 border-gray-400"
                )}
              >
                {message}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Usage Instructions */}
      {!isConnected && (
        <Card
          title="How to Use"
          description="Follow these steps for the best voice translation experience"
        >
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">1.</span>
              <span>Click &quot;Start Voice Translation&quot; to begin</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">2.</span>
              <span>Allow microphone access when prompted</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">3.</span>
              <span>
                Speak naturally - the AI will respond with empathic voice
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">4.</span>
              <span>Use the mute button to temporarily pause input</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">5.</span>
              <span>The conversation transcript will appear below</span>
            </li>
          </ul>
        </Card>
      )}
    </div>
  )
}

export default VoiceInterface
