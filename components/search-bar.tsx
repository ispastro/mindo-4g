"use client"

import { useState, useRef } from "react"
import { Search, Mic, MicOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { voiceService } from "@/lib/voice-service"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [isListening, setIsListening] = useState(false)
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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        
        console.log("🔍 Search: Audio chunks collected:", audioChunksRef.current.length)
        console.log("🔍 Search: Audio blob size:", audioBlob.size, "bytes")
        
        try {
          const text = await voiceService.transcribe(audioBlob)
          onChange(text)
          speakResults(text)
        } catch (err) {
          console.error("Transcription error:", err)
        }

        setIsListening(false)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsListening(true)
    } catch (err) {
      console.error("Microphone error:", err)
      setIsListening(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  const speakResults = async (query: string) => {
    await voiceService.speak(`Searching for ${query}`)
  }

  const toggleVoiceSearch = () => {
    if (isListening) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  /* OLD BROWSER SPEECH RECOGNITION - Kept as reference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event) => {
          const text = event.results[0][0].transcript
          onChange(text)
          setIsListening(false)
          speakResults(text)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [onChange])
  */

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search for an item or location..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 rounded-xl bg-card pl-12 pr-14 text-base text-card-foreground placeholder:text-muted-foreground"
      />
      <Button
        size="icon"
        variant="ghost"
        onClick={toggleVoiceSearch}
        className={cn("absolute right-2 top-1/2 -translate-y-1/2", isListening && "text-primary")}
        aria-label={isListening ? "Stop voice search" : "Start voice search"}
      >
        {isListening ? <MicOff className="h-5 w-5 animate-pulse text-destructive" /> : <Mic className="h-5 w-5" />}
      </Button>
    </div>
  )
}
