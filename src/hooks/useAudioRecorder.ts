import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`;

interface UseAudioRecorderOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  onLimitReached?: () => void;
}

export const useAudioRecorder = (options: UseAudioRecorderOptions = {}) => {
  const { onTranscript, onError, onLimitReached } = options;
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [secondsUsed, setSecondsUsed] = useState<number | null>(null);
  const [secondsLimit] = useState(3600);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size < 100) {
          onError?.('Áudio muito curto. Tente novamente.');
          return;
        }

        setIsTranscribing(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (!token) {
            onError?.('Você precisa estar logado para usar o microfone.');
            return;
          }

          const formData = new FormData();
          formData.append('file', blob, 'audio.webm');

          const resp = await fetch(TRANSCRIBE_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (resp.status === 429) {
            const err = await resp.json().catch(() => ({}));
            setSecondsUsed(err.seconds_used ?? secondsLimit);
            onLimitReached?.();
            onError?.(err.error || 'Limite de áudio atingido este mês.');
            return;
          }

          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error || 'Erro na transcrição');
          }

          const data = await resp.json();
          if (data.seconds_used != null) setSecondsUsed(data.seconds_used);
          
          if (data.text?.trim()) {
            onTranscript?.(data.text.trim());
          } else {
            onError?.('Nenhuma fala detectada. Tente novamente.');
          }
        } catch (err) {
          console.error('Transcription error:', err);
          onError?.(err instanceof Error ? err.message : 'Erro na transcrição');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        onError?.('Permissão de microfone negada.');
      } else {
        onError?.('Não foi possível acessar o microfone.');
      }
    }
  }, [onTranscript, onError, onLimitReached, secondsLimit]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isTranscribing,
    startRecording,
    stopRecording,
    toggleRecording,
    secondsUsed,
    secondsLimit,
  };
};
