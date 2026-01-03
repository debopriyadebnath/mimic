'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { GlowingButton } from '@/components/ui/glowing-button';
import { useToast } from '@/hooks/use-toast';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { Mic, MicOff, Loader2, Trash2, Wand2, Bot, Copy, Link2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface AvatarInfo {
  id: string;
  avatarName: string;
  avatarImageUrl?: string;
  status: 'draft' | 'awaiting_trainer' | 'completed';
  ownerName?: string;
}

interface UserAvatar {
  id: string;
  avatarName: string;
  avatarImageUrl?: string;
  status: string;
}

export function AvatarTraining() {
  const searchParams = useSearchParams();
  const avatarIdFromUrl = searchParams.get('avatarId');
  
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [avatarInfo, setAvatarInfo] = useState<AvatarInfo | null>(null);
  const [userAvatars, setUserAvatars] = useState<UserAvatar[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(avatarIdFromUrl || '');
  const [loading, setLoading] = useState(true);
  const [trainingLink, setTrainingLink] = useState('');
  const [memoriesAdded, setMemoriesAdded] = useState(0);
  const { toast } = useToast();

  const {
    isConnecting,
    isRecording,
    fullTranscript,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useSpeechToText({
    onTranscript: (transcriptText, isFinal) => {
      if (isFinal && transcriptText) {
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

  // Fetch user's avatars if no avatarId in URL (owner view)
  useEffect(() => {
    const fetchUserAvatars = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser && !avatarIdFromUrl) {
          setLoading(false);
          return;
        }

        if (storedUser) {
          const user = JSON.parse(storedUser);
          const userId = user._id || user.id || user.email;

          const res = await fetch(`${BACKEND_URL}/api/avatar-flow/dashboard/${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.avatars) {
              // Only show completed avatars for training
              const completedAvatars = data.avatars.filter((a: UserAvatar) => a.status === 'completed');
              setUserAvatars(completedAvatars);
              
              // If avatarId from URL, set it
              if (avatarIdFromUrl) {
                setSelectedAvatarId(avatarIdFromUrl);
              } else if (completedAvatars.length > 0 && !selectedAvatarId) {
                setSelectedAvatarId(completedAvatars[0].id);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching avatars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAvatars();
  }, [avatarIdFromUrl]);

  // Fetch avatar info when avatarId changes
  useEffect(() => {
    const fetchAvatarInfo = async () => {
      if (!selectedAvatarId) return;

      try {
        const res = await fetch(`${BACKEND_URL}/api/avatar-flow/avatar/${selectedAvatarId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.avatar) {
            setAvatarInfo(data.avatar);
          }
        }
      } catch (error) {
        console.error('Error fetching avatar info:', error);
      }
    };

    fetchAvatarInfo();
  }, [selectedAvatarId]);

  // Get avatar image
  const getAvatarImage = (avatarName: string, avatarImageUrl?: string) => {
    if (avatarImageUrl) return avatarImageUrl;
    const index = avatarName.charCodeAt(0) % PlaceHolderImages.length;
    return PlaceHolderImages[index]?.imageUrl || PlaceHolderImages[0]?.imageUrl || '';
  };

  // Generate embedding using Gemini
  const generateEmbedding = async (inputText: string): Promise<number[]> => {
    const res = await fetch(`${BACKEND_URL}/api/avatar-flow/generate-embedding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText }),
    });

    if (!res.ok) {
      throw new Error('Failed to generate embedding');
    }

    const data = await res.json();
    return data.embedding;
  };

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

    if (!selectedAvatarId) {
      toast({
        title: 'No avatar selected',
        description: 'Please select an avatar to train.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    toast({ title: 'Processing memory...', description: 'Generating embedding and saving...' });

    try {
      // Step 1: Generate embedding
      const embedding = await generateEmbedding(text);

      // Step 2: Determine source based on context
      const storedUser = localStorage.getItem('user');
      const isOwner = storedUser && avatarInfo?.ownerName;
      const source = isRecording ? 'voice_input' : (isOwner ? 'user_saved' : 'trainer_added');

      // Step 3: Save memory to backend
      const res = await fetch(`${BACKEND_URL}/api/avatar/${selectedAvatarId}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: storedUser ? JSON.parse(storedUser)._id : 'trainer',
          text,
          embedding,
          category: 'personality',
          source,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save memory');
      }

      const data = await res.json();
      console.log('Memory saved:', data);

      setMemoriesAdded(prev => prev + 1);
      toast({
        title: 'Memory Added!',
        description: `${avatarInfo?.avatarName || 'Avatar'} has learned something new. (${memoriesAdded + 1} memories this session)`,
      });
      setText('');
      clearTranscript();
    } catch (error: any) {
      console.error('Failed to create memory:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add memory to the avatar.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate shareable training link
  const generateTrainingLink = () => {
    if (!selectedAvatarId) return;
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/dashboard?view=train-avatar&avatarId=${selectedAvatarId}`;
    setTrainingLink(link);
    
    navigator.clipboard.writeText(link);
    toast({
      title: 'Training Link Copied!',
      description: 'Share this link with a trainer to let them add memories to this avatar.',
    });
  };

  const hasInput = !!text;
  const isRecordingActive = isRecording || isConnecting;

  // Loading state
  if (loading) {
    return (
      <Card className="card-glass w-full max-w-3xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // No completed avatars
  if (!avatarIdFromUrl && userAvatars.length === 0) {
    return (
      <Card className="card-glass w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle style={{ color: 'var(--dynamic-text-color)' }}>Train Your Avatar</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Trained Avatars Yet</h3>
          <p className="text-muted-foreground mb-4">
            You need to create an avatar and complete its initial MCQ training before you can add more memories.
          </p>
          <Button onClick={() => window.location.href = '/dashboard?view=create-avatar'}>
            Create Avatar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Avatar Selection / Info Card */}
      <Card className="card-glass">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg" style={{ color: 'var(--dynamic-text-color)' }}>
              {avatarIdFromUrl ? 'Training Avatar' : 'Select Avatar to Train'}
            </CardTitle>
            {selectedAvatarId && (
              <Button variant="outline" size="sm" onClick={generateTrainingLink}>
                <Link2 className="h-4 w-4 mr-2" />
                Copy Training Link
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {avatarIdFromUrl && avatarInfo ? (
            // Trainer view - show fixed avatar
            <div className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/50">
                <Image 
                  src={getAvatarImage(avatarInfo.avatarName, avatarInfo.avatarImageUrl)} 
                  alt={avatarInfo.avatarName} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--dynamic-text-color)' }}>
                  {avatarInfo.avatarName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  You're training this avatar with new memories
                </p>
                {memoriesAdded > 0 && (
                  <p className="text-xs text-green-500 mt-1">
                    ✓ {memoriesAdded} memories added this session
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Owner view - avatar selector
            <div className="space-y-3">
              <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an avatar to train" />
                </SelectTrigger>
                <SelectContent>
                  {userAvatars.map((avatar) => (
                    <SelectItem key={avatar.id} value={avatar.id}>
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        {avatar.avatarName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {avatarInfo && (
                <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-primary/30">
                    <Image 
                      src={getAvatarImage(avatarInfo.avatarName, avatarInfo.avatarImageUrl)} 
                      alt={avatarInfo.avatarName} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{avatarInfo.avatarName}</h4>
                    <p className="text-xs text-muted-foreground">
                      Status: {avatarInfo.status === 'completed' ? '🟢 Trained' : '🟡 ' + avatarInfo.status}
                    </p>
                  </div>
                  {memoriesAdded > 0 && (
                    <span className="text-xs text-green-500">+{memoriesAdded} memories</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Training Link Display */}
          {trainingLink && (
            <div className="mt-3 flex items-center gap-2">
              <Input value={trainingLink} readOnly className="text-xs bg-secondary/50" />
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => {
                  navigator.clipboard.writeText(trainingLink);
                  toast({ title: 'Copied!' });
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Input Card */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle style={{ color: 'var(--dynamic-text-color)' }}>Add Memory</CardTitle>
          <CardDescription>
            Add new memories, thoughts, personality traits, or information for the avatar to learn. 
            You can type or use voice input with real-time transcription.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Textarea
              placeholder="Type a memory, personality trait, preference, or example conversation... or use the microphone for voice input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-transparent min-h-[120px]"
              disabled={isProcessing || !selectedAvatarId}
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
                disabled={isProcessing || isConnecting || !selectedAvatarId}
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
            disabled={!hasInput || isProcessing || isRecordingActive || !selectedAvatarId} 
            text={isProcessing ? "Processing..." : "Submit Memory"}
          />
        </CardFooter>
      </Card>

      {/* Tips */}
      <Card className="card-glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">💡 Training Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• Add personality traits: "I love helping people with creative projects"</p>
          <p>• Add preferences: "I prefer giving concise but thorough answers"</p>
          <p>• Add example responses: "When asked about hobbies, I talk about painting and hiking"</p>
          <p>• Add facts: "I have 5 years of experience in web development"</p>
        </CardContent>
      </Card>
    </div>
  );
}
