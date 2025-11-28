"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Mic, MicOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any | null>(null)

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

          // Speak the results
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

  const speakResults = (query: string) => {
    if ("speechSynthesis" in window) {
      // Small delay to let UI update
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(`Searching for ${query}`)
        utterance.rate = 1.0
        window.speechSynthesis.speak(utterance)
      }, 100)
    }
  }

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

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
