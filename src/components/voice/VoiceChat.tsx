"use client"

import { VoiceProvider, useVoice } from "@humeai/voice-react"
import { useState, useEffect, useRef } from "react"
import { Phone, PhoneOff } from "lucide-react"
import Button from "@/components/ui/Button"
import Image from "next/image"

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
              lastMessage.type === "user_message" ? "Robert" : "Freja"
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
        return "text-green-400"
      case "connecting":
        return "text-yellow-400"
      case "error":
        return "text-red-400"
      default:
        return "text-gray-400"
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
    <div
      className="flex flex-col h-screen w-full"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/40"></div>
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>

      {/* Header Section */}
      <div className="relative z-10 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm py-2 px-4 shadow-lg border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={50}
                height={25}
                className="h-6 w-auto"
                priority
              />
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/30">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-500 animate-pulse shadow-lg shadow-green-500/50"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-500 animate-ping shadow-lg shadow-yellow-500/50"
                    : connectionStatus === "error"
                    ? "bg-red-500 animate-bounce shadow-lg shadow-red-500/50"
                    : "bg-gray-400"
                }`}
              />
              <span className={`font-medium text-sm ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Participants Bar */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm py-2 px-4 border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* User Info */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm">
                  👨‍💼
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-bold text-white text-xs">Robert</h3>
                <p className="text-xs text-white/70">You</p>
              </div>
            </div>

            {/* AI Info */}
            <div className="flex items-center space-x-2">
              <div>
                <h3 className="font-bold text-white text-xs text-right">
                  Freja
                </h3>
                <p className="text-xs text-white/70 text-right">AI Assistant</p>
              </div>
              <div className="relative">
                <Image
                  src="/chatuser.png"
                  alt="Freja"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                    isConnected ? "bg-purple-500 animate-pulse" : "bg-gray-400"
                  }`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Area */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden min-h-0">
        <div
          ref={transcriptRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-3 custom-scrollbar"
        >
          <div className="container mx-auto px-4 max-w-3xl h-full">
            {transcript.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div />
                {/* <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30">
                  <p className="text-lg font-medium text-white mb-1">
                    {isConnected
                      ? "Start speaking with Freja..."
                      : "Ready to connect"}
                  </p>
                  <p className="text-white/70 text-sm">
                    Your conversation will appear here
                  </p>
                </div> */}
              </div>
            ) : (
              transcript.map((message, index) => {
                const isUser = message.startsWith("Robert:")
                const speaker = isUser ? "Robert" : "Freja"
                const content = message
                  .substring(message.indexOf(":") + 1)
                  .trim()

                return (
                  <div
                    key={index}
                    className={`flex mb-4 animate-fade-in ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-sm lg:max-w-md ${
                        isUser ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isUser ? (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm">
                            👨‍💼
                          </div>
                        ) : (
                          <Image
                            src="/chatuser.png"
                            alt={speaker}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                          />
                        )}
                      </div>
                      <div
                        className={`rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm border border-white/20 ${
                          isUser
                            ? "bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white"
                            : "bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white"
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1 opacity-90">
                          {speaker}
                        </p>
                        <p className="text-sm leading-relaxed">{content}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Control Button Footer */}
      <div className="relative z-10 bg-white/10 backdrop-blur-sm py-3 px-4 border-t border-white/20">
        <div className="container mx-auto px-4 flex justify-center">
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={connectionStatus === "connecting"}
              variant="primary"
              size="lg"
              className="flex items-center space-x-2 px-6 py-3 text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl rounded-lg border-2 border-white/30"
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
              className="flex items-center space-x-2 px-6 py-3 text-base font-bold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transform hover:scale-105 transition-all duration-300 shadow-xl rounded-lg border-2 border-white/30"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Call</span>
            </Button>
          )}
        </div>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
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
