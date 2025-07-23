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
      className="relative h-full overflow-hidden"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Animated background overlay with breathing effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20 animate-pulse"></div>
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]"></div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-ping delay-100"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-white/15 rounded-full animate-ping delay-300"></div>
        <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-white/25 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white/10 rounded-full animate-ping delay-700"></div>
      </div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
        {/* Logo Header */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/30 hover:bg-white/20 transition-all duration-300">
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={60}
              className="h-12 w-auto sm:h-16"
              priority
            />
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm p-6 sm:p-8">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  🎙️ Voice Chat with Freja
                </h1>
                <p className="text-blue-100 text-sm sm:text-base">
                  Empathic AI conversation powered by Hume
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Connection Status & Participants */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-6">
                {/* User Info */}
                <div className="bg-gradient-to-r from-blue-50/80 to-cyan-50/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-200/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {/* Handsome man avatar representation */}
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center text-2xl transform hover:scale-110 transition-all duration-300">
                        👨‍💼
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 text-lg">
                        Robert
                      </h3>
                      <p className="text-sm text-blue-700">You</p>
                    </div>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="flex items-center space-x-4 bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/40">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      connectionStatus === "connected"
                        ? "bg-green-500 animate-pulse shadow-lg shadow-green-500/50"
                        : connectionStatus === "connecting"
                        ? "bg-yellow-500 animate-ping shadow-lg shadow-yellow-500/50"
                        : connectionStatus === "error"
                        ? "bg-red-500 animate-bounce shadow-lg shadow-red-500/50"
                        : "bg-gray-400"
                    }`}
                  />
                  <span className={`font-semibold text-lg ${getStatusColor()}`}>
                    {getStatusText()}
                  </span>
                </div>

                {/* AI Info */}
                <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm rounded-2xl p-4 border border-purple-200/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Image
                        src="/chatuser.png"
                        alt="Freja"
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full border-3 border-white shadow-xl transform hover:scale-110 transition-all duration-300"
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          isConnected
                            ? "bg-purple-500 animate-pulse"
                            : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-900 text-lg">
                        Freja
                      </h3>
                      <p className="text-sm text-purple-700">AI Assistant</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Control Button */}
              <div className="flex justify-center mb-8">
                {!isConnected ? (
                  <Button
                    onClick={handleConnect}
                    disabled={connectionStatus === "connecting"}
                    variant="primary"
                    size="lg"
                    className="flex items-center space-x-3 px-10 py-5 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-110 transition-all duration-300 shadow-2xl rounded-2xl border-2 border-white/30"
                  >
                    <Phone className="w-7 h-7" />
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
                    className="flex items-center space-x-3 px-10 py-5 text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white transform hover:scale-110 transition-all duration-300 shadow-2xl rounded-2xl border-2 border-white/30"
                  >
                    <PhoneOff className="w-7 h-7" />
                    <span>End Call</span>
                  </Button>
                )}
              </div>

              {/* Transcript Display */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-inner border border-white/40">
                <h4 className="font-bold text-gray-900 mb-4 text-xl flex items-center">
                  💬 Live Conversation
                </h4>
                <div
                  ref={transcriptRef}
                  className="flex-1 flex items-center justify-center overflow-y-auto bg-white/80 backdrop-blur-sm rounded-xl border-2 border-gray-200/50 p-4 space-y-4 custom-scrollbar"
                >
                  {transcript.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 text-center">
                      <div className="text-6xl mb-6 animate-bounce">🎤</div>
                      <p className="text-lg font-medium">
                        {isConnected
                          ? "Start speaking with Freja..."
                          : "Ready to connect"}
                      </p>
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
                          className={`flex ${
                            isUser ? "justify-end" : "justify-start"
                          } mb-4 animate-fade-in`}
                        >
                          <div
                            className={`flex items-start space-x-3 max-w-xs sm:max-w-md lg:max-w-lg ${
                              isUser ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {isUser ? (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-lg">
                                  👨‍💼
                                </div>
                              ) : (
                                <Image
                                  src="/chatuser.png"
                                  alt={speaker}
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                                />
                              )}
                            </div>
                            <div
                              className={`rounded-2xl px-5 py-4 shadow-lg backdrop-blur-sm ${
                                isUser
                                  ? "bg-gradient-to-r from-blue-500/90 to-blue-600/90 text-white"
                                  : "bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white"
                              }`}
                            >
                              <p className="text-sm font-semibold mb-1 opacity-90">
                                {speaker}
                              </p>
                              <p className="text-sm leading-relaxed">
                                {content}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .custom-scrollbar:hover::-webkit-scrollbar {
          opacity: 1;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 0.6);
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.9);
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
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
