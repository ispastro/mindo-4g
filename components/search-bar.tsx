"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Mic, MicOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { voiceService } from "@/lib/voice-service"
import { VOICE_CONFIG } from "@/lib/voice-config"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  silenceThreshold?: number
  silenceDuration?: number
  minRecordingTime?: number
  maxRecordingTime?: number
}

export function SearchBar({ 
  value, 
  onChange,
  silenceThreshold = VOICE_CONFIG.SILENCE_THRESHOLD,
  silenceDuration = VOICE_CONFIG.SILENCE_DURATION,
  minRecordingTime = VOICE_CONFIG.MIN_RECORDING_TIME,
  maxRecordingTime = VOICE_CONFIG.MAX_RECORDING_TIME
}: SearchBarProps) {
  const [isListening, setIsListening] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const maxTimeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const recordingStartTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      if (maxTimeTimerRef.current) clearTimeout(maxTimeTimerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioContextRef.current) audioContextRef.current.close()
    }
  }, [])

  const detectSilence = () => {
    if (!analyserRef.current) return

    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteFrequencyData(dataArray)

    const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
    const db = average > 0 ? 20 * Math.log10(average / 255) : -100
    setVolumeLevel(Math.max(0, Math.min(100, (db + 100) * 2)))

    const isSilent = db < silenceThreshold
    const recordingDuration = Date.now() - recordingStartTimeRef.current

    if (isSilent && recordingDuration > minRecordingTime) {
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          stopRecording()
        }, silenceDuration)
      }
    } else {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
    }

    if (isListening) {
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
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        setVolumeLevel(0)

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        
        console.log("🔍 Search: Audio chunks collected:", audioChunksRef.current.length)
        console.log("🔍 Search: Audio blob size:", audioBlob.size, "bytes")
        
        try {
          const text = await voiceService.transcribe(audioBlob)
          console.log("🔍 Search: Transcribed text:", text)
          
          // Auto-submit search immediately after transcription
          if (text.trim()) {
            onChange(text.trim())
            console.log("✅ Search auto-submitted:", text.trim())
          }
        } catch (err) {
          console.error("Transcription error:", err)
        }

        setIsListening(false)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsListening(true)

      // Set max recording time limit
      maxTimeTimerRef.current = setTimeout(() => {
        console.log("⏰ Search: Max recording time reached")
        stopRecording()
      }, maxRecordingTime)

      // Start silence detection
      detectSilence()
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
      
      {/* Volume indicator overlay */}
      {isListening && volumeLevel > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-b-xl overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-100 ease-out"
            style={{ width: `${volumeLevel}%` }}
          />
        </div>
      )}
      
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
