"use client"

import { VoiceProvider, useVoice } from "@humeai/voice-react"
import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from "lucide-react"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"

interface VoiceChatProps {
  apiKey: string
  configId: string
}

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

function VoiceChatInner({ apiKey, configId }: VoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [transcript, setTranscript] = useState<string[]>([])
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected")

  const transcriptRef = useRef<HTMLDivElement>(null)

  // Use the Hume Voice hook
  const { status, connect, disconnect, messages } = useVoice()

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  // Handle status changes
  useEffect(() => {
    const currentStatus = typeof status === "string" ? status : status.value
    setConnectionStatus(currentStatus as ConnectionStatus)
    setIsConnected(currentStatus === "connected")
  }, [status])

  // Handle messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]

      if (
        lastMessage.type === "user_message" ||
        lastMessage.type === "assistant_message"
      ) {
        const messageText = lastMessage.message?.content || ""
        if (messageText) {
          setTranscript((prev) => [
            ...prev,
            `${
              lastMessage.type === "user_message" ? "You" : "AI"
            }: ${messageText}`,
          ])
        }
      }
    }
  }, [messages])

  // Handle connection with optimized audio setup
  const handleConnect = async () => {
    try {
      setConnectionStatus("connecting")

      // Request microphone permissions with high-quality constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("Audio stream acquired with high-quality settings")

      // Connect to Hume EVI
      await connect({
        auth: {
          type: "apiKey",
          value: apiKey,
        },
        configId: configId,
      })
    } catch (error) {
      console.error("Failed to connect:", error)
      setConnectionStatus("error")

      // Handle specific error cases
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

  const handleDisconnect = () => {
    disconnect()
    setTranscript([])
  }

  // Get connection status display
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card
        title="🎙️ Empathic Voice Interface"
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
              Status: {typeof status === "string" ? status : status.value}
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
            <Button
              onClick={handleDisconnect}
              variant="secondary"
              size="lg"
              className="flex items-center space-x-2"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </Button>
          )}
        </div>

        {/* Audio Quality Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">
            🎯 Optimized for Premium Audio Quality
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Echo cancellation and noise suppression enabled</li>
            <li>• 44.1kHz sample rate for crystal clear audio</li>
            <li>• WebSocket streaming with automatic audio buffering</li>
            <li>• Automatic gain control for consistent volume</li>
            <li>• Real-time empathic voice processing</li>
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
              <li>
                The AI can detect your emotional state and respond appropriately
              </li>
              <li>Conversation will appear in the transcript below</li>
            </ol>
          </div>
        )}
      </Card>
    </div>
  )
}

export default function VoiceChat({ apiKey, configId }: VoiceChatProps) {
  return (
    <VoiceProvider
      onMessage={(message) => {
        console.log("Hume message received:", message)
      }}
      onError={(error) => {
        console.error("Hume error:", error)
      }}
      onOpen={() => {
        console.log("Hume connection opened")
      }}
      onClose={() => {
        console.log("Hume connection closed")
      }}
    >
      <VoiceChatInner apiKey={apiKey} configId={configId} />
    </VoiceProvider>
  )
}
