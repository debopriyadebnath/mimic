'use client';

import { useState, useRef, useCallback } from 'react';

interface UseAssemblyAIOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

interface TranscriptMessage {
  message_type: 'PartialTranscript' | 'FinalTranscript' | 'SessionBegins' | 'SessionTerminated' | 'error';
  text?: string;
  error?: string;
  audio_start?: number;
  audio_end?: number;
}

export function useAssemblyAI({ onTranscript, onError }: UseAssemblyAIOptions = {}) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopRecording = useCallback(() => {
    // Stop processor/worklet
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Stop all audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close WebSocket
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ terminate_session: true }));
      }
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setIsRecording(false);
    setPartialTranscript('');
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setIsConnecting(true);
      setTranscript('');
      setPartialTranscript('');

      // Get token or API key from our API
      const tokenResponse = await fetch('/api/assemblyai/token', {
        method: 'POST',
      });
      
      if (!tokenResponse.ok) {
        const error = await tokenResponse.json();
        throw new Error(error.error || 'Failed to get authentication');
      }
      
      const { token, apiKey } = await tokenResponse.json();
      const authValue = token || apiKey;
      
      if (!authValue) {
        throw new Error('Failed to get authentication credentials');
      }

      // Get microphone access first
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      streamRef.current = stream;

      // Connect to AssemblyAI Universal Streaming WebSocket
      // Use token if available, otherwise use API key
      const wsUrl = token 
        ? `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
        : `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&encoding=pcm_s16le`;
      
      const socket = token 
        ? new WebSocket(wsUrl)
        : new WebSocket(wsUrl, ['token', apiKey]);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected to AssemblyAI');
        setIsConnecting(false);
        setIsRecording(true);

        // Create AudioContext
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        workletNodeRef.current = processor;
        
        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
          if (socket.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert float32 to int16 PCM
            const pcmData = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            // Send as base64
            const uint8Array = new Uint8Array(pcmData.buffer);
            let binary = '';
            for (let i = 0; i < uint8Array.length; i++) {
              binary += String.fromCharCode(uint8Array[i]);
            }
            const base64 = btoa(binary);
            socket.send(JSON.stringify({ audio_data: base64 }));
          }
        };
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as TranscriptMessage;
          
          if (message.message_type === 'error') {
            console.error('AssemblyAI error:', message.error);
            onError?.(message.error || 'Transcription error');
            return;
          }
          
          if (message.message_type === 'SessionBegins') {
            console.log('AssemblyAI session started');
          } else if (message.message_type === 'PartialTranscript') {
            setPartialTranscript(message.text || '');
            onTranscript?.(message.text || '', false);
          } else if (message.message_type === 'FinalTranscript') {
            if (message.text) {
              setTranscript(prev => {
                const newTranscript = prev ? `${prev} ${message.text}` : message.text!;
                return newTranscript;
              });
              onTranscript?.(message.text, true);
            }
            setPartialTranscript('');
          }
        } catch (err) {
          console.error('Error parsing message:', err);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.('WebSocket connection failed. Please check your API key and try again.');
        setIsConnecting(false);
        stopRecording();
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        if (event.code !== 1000 && event.code !== 1005) {
          onError?.(`Connection closed unexpectedly (${event.code}): ${event.reason || 'Unknown error'}`);
        }
        setIsRecording(false);
        setIsConnecting(false);
      };

    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to start recording');
      setIsConnecting(false);
      stopRecording();
    }
  }, [onTranscript, onError, stopRecording]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setPartialTranscript('');
  }, []);

  return {
    isConnecting,
    isRecording,
    transcript,
    partialTranscript,
    fullTranscript: transcript + (partialTranscript ? ` ${partialTranscript}` : ''),
    startRecording,
    stopRecording,
    clearTranscript,
  };
}
