"use client"

import { useState, useEffect } from "react"

export function useVoiceSupport() {
  const [isSupported, setIsSupported] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    const checkSupport = () => {
      const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
      setIsSupported(supported)
    }

    checkSupport()
  }, [])

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
      return true
    } catch {
      setHasPermission(false)
      return false
    }
  }

  return { isSupported, hasPermission, requestPermission }
}
