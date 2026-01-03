'use client';

import { useState, useEffect, useRef, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Loader2, Copy, Link2, Share2, Bot, User, BrainCircuit } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AvatarData {
  id: string;
  avatarName: string;
  avatarImageUrl?: string;
  status: 'draft' | 'awaiting_trainer' | 'completed';
  finalMasterPrompt?: string;
  ownerName?: string;
  ownerEmail?: string;
  createdAt: number;
}

export default function AvatarChatPage({ params }: { params: Promise<{ avatarId: string }> }) {
  const resolvedParams = use(params);
  const { avatarId } = resolvedParams;
  
  const router = useRouter();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [avatar, setAvatar] = useState<AvatarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);

  // Fetch avatar data
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        // Try to get from local avatar flow first
        const res = await fetch(`${BACKEND_URL}/api/avatar-flow/avatar/${avatarId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.avatar) {
            setAvatar(data.avatar);
          }
        }
        
        // Also try to get from cloud storage
        const cloudRes = await fetch(`${BACKEND_URL}/api/avatar-flow/master-prompt/${avatarId}`);
        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData.success) {
            setAvatar(prev => ({
              ...prev,
              id: avatarId,
              avatarName: cloudData.avatarName || prev?.avatarName || 'Avatar',
              avatarImageUrl: prev?.avatarImageUrl,
              status: 'completed' as const,
              finalMasterPrompt: cloudData.masterPrompt,
              createdAt: prev?.createdAt || Date.now(),
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
        toast({
          title: 'Error',
          description: 'Failed to load avatar data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvatar();
  }, [avatarId, toast]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get avatar image
  const getAvatarImage = (avatarName: string, avatarImageUrl?: string) => {
    if (avatarImageUrl) return avatarImageUrl;
    const index = avatarName.charCodeAt(0) % PlaceHolderImages.length;
    return PlaceHolderImages[index]?.imageUrl || PlaceHolderImages[0]?.imageUrl || '';
  };

  // Send message to avatar
  const sendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSending(true);

    try {
      // Call backend to chat with avatar using its master prompt
      const res = await fetch(`${BACKEND_URL}/api/avatar-flow/chat/${avatarId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response || "I'm still learning. Please try again later.",
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Add a fallback message
      const fallbackMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: avatar?.status !== 'completed' 
          ? "I'm not fully trained yet. Please complete my training first!"
          : "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setSending(false);
    }
  };

  // Generate trainer invite link
  const generateTrainerLink = async () => {
    if (!avatar) return;
    
    setGeneratingLink(true);
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : {};
      const ownerId = user._id || user.id || user.email || 'unknown';

      const res = await fetch(`${BACKEND_URL}/api/avatar-flow/generate-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarId: avatar.id,
          avatarName: avatar.avatarName,
          ownerId,
          expiresInHours: 2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInviteLink(data.invitation.inviteUrl);
        toast({
          title: 'Trainer Link Generated!',
          description: 'Share this link with someone to train your avatar.',
        });
      } else {
        throw new Error('Failed to generate link');
      }
    } catch (error) {
      console.error('Generate link error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate trainer link',
        variant: 'destructive',
      });
    } finally {
      setGeneratingLink(false);
    }
  };

  // Copy invite link
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({ title: 'Copied!', description: 'Trainer link copied to clipboard' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading avatar...</p>
        </div>
      </div>
    );
  }

  if (!avatar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="card-glass max-w-md">
          <CardHeader>
            <CardTitle>Avatar Not Found</CardTitle>
            <CardDescription>This avatar doesn't exist or has been removed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50">
                <Image 
                  src={getAvatarImage(avatar.avatarName, avatar.avatarImageUrl)} 
                  alt={avatar.avatarName} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div>
                <h1 className="font-bold text-lg" style={{ color: 'var(--dynamic-text-color)' }}>
                  {avatar.avatarName}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {avatar.status === 'completed' ? '🟢 Trained' : '🟡 ' + (avatar.status === 'awaiting_trainer' ? 'Awaiting Trainer' : 'Draft')}
                </p>
              </div>
            </div>
          </div>

          {/* Trainer Link Section */}
          <div className="flex items-center gap-2">
            {/* Training Link - for text/voice training */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                const link = `${baseUrl}/dashboard?view=train-avatar&avatarId=${avatarId}`;
                navigator.clipboard.writeText(link);
                toast({ title: 'Training Link Copied!', description: 'Share this link with a trainer to add memories.' });
              }}
            >
              <BrainCircuit className="h-4 w-4 mr-2" />
              Training Link
            </Button>

            {/* MCQ Invite Link - for initial personality training */}
            {inviteLink ? (
              <div className="flex items-center gap-2">
                <Input 
                  value={inviteLink} 
                  readOnly 
                  className="w-48 text-xs bg-secondary/50" 
                />
                <Button size="icon" variant="outline" onClick={copyInviteLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : avatar.status !== 'completed' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateTrainerLink}
                disabled={generatingLink}
              >
                {generatingLink ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Share2 className="h-4 w-4 mr-2" />
                )}
                MCQ Setup
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-3xl space-y-4">
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary/30">
                <Image 
                  src={getAvatarImage(avatar.avatarName, avatar.avatarImageUrl)} 
                  alt={avatar.avatarName} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--dynamic-text-color)' }}>
                Chat with {avatar.avatarName}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {avatar.status === 'completed' 
                  ? `Start a conversation with ${avatar.avatarName}. This avatar has been trained with a unique personality!`
                  : `${avatar.avatarName} is not fully trained yet. Generate a trainer link and share it to complete the training.`
                }
              </p>
              {avatar.status !== 'completed' && !inviteLink && (
                <Button 
                  className="mt-4"
                  onClick={generateTrainerLink}
                  disabled={generatingLink}
                >
                  {generatingLink ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Link2 className="h-4 w-4 mr-2" />
                  )}
                  Generate Trainer Link
                </Button>
              )}
            </div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/50 flex-shrink-0">
                    <Image 
                      src={getAvatarImage(avatar.avatarName, avatar.avatarImageUrl)} 
                      alt={avatar.avatarName} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 border border-border/50'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {sending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-primary/50 flex-shrink-0">
                <Image 
                  src={getAvatarImage(avatar.avatarName, avatar.avatarImageUrl)} 
                  alt={avatar.avatarName} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="bg-secondary/50 border border-border/50 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm p-4">
        <div className="container mx-auto max-w-3xl">
          <form 
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message ${avatar.avatarName}...`}
              className="flex-1 bg-secondary/30"
              disabled={sending}
            />
            <Button type="submit" disabled={!inputMessage.trim() || sending}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
