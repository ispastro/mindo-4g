"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Item } from "@/hooks/use-items-store"
import { voiceService } from "@/lib/voice-service"
import { VOICE_CONFIG } from "@/lib/voice-config"

interface VoiceButtonProps {
  onResult: (item: Omit<Item, "id" | "createdAt">) => void
  silenceThreshold?: number
  silenceDuration?: number
  minRecordingTime?: number
  maxRecordingTime?: number
}

type VoiceState = "idle" | "listening" | "processing"

export function VoiceButton({ 
  onResult, 
  silenceThreshold = VOICE_CONFIG.SILENCE_THRESHOLD, 
  silenceDuration = VOICE_CONFIG.SILENCE_DURATION,
  minRecordingTime = VOICE_CONFIG.MIN_RECORDING_TIME,
  maxRecordingTime = VOICE_CONFIG.MAX_RECORDING_TIME
}: VoiceButtonProps) {
  const [state, setState] = useState<VoiceState>("idle")
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const maxTimeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const recordingStartTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      if (maxTimeTimerRef.current) clearTimeout(maxTimeTimerRef.current)
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [])

  const detectSilence = () => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
    
    // Convert to decibels (approximate)
    const db = average > 0 ? 20 * Math.log10(average / 255) : -100
    setVolumeLevel(Math.max(0, Math.min(100, (db + 100) * 2))) // Normalize to 0-100

    const isSilent = db < silenceThreshold
    const recordingDuration = Date.now() - recordingStartTimeRef.current

    if (isSilent && recordingDuration > minRecordingTime) {
      // Start silence timer if not already started
      if (!silenceTimerRef.current) {
        console.log("🔇 Silence detected, starting timer...")
        silenceTimerRef.current = setTimeout(() => {
          console.log("⏱️ Silence duration exceeded, auto-stopping...")
          stopRecording()
        }, silenceDuration)
      }
    } else {
      // Clear silence timer if user is speaking
      if (silenceTimerRef.current) {
        console.log("🎤 Speech detected, clearing silence timer")
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
    }

    // Continue monitoring
    if (state === "listening") {
      animationFrameRef.current = requestAnimationFrame(detectSilence)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      recordingStartTimeRef.current = Date.now()

      // Setup Web Audio API for silence detection
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      
      analyser.fftSize = VOICE_CONFIG.AUDIO.FFT_SIZE
      analyser.smoothingTimeConstant = VOICE_CONFIG.AUDIO.SMOOTHING
      source.connect(analyser)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Cleanup
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
        if (maxTimeTimerRef.current) {
          clearTimeout(maxTimeTimerRef.current)
          maxTimeTimerRef.current = null
        }
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
          recordingIntervalRef.current = null
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        setVolumeLevel(0)
        setRecordingTime(0)

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

      // Start recording time counter
      recordingIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - recordingStartTimeRef.current
        setRecordingTime(Math.floor(elapsed / 1000))
      }, 1000)

      // Set max recording time limit
      maxTimeTimerRef.current = setTimeout(() => {
        console.log("⏰ Max recording time reached, auto-stopping...")
        stopRecording()
      }, maxRecordingTime)

      // Start silence detection
      detectSilence()
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

      <div className="flex flex-col items-center gap-2">
        {/* Volume indicator */}
        {state === "listening" && (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-100 ease-out"
                style={{ width: `${volumeLevel}%` }}
              />
            </div>
            {/* Recording timer */}
            <div className="text-xs text-muted-foreground font-mono">
              {recordingTime}s / {Math.floor(maxRecordingTime / 1000)}s
            </div>
          </div>
        )}
        
        <div className="h-8 text-center">
          {state === "listening" && (
            <p className="text-sm text-primary animate-pulse">
              {transcript || "Speak now... (auto-stops after silence)"}
            </p>
          )}
          {state === "processing" && <p className="text-sm text-muted-foreground">Processing...</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  )
}
