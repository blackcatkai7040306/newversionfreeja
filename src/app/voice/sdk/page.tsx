"use client"

import { useState, useEffect, useRef } from "react"
import { Hume } from "hume"
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from "lucide-react"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"

interface Message {
  type: string
  message?: {
    content?: string
  }
  data?: string
}

export default function VoiceSDKPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [transcript, setTranscript] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected")

  // Audio quality optimization refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioQueueRef = useRef<Blob[]>([])
  const isPlayingRef = useRef(false)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  // Environment variables
  const apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY
  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  // Convert base64 to blob for audio playback
  const convertBase64ToBlob = (base64Data: string): Blob => {
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: "audio/wav" })
  }

  // Convert blob to base64
  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result.split(",")[1]) // Remove data:audio/wav;base64, prefix
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // Play audio from queue with smooth playback
  const playAudio = () => {
    if (
      audioQueueRef.current.length === 0 ||
      isPlayingRef.current ||
      !audioEnabled
    )
      return

    isPlayingRef.current = true
    const audioBlob = audioQueueRef.current.shift()
    if (!audioBlob) {
      isPlayingRef.current = false
      return
    }

    const audioUrl = URL.createObjectURL(audioBlob)
    currentAudioRef.current = new Audio(audioUrl)

    currentAudioRef.current.onended = () => {
      isPlayingRef.current = false
      URL.revokeObjectURL(audioUrl)
      if (audioQueueRef.current.length > 0) {
        playAudio()
      }
    }

    currentAudioRef.current.onerror = () => {
      console.error("Audio playback error")
      isPlayingRef.current = false
      URL.revokeObjectURL(audioUrl)
    }

    currentAudioRef.current.play().catch((error) => {
      console.error("Audio play failed:", error)
      isPlayingRef.current = false
      URL.revokeObjectURL(audioUrl)
    })
  }

  // Stop current audio and clear queue
  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    isPlayingRef.current = false
    audioQueueRef.current.length = 0 // Clear queue
  }

  // Handle WebSocket messages
  const handleMessage = (message: Message) => {
    console.log("Received message:", message)

    switch (message.type) {
      case "user_message":
      case "assistant_message":
        const content = message.message?.content
        if (content) {
          const speaker = message.type === "user_message" ? "You" : "AI"
          setTranscript((prev) => [...prev, `${speaker}: ${content}`])
        }
        break

      case "audio_output":
        const audioData = message.data
        if (audioData && audioEnabled) {
          const audioBlob = convertBase64ToBlob(audioData)
          audioQueueRef.current.push(audioBlob)
          if (audioQueueRef.current.length >= 1) {
            playAudio()
          }
        }
        break

      case "user_interruption":
      case "user_message":
        // Stop current audio on interruption
        stopAudio()
        break

      case "error":
        console.error("EVI Error:", message)
        setConnectionStatus("error")
        break
    }
  }

  // Setup high-quality audio stream
  const setupAudioStream = async (): Promise<MediaStream> => {
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
        channelCount: 1,
        latency: 0.01, // Low latency for real-time interaction
      },
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    // Initialize Web Audio API for better control
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)()
      gainNodeRef.current = audioContextRef.current.createGain()
      gainNodeRef.current.connect(audioContextRef.current.destination)
    }

    return stream
  }

  // Start recording with optimal settings
  const startRecording = (stream: MediaStream) => {
    const mimeType = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/wav"

    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: 128000, // High quality
    })

    mediaRecorderRef.current.ondataavailable = async (event) => {
      if (event.data.size < 1 || !socketRef.current) return

      let audioData: Blob

      if (isMuted) {
        // Send silence when muted
        audioData = new Blob([new Uint8Array(event.data.size)], {
          type: mimeType,
        })
      } else {
        audioData = event.data
      }

      try {
        const base64Data = await convertBlobToBase64(audioData)
        socketRef.current.send(
          JSON.stringify({
            type: "audio_input",
            data: base64Data,
          })
        )
      } catch (error) {
        console.error("Error sending audio:", error)
      }
    }

    // Capture audio at 100ms intervals for smooth streaming
    mediaRecorderRef.current.start(100)
  }

  // Connect to Hume EVI
  const handleConnect = async () => {
    if (!apiKey || !configId) {
      alert(
        "Missing API key or configuration ID. Please check your environment variables."
      )
      return
    }

    try {
      setConnectionStatus("connecting")

      // Setup audio stream first
      const stream = await setupAudioStream()
      streamRef.current = stream

      // Connect to WebSocket
      const wsUrl = `wss://api.hume.ai/v0/evi/chat?api_key=${apiKey}&config_id=${configId}&verbose_transcription=true`
      socketRef.current = new WebSocket(wsUrl)

      socketRef.current.onopen = () => {
        console.log("WebSocket connected")
        setConnectionStatus("connected")
        setIsConnected(true)

        // Start recording after connection is established
        startRecording(stream)
      }

      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error("Error parsing message:", error)
        }
      }

      socketRef.current.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason)
        setConnectionStatus("disconnected")
        setIsConnected(false)
        cleanup()
      }

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        setConnectionStatus("error")
      }
    } catch (error) {
      console.error("Connection failed:", error)
      setConnectionStatus("error")

      if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          alert(
            "Microphone access denied. Please allow microphone access and try again."
          )
        } else if (error.name === "NotFoundError") {
          alert(
            "No microphone found. Please connect a microphone and try again."
          )
        }
      }
    }
  }

  // Cleanup function
  const cleanup = () => {
    // Stop recording
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop()
    }

    // Stop audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    // Stop audio playback
    stopAudio()

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
      gainNodeRef.current = null
    }
  }

  // Disconnect from EVI
  const handleDisconnect = () => {
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
    cleanup()
    setTranscript([])
  }

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // Toggle audio output
  const toggleAudio = () => {
    if (!audioEnabled) {
      setAudioEnabled(true)
    } else {
      setAudioEnabled(false)
      stopAudio()
    }
  }

  // Get status display helpers
  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600"
      case "connecting":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected"
      case "connecting":
        return "Connecting..."
      case "error":
        return "Connection Error"
      default:
        return "Disconnected"
    }
  }

  if (!apiKey || !configId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">
            Missing Configuration
          </h2>
          <p className="text-red-700">
            Please ensure NEXT_PUBLIC_HUME_API_KEY and
            NEXT_PUBLIC_HUME_CONFIG_ID are set in your .env.local file.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card
        title="🎙️ Empathic Voice Interface (SDK)"
        description="High-quality voice chat powered by Hume AI"
      >
        {/* Connection Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500 animate-pulse"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : connectionStatus === "error"
                  ? "bg-red-500"
                  : "bg-gray-400"
              }`}
            />
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {isConnected && (
            <div className="text-sm text-gray-600">
              WebSocket: OPEN | Audio Queue: {audioQueueRef.current.length}
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={connectionStatus === "connecting"}
              variant="primary"
              size="lg"
              className="flex items-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>
                {connectionStatus === "connecting"
                  ? "Connecting..."
                  : "Start Voice Chat"}
              </span>
            </Button>
          ) : (
            <>
              <Button
                onClick={handleDisconnect}
                variant="secondary"
                size="lg"
                className="flex items-center space-x-2"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </Button>

              <Button
                onClick={toggleMute}
                variant={isMuted ? "outline" : "ghost"}
                size="lg"
                className="flex items-center space-x-2"
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
                <span>{isMuted ? "Muted" : "Microphone On"}</span>
              </Button>

              <Button
                onClick={toggleAudio}
                variant={!audioEnabled ? "outline" : "ghost"}
                size="lg"
                className="flex items-center space-x-2"
              >
                {audioEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
                <span>{audioEnabled ? "Audio On" : "Audio Off"}</span>
              </Button>
            </>
          )}
        </div>

        {/* Audio Quality Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">
            🎯 Premium Audio Quality Features
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Echo cancellation and noise suppression enabled</li>
            <li>• 44.1kHz sample rate with 128kbps bitrate</li>
            <li>• 100ms audio chunks for smooth streaming</li>
            <li>• Automatic gain control for consistent volume</li>
            <li>• Smart audio queue management prevents choppy playback</li>
            <li>• Interruption handling with immediate audio stop</li>
          </ul>
        </div>

        {/* Transcript Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Conversation Transcript
          </h4>
          <div
            ref={transcriptRef}
            className="h-64 overflow-y-auto bg-white rounded border p-3 space-y-2"
          >
            {transcript.length === 0 ? (
              <div className="text-gray-500 text-center italic">
                {isConnected
                  ? "Start speaking to see the conversation..."
                  : "Connect to begin chatting"}
              </div>
            ) : (
              transcript.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    message.startsWith("You:")
                      ? "bg-blue-100 text-blue-900"
                      : "bg-green-100 text-green-900"
                  }`}
                >
                  <span className="font-medium">{message.split(":")[0]}:</span>
                  <span className="ml-2">
                    {message.substring(message.indexOf(":") + 1)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        {!isConnected && (
          <div className="bg-gray-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>
                Click &ldquo;Start Voice Chat&rdquo; to connect to Hume&apos;s
                EVI
              </li>
              <li>Allow microphone access when prompted</li>
              <li>
                Start speaking naturally - the AI will respond with empathy
              </li>
              <li>Use the mute button to pause input without disconnecting</li>
              <li>
                The AI can detect your emotional state and respond appropriately
              </li>
              <li>Audio is optimized for crystal clear, non-choppy playback</li>
            </ol>
          </div>
        )}
      </Card>
    </div>
  )
}
