import type React from "react"
import type { Metadata, Viewport } from "next"
import { Lexend_Deca } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { InstallPrompt } from "@/components/install-prompt"
import { GoogleOAuthProvider } from "@react-oauth/google"
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
  icons: {
    icon: "/icon-192.svg",
    apple: "/apple-touch-icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mindo",
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lexend.variable} font-sans antialiased`}>
        <GoogleOAuthProvider clientId={googleClientId}>
          {children}
          <InstallPrompt />
          <Analytics />
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
