
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { GlowingButton } from '@/components/ui/glowing-button';
import { useToast } from '@/hooks/use-toast';
import { useAssemblyAI } from '@/hooks/use-assemblyai';
import { Mic, MicOff, Loader2, Trash2, Wand2 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export function AvatarTraining() {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const {
    isConnecting,
    isRecording,
    fullTranscript,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useAssemblyAI({
    onTranscript: (transcriptText, isFinal) => {
      if (isFinal && transcriptText) {
        // Append final transcript to text area
        setText(prev => prev ? `${prev} ${transcriptText}` : transcriptText);
      }
    },
    onError: (error) => {
      toast({
        title: 'Transcription Error',
        description: error,
        variant: 'destructive',
      });
    },
  });

  const handleStartRecording = async () => {
    clearTranscript();
    await startRecording();
    toast({ title: 'Recording started...', description: 'Speak clearly into your microphone.' });
  };

  const handleStopRecording = () => {
    stopRecording();
    toast({ title: 'Recording stopped.' });
  };

  const handleClear = () => {
    setText('');
    clearTranscript();
    toast({
      title: 'Input Cleared',
      description: 'The text has been removed.',
    });
  };

  const handleSubmit = async () => {
    if (!text) {
      toast({
        title: 'No input provided',
        description: 'Please provide text or use voice recording.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    toast({ title: 'Submitting memory to avatar...' });

    try {
      // TODO: Implement actual AI memory creation flow
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Memory data:', { text });

      toast({
        title: 'Memory Added!',
        description: 'Your avatar has learned something new.',
      });
      setText('');
      clearTranscript();
    } catch (error) {
      console.error('Failed to create memory:', error);
      toast({
        title: 'Error',
        description: 'Failed to add memory to the avatar.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const hasInput = !!text;
  const isRecordingActive = isRecording || isConnecting;

  return (
    <Card className="card-glass w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle style={{ color: 'var(--dynamic-text-color)' }}>Train Your Avatar</CardTitle>
        <CardDescription>
          Add a new memory, thought, or piece of information for your avatar to learn. You can type or use voice input with real-time transcription.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Textarea
            placeholder="Type a memory, thought, or fact... or use the microphone for voice input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="bg-transparent min-h-[120px]"
            disabled={isProcessing}
          />
          {/* Real-time transcription preview */}
          {isRecording && fullTranscript && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Wand2 className="h-3 w-3" />
                <span>Live Transcription</span>
              </div>
              <p className="text-sm text-foreground">{fullTranscript}</p>
            </div>
          )}
        </div>
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            {isRecording ? 'Listening... speak clearly' : 'Click the microphone to start voice input'}
          </p>
          <div className='flex flex-col items-center justify-center gap-4'>
            <Button
              size="icon"
              variant={isRecordingActive ? "destructive" : "outline"}
              onClick={isRecordingActive ? handleStopRecording : handleStartRecording}
              disabled={isProcessing || isConnecting}
              className={cn('w-16 h-16 rounded-full relative',
                isRecording && 'animate-pulse ring-4 ring-destructive/50',
                isConnecting && 'opacity-50'
              )}
            >
              {isConnecting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>

            {isConnecting && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting to transcription service...</span>
              </div>
            )}

            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse"></div>
                <span>Recording & Transcribing...</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" onClick={handleClear} disabled={!hasInput || isProcessing || isRecordingActive}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
        <GlowingButton 
          onClick={handleSubmit} 
          disabled={!hasInput || isProcessing || isRecordingActive} 
          text={isProcessing ? "Processing..." : "Submit Memory"}
        />
      </CardFooter>
    </Card>
  );
}
