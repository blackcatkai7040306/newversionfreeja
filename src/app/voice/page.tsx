"use client"

import VoiceChat from "@/components/voice/VoiceChat"

export default function VoicePage() {
  const apiKey = process.env.NEXT_PUBLIC_HUME_API_KEY
  const configId = process.env.NEXT_PUBLIC_HUME_CONFIG_ID

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

  return <VoiceChat apiKey={apiKey} configId={configId} />
}
