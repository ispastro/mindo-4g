"use client"

import { useState, useRef } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Item } from "@/hooks/use-items-store"
import { voiceService } from "@/lib/voice-service"

interface VoiceButtonProps {
  onResult: (item: Omit<Item, "id" | "createdAt">) => void
}

type VoiceState = "idle" | "listening" | "processing"

export function VoiceButton({ onResult }: VoiceButtonProps) {
  const [state, setState] = useState<VoiceState>("idle")
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setState("processing")
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        
        console.log("🎵 Recording stopped. Audio chunks collected:", audioChunksRef.current.length)
        console.log("💾 Total audio blob size:", audioBlob.size, "bytes")
        
        try {
          const text = await voiceService.transcribe(audioBlob)
          setTranscript(text)
          processTranscript(text)
        } catch (err) {
          console.error("Transcription error:", err)
          setError("Could not transcribe audio. Please try again.")
          setState("idle")
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setState("listening")
      setError(null)
    } catch (err) {
      console.error("Microphone error:", err)
      setError("Could not access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  const processTranscript = (text: string) => {
    // Parse the transcript to extract item and location
    const parsed = parseItemLocation(text)

    if (parsed) {
      onResult(parsed)
      speakConfirmation(parsed.name, parsed.location)
    } else {
      setError("I couldn't understand where you put the item. Try saying 'I put my keys on the table'")
    }

    setState("idle")
    setTranscript("")
  }

  const parseItemLocation = (text: string): Omit<Item, "id" | "createdAt"> | null => {
    const lowerText = text.toLowerCase()

    // Common patterns for item placement
    const patterns = [
      /(?:i )?(?:put|placed|left|stored|kept) (?:my |the |a )?(.+?) (?:on|in|at|under|behind|inside|near|by|next to) (?:the |my |a )?(.+)/i,
      /(?:my |the |a )?(.+?) (?:is|are) (?:on|in|at|under|behind|inside|near|by|next to) (?:the |my |a )?(.+)/i,
      /(.+?) (?:goes|go) (?:on|in|at|under|behind|inside|near|by|next to) (?:the |my |a )?(.+)/i,
    ]

    for (const pattern of patterns) {
      const match = lowerText.match(pattern)
      if (match) {
        return {
          name: match[1].trim(),
          location: match[2].trim(),
        }
      }
    }

    return null
  }

  const speakConfirmation = async (item: string, location: string) => {
    const message = `Got it! I'll remember that your ${item} is ${location}.`
    await voiceService.speak(message)
    
    /* OLD WEB SPEECH API - Kept as reference
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }
    */
  }

  const toggleListening = () => {
    setError(null)

    if (state === "listening") {
      stopRecording()
    } else {
      startRecording()
    }
  }

  /* OLD BROWSER SPEECH RECOGNITION - Kept as reference
  const toggleListening = () => {
    setError(null)

    if (!recognitionRef.current) {
      setError("Speech recognition is not supported in your browser.")
      return
    }

    if (state === "listening") {
      recognitionRef.current.stop()
      setState("idle")
      setTranscript("")
    } else {
      recognitionRef.current.start()
      setState("listening")
    }
  }
  */

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={toggleListening}
        disabled={state === "processing"}
        size="lg"
        className={cn(
          "h-24 w-24 rounded-full transition-all duration-300",
          state === "listening" && "animate-pulse bg-destructive hover:bg-destructive/90",
          state === "idle" && "bg-primary hover:bg-primary/90",
          state === "processing" && "bg-muted",
        )}
        aria-label={state === "listening" ? "Stop listening" : "Start listening"}
      >
        {state === "processing" ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary-foreground" />
        ) : state === "listening" ? (
          <MicOff className="h-10 w-10 text-destructive-foreground" />
        ) : (
          <Mic className="h-10 w-10 text-primary-foreground" />
        )}
      </Button>

      <div className="h-8 text-center">
        {state === "listening" && <p className="text-sm text-primary animate-pulse">{transcript || "Listening..."}</p>}
        {state === "processing" && <p className="text-sm text-muted-foreground">Processing...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}
