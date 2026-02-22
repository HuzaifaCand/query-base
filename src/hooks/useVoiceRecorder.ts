import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

const MAX_VOICE_DURATION = 120;

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // Track progress 0 to 100 if needed, or time

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- 1. Audio Lifecycle Management ---
  useEffect(() => {
    // If we have a URL, prepare the Audio object immediately
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      const handleTimeUpdate = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          // Calculate remaining time
          const timeLeft = Math.ceil(audio.duration - audio.currentTime);
          setProgress(timeLeft);
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0); // Reset countdown
        audio.currentTime = 0;
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);

      // Cleanup
      return () => {
        audio.pause();
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
        audioRef.current = null;
      };
    }
  }, [audioUrl]);

  // --- 2. Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Compression settings for voice notes
      // Opus codec at 24kbps is excellent for speech, ~75% smaller than default
      const options = {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 24000, // 24 kbps (vs ~128 kbps default)
      };

      // Check if browser supports our preferred settings
      let mediaRecorder;
      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        mediaRecorder = new MediaRecorder(stream, options);
        console.log("🎙️ Recording with compression: 24kbps Opus");
      } else {
        // Fallback to default if not supported
        mediaRecorder = new MediaRecorder(stream);
        console.log(
          "🎙️ Recording with default settings (compression not supported)",
        );
      }

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);

        // Log compression results
        const sizeKB = (audioBlob.size / 1024).toFixed(1);
        console.log(`📦 Voice note size: ${sizeKB}KB`);

        setAudioBlob(audioBlob);
        setAudioUrl(url);

        // Important: Stop the tracks to turn off the red recording light in browser
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start Recording Timer
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= MAX_VOICE_DURATION - 1) {
            stopRecording();
            toast.info("Maximum recording duration reached");
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
    }
  }, []);

  // --- 3. Playback Logic ---
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((e) => console.error("Playback failed", e));
      setIsPlaying(true);
    }
  };

  const deleteVoiceNote = () => {
    // Stop audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Revoke URL to free memory
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // Reset all states
    setAudioBlob(null);
    setAudioUrl(null);
    setIsRecording(false);
    setIsPlaying(false);
    setRecordingDuration(0);
    setProgress(0);
  };

  // --- 4. Helpers ---
  const formatTime = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds)); // Prevent negative numbers
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Logic: If playing (or paused mid-way), show countdown. Otherwise show total duration.
  const displayTime =
    isPlaying || (progress > 0 && progress < recordingDuration)
      ? progress
      : recordingDuration;

  return {
    isRecording,
    recordingDuration,
    audioBlob,
    isPlaying,
    hasVoiceNote: !!audioBlob,
    displayTime,
    startRecording,
    stopRecording,
    deleteVoiceNote,
    togglePlayback,
    formatTime,
  };
}
