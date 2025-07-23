import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 h-full">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Next.js with Empathic Voice AI
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Experience high-quality voice conversations powered by Hume&apos;s EVI
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/voice">
            <Button variant="primary" size="lg">
              Try Voice Chat
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>

      {/* Voice AI Feature Highlight */}
      <div className="mb-16">
        <Card
          title="🎙️ Empathic Voice Interface"
          description="High-quality, emotionally intelligent voice conversations with zero choppy audio"
          className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Audio Quality Features
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  44.1kHz sample rate for crystal clear audio
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Echo cancellation and noise suppression
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Smart audio queue prevents choppy playback
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  100ms streaming chunks for real-time feel
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                AI Capabilities
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">🧠</span>
                  Emotional intelligence and empathy
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">🎯</span>
                  Real-time interruption handling
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">⚡</span>
                  Low-latency WebSocket connection
                </li>
                <li className="flex items-center">
                  <span className="text-blue-500 mr-2">🔄</span>
                  Continuous conversation flow
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/voice">
              <Button variant="primary" size="lg" className="text-lg px-8 py-3">
                Start Voice Conversation →
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card
          title="TypeScript Ready"
          description="Built with TypeScript for better development experience and type safety."
        >
          <div className="flex items-center text-blue-600">
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Type Safe
          </div>
        </Card>

        <Card
          title="Tailwind CSS"
          description="Utility-first CSS framework for rapid UI development."
        >
          <div className="flex items-center text-green-600">
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V5z"
              />
            </svg>
            Responsive Design
          </div>
        </Card>

        <Card
          title="Voice AI Integration"
          description="Seamlessly integrated with Hume's Empathic Voice Interface."
        >
          <div className="flex items-center text-purple-600">
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116-6a3 3 0 01-3 3v6a3 3 0 01-3 3z"
              />
            </svg>
            AI Powered
          </div>
        </Card>
      </div>

      {/* Components Showcase */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Component Examples
        </h2>

        <div className="space-y-8">
          <Card
            title="Button Variants"
            description="Different button styles available in the UI component library"
          >
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </Card>

          <Card
            title="Button Sizes"
            description="Multiple sizes for different use cases"
          >
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Project Structure */}
      <Card
        title="Project Structure"
        description="Clean and organized folder structure for scalable development"
      >
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
          <div className="text-gray-700">
            📁 src/
            <br />
            ├── 📁 app/ (Next.js 13+ App Router)
            <br />
            │ ├── 📄 page.tsx (Homepage)
            <br />
            │ ├── 📁 voice/ (Voice Chat Page)
            <br />
            │ ├── 📁 about/ & 📁 contact/
            <br />
            ├── 📁 components/
            <br />
            │ ├── 📁 ui/ (Reusable UI components)
            <br />
            │ ├── 📁 layout/ (Layout components)
            <br />
            │ └── 📁 voice/ (Voice components)
            <br />
            ├── 📁 lib/
            <br />
            │ ├── 📁 utils/ (Utility functions)
            <br />
            │ └── 📁 constants/ (App constants)
            <br />
            ├── 📁 hooks/ (Custom React hooks)
            <br />
            ├── 📁 types/ (TypeScript definitions)
            <br />
            └── 📁 styles/ (Additional styles)
          </div>
        </div>
      </Card>
    </div>
  )
}
