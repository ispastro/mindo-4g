import type React from "react"
import type { Metadata, Viewport } from "next"
import { Lexend_Deca } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { InstallPrompt } from "@/components/install-prompt"
import "./globals.css"

const lexend = Lexend_Deca({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-lexend",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Mindo - Never lose your things again",
  description: "Tell Mindo where you put your things by simply speaking to it. No typing needed.",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mindo",
  },
}

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${lexend.variable} font-sans antialiased`}>
        {children}
        <InstallPrompt />
        <Analytics />
      </body>
    </html>
  )
}
