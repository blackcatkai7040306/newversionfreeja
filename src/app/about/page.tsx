import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About This Project
        </h1>
        <p className="text-xl text-gray-600">
          Learn more about the architecture and features of this Next.js
          application.
        </p>
      </div>

      <div className="space-y-8">
        <Card
          title="Technology Stack"
          description="Modern technologies for a robust development experience"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                <span>Next.js 14 with App Router</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                <span>TypeScript for type safety</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                <span>Tailwind CSS for styling</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                <span>ESLint for code quality</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                <span>Custom hooks and utilities</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                <span>Responsive design patterns</span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Project Features"
          description="Key features and architectural decisions"
        >
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                Modular component architecture with reusable UI elements
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                Type-safe development with comprehensive TypeScript definitions
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Utility-first CSS with Tailwind for rapid development</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                Custom hooks for common functionality (localStorage, etc.)
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>
                Clean folder structure for scalable application growth
              </span>
            </li>
          </ul>
        </Card>

        <div className="text-center">
          <Button variant="primary">Back to Home</Button>
        </div>
      </div>
    </div>
  )
}
