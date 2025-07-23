import type { Metadata } from "next"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "Next.js App",
  description: "A modern Next.js application with Tailwind CSS",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased screen flex flex-col">
        <Header />
        <main className="flex-1 h-[calc(100vh-300px)]">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
