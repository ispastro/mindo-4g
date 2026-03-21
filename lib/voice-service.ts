// Voice service for ElevenLabs TTS and STT integration
import { apiClient } from "./api-client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://mindo-edb480512968.herokuapp.com/api"

class VoiceService {
  private getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token")
  }

  /**
   * Text-to-Speech using ElevenLabs via backend
   */
  async speak(text: string, voiceId?: string): Promise<void> {
    try {
      const token = this.getToken()
      if (!token) {
        console.warn("No auth token, falling back to browser TTS")
        this.fallbackSpeak(text)
        return
      }

      const response = await fetch(`${API_BASE}/voice/tts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text,
          voice_id: voiceId || "21m00Tcm4TlvDq8ikWAM" // Default voice
        }),
      })

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audio = new Audio(URL.createObjectURL(audioBlob))
      
      return new Promise((resolve, reject) => {
        audio.onended = () => resolve()
        audio.onerror = reject
        audio.play()
      })
    } catch (error) {
      console.error("ElevenLabs TTS error:", error)
      // Fallback to browser TTS
      this.fallbackSpeak(text)
    }
  }

  /**
   * Speech-to-Text using ElevenLabs via backend
   */
  async transcribe(audioBlob: Blob): Promise<string> {
    try {
      const token = this.getToken()
      if (!token) {
        throw new Error("No auth token")
      }

      // Send audio to backend for transcription
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const response = await fetch(`${API_BASE}/voice/stt`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`STT failed: ${response.status}`)
      }

      const result = await response.json()
      return result.text || ""
    } catch (error) {
      console.error("ElevenLabs STT error:", error)
      throw error
    }
  }

  /**
   * Fallback to browser's built-in TTS (commented out by default)
   */
  private fallbackSpeak(text: string): void {
    // Uncomment to enable browser TTS fallback
    /*
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
    */
    console.log("TTS fallback disabled. Text:", text)
  }

  /**
   * Cancel any ongoing speech
   */
  cancel(): void {
    // For ElevenLabs, we'd need to track the Audio element
    // For now, just cancel browser TTS if it's active
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }
}

export const voiceService = new VoiceService()
