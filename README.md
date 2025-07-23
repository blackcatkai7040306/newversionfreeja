# Next.js Project with Tailwind CSS & Voice AI

A modern, well-structured Next.js application built with TypeScript and Tailwind CSS, featuring a clean architecture, reusable components, and **high-quality voice-to-voice translation powered by Hume's EVI API**.

## 🚀 Features

- **Next.js 14** with App Router for optimal performance
- **TypeScript** for type-safe development
- **Tailwind CSS** for utility-first styling
- **ESLint** for code quality and consistency
- **Modular Architecture** with organized folder structure
- **Reusable Components** with consistent design system
- **Custom Hooks** for common functionality
- **Responsive Design** optimized for all devices
- **🎤 Voice AI Integration** with Hume's Empathic Voice Interface
- **High-Quality Audio** with no choppy sound guaranteed

## 🎯 Voice AI Features

- **Crystal Clear Audio**: 44.1kHz sample rate with 128kbps encoding
- **Real-time Processing**: 100ms streaming chunks for immediate response
- **Audio Optimizations**: Echo cancellation, noise suppression, auto gain control
- **Empathic Responses**: AI that understands and responds to emotional cues
- **Smart Interruption**: Verbose transcription for seamless conversation flow
- **WebSocket Streaming**: Optimized for low-latency communication

## 📁 Project Structure

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page
│   ├── voice/             # Voice AI interface page
│   ├── about/page.tsx     # About page
│   ├── contact/page.tsx   # Contact page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx     # Button component with variants
│   │   └── Card.tsx       # Card component
│   ├── layout/            # Layout components
│   │   ├── Header.tsx     # Site header with navigation
│   │   └── Footer.tsx     # Site footer
│   ├── voice/             # Voice AI components
│   │   └── VoiceInterface.tsx # Main voice interface
│   └── forms/             # Form-specific components
├── lib/
│   ├── utils/             # Utility functions
│   │   └── cn.ts          # Class name utility with clsx
│   └── constants/         # Application constants
│       ├── index.ts       # Site configuration and nav items
│       └── evi.ts         # EVI-specific constants
├── hooks/                 # Custom React hooks
│   └── useLocalStorage.ts # Local storage hook
├── types/                 # TypeScript type definitions
│   └── index.ts           # Common interface definitions
└── styles/                # Additional styles (if needed)
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- **Microphone access** for voice features

### Installation

1. **Navigate to the project directory:**

   ```bash
   cd nextjs-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add:

   ```bash
   NEXT_PUBLIC_HUME_API_KEY=7jqO69xY0CDNAb7W3JLMantyRQCCACnQAkVwEGwAA9AKHtYI
   NEXT_PUBLIC_HUME_CONFIG_ID=b0cc7c5a-5f9f-4ec9-94ee-71bdaafd147c
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

6. **Test Voice AI:**
   - Go to the "Voice AI" page
   - Click "Start Voice Translation"
   - Allow microphone access
   - Start speaking to experience the AI voice interface

## 🎨 Components

### UI Components

#### Button

A flexible button component with multiple variants and sizes:

```tsx
import Button from '@/components/ui/Button'

<Button variant="primary" size="lg">Click me</Button>
<Button variant="outline" size="sm">Cancel</Button>
```

**Variants:** `primary`, `secondary`, `outline`, `ghost`  
**Sizes:** `sm`, `md`, `lg`

#### Card

A container component for content organization:

```tsx
import Card from "@/components/ui/Card"

;<Card title="Card Title" description="Card description">
  <p>Card content goes here</p>
</Card>
```

### Voice Components

#### VoiceInterface

The main voice AI component with optimized audio handling:

```tsx
import VoiceInterface from "@/components/voice/VoiceInterface"

;<VoiceInterface className="my-custom-class" />
```

**Features:**

- High-quality audio recording and playback
- Real-time transcription display
- Audio level monitoring
- Connection status indicators
- Mute/unmute functionality

### Layout Components

#### Header

Responsive navigation header with mobile menu support.

#### Footer

Site footer with links and copyright information.

## 🪝 Custom Hooks

### useLocalStorage

A hook for managing localStorage with TypeScript support:

```tsx
import { useLocalStorage } from "@/hooks/useLocalStorage"

const [value, setValue] = useLocalStorage("key", defaultValue)
```

## 🔧 Utilities

### cn (Class Names)

Utility for merging Tailwind classes with conditional logic:

```tsx
import { cn } from '@/lib/utils/cn'

className={cn('base-classes', condition && 'conditional-classes', className)}
```

## 🎤 Voice AI Configuration

### Hume EVI Integration

The voice interface uses Hume's Empathic Voice Interface with these optimizations:

```typescript
const AUDIO_CONFIG = {
  recordingTimeslice: 100, // 100ms chunks for real-time feel
  sampleRate: 44100, // High-quality audio
  channelCount: 1, // Mono for voice
  echoCancellation: true, // Eliminate feedback
  noiseSuppression: true, // Clean audio input
  autoGainControl: true, // Consistent levels
}
```

### Audio Quality Features

- **WebSocket Streaming**: Real-time audio transmission
- **Audio Queue System**: Prevents choppy playback
- **Smart Muting**: Maintains connection with silence injection
- **Error Recovery**: Automatic reconnection on connection loss
- **Visual Feedback**: Real-time audio level monitoring

## 📱 Responsive Design

The application is built with mobile-first responsive design:

- **Mobile:** Base styles
- **Tablet:** `md:` prefix (768px+)
- **Desktop:** `lg:` prefix (1024px+)
- **Large Desktop:** `xl:` prefix (1280px+)

## 🚀 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧹 Code Quality

```bash
# Run ESLint
npm run lint

# Run TypeScript check
npm run type-check
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Best Practices

1. **Component Organization:** Keep components small and focused
2. **Type Safety:** Use TypeScript interfaces for all props
3. **Styling:** Use Tailwind utilities with the `cn()` helper
4. **State Management:** Use React hooks and context when needed
5. **File Naming:** Use PascalCase for components, camelCase for utilities
6. **Audio Handling:** Always check microphone permissions before recording
7. **Error Handling:** Implement graceful fallbacks for network issues

## 🔧 Voice AI Troubleshooting

### Common Issues

1. **No audio input detected:**

   - Check microphone permissions in browser
   - Ensure microphone is not used by other applications
   - Try refreshing the page and reconnecting

2. **Choppy audio playback:**

   - Check network connection stability
   - Close other bandwidth-intensive applications
   - The implementation includes audio queuing to prevent this

3. **Connection errors:**
   - Verify API key and configuration ID in `.env.local`
   - Check if WebSocket connections are blocked by firewall
   - Monitor browser console for detailed error messages

### Browser Compatibility

- **Chrome:** Full support (recommended)
- **Firefox:** Full support
- **Safari:** Full support (iOS 14.5+)
- **Edge:** Full support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Resources

- [Hume AI Documentation](https://dev.hume.ai/docs)
- [EVI API Reference](https://dev.hume.ai/reference/empathic-voice-interface-evi)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
