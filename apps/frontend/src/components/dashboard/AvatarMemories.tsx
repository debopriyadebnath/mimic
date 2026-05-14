'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Filter, Clock, User, Tag, FileText, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';
import { cn, API_URL } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@clerk/nextjs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BACKEND_URL = API_URL;

interface Memory {
  _id: string;
  avatarId: string;
  text: string;
  category?: string;
  trustWeight: 'owner' | 'trainer' | 'derived';
  source: 'user_saved' | 'trainer_added' | 'voice_input' | 'conversation_extract';
  trainerId?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AvatarConversation {
  _id: string;
  avatarId: string;
  sessionId: string;
  messages: ConversationMessage[];
  messageCount: number;
  firstMessagePreview: string;
  lastMessagePreview: string;
  createdAt: number;
  updatedAt: number;
}

interface UserAvatar {
  id: string;
  avatarName: string;
  avatarImageUrl?: string;
  status: string;
}

type SortBy = 'newest' | 'oldest' | 'category' | 'source';
type FilterTrust = 'all' | 'owner' | 'trainer' | 'derived';
type FilterSource = 'all' | 'user_saved' | 'trainer_added' | 'voice_input' | 'conversation_extract';

export function AvatarMemories() {
  const searchParams = useSearchParams();
  const avatarIdFromUrl = searchParams.get('avatarId');

  const [memories, setMemories] = useState<Memory[]>([]);
  const [userAvatars, setUserAvatars] = useState<UserAvatar[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(avatarIdFromUrl || '');
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [filterTrust, setFilterTrust] = useState<FilterTrust>('all');
  const [filterSource, setFilterSource] = useState<FilterSource>('all');
  const [avatarName, setAvatarName] = useState('');
  const [conversations, setConversations] = useState<AvatarConversation[]>([]);
  const { user, isLoaded } = useUser();

  // Fetch user's avatars
  useEffect(() => {
    const fetchUserAvatars = async () => {
      if (!isLoaded || !user) return;

      try {
        const res = await fetch(`${BACKEND_URL}/api/avatar-flow/dashboard/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.avatars) {
            const completedAvatars = data.avatars.filter((a: UserAvatar) => a.status === 'completed');
            setUserAvatars(completedAvatars);

            if (completedAvatars.length > 0 && !selectedAvatarId) {
              setSelectedAvatarId(completedAvatars[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching avatars:', error);
      }
    };

    fetchUserAvatars();
  }, [isLoaded, user, selectedAvatarId]);

  // Fetch memories when avatar is selected
  useEffect(() => {
    const fetchMemories = async () => {
      if (!selectedAvatarId) return;

      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/avatar-flow/memories/${selectedAvatarId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setMemories(data.memories || []);
            
            // Set avatar name from selected avatar
            const selected = userAvatars.find(a => a.id === selectedAvatarId);
            if (selected) {
              setAvatarName(selected.avatarName);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching memories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemories();
  }, [selectedAvatarId, userAvatars]);

  // Fetch early conversations when avatar is selected
  useEffect(() => {
    const fetchConversations = async () => {
      if (!selectedAvatarId) return;

      setConversationLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/avatar-flow/conversations/${selectedAvatarId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setConversations(data.conversations || []);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setConversationLoading(false);
      }
    };

    fetchConversations();
  }, [selectedAvatarId]);

  // Filter and sort memories
  const filteredMemories = memories
    .filter(m => {
      const matchesSearch = m.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTrust = filterTrust === 'all' || m.trustWeight === filterTrust;
      const matchesSource = filterSource === 'all' || m.source === filterSource;
      return matchesSearch && matchesTrust && matchesSource;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'source':
          return a.source.localeCompare(b.source);
        default:
          return 0;
      }
    });

  const getAvatarImage = (avatarName: string, avatarImageUrl?: string) => {
    if (avatarImageUrl) return avatarImageUrl;
    const index = avatarName.charCodeAt(0) % PlaceHolderImages.length;
    return PlaceHolderImages[index]?.imageUrl || PlaceHolderImages[0]?.imageUrl || '';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTrustBadgeColor = (trust: string) => {
    switch (trust) {
      case 'owner':
        return 'bg-blue-600/20 border-blue-600/50 text-blue-700';
      case 'trainer':
        return 'bg-purple-600/20 border-purple-600/50 text-purple-700';
      case 'derived':
        return 'bg-gray-600/20 border-gray-600/50 text-gray-700';
      default:
        return 'bg-gray-600/20 border-gray-600/50 text-gray-700';
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'user_saved':
        return 'bg-green-600/20 border-green-600/50 text-green-700';
      case 'trainer_added':
        return 'bg-orange-600/20 border-orange-600/50 text-orange-700';
      case 'voice_input':
        return 'bg-pink-600/20 border-pink-600/50 text-pink-700';
      case 'conversation_extract':
        return 'bg-cyan-600/20 border-cyan-600/50 text-cyan-700';
      default:
        return 'bg-gray-600/20 border-gray-600/50 text-gray-700';
    }
  };

  const sourceLabel = {
    user_saved: 'User Saved',
    trainer_added: 'Trainer Added',
    voice_input: 'Voice Input',
    conversation_extract: 'Conversation Extract',
  };

  const trustLabel = {
    owner: 'Owner',
    trainer: 'Trainer',
    derived: 'Derived',
  };

  const formatConversationPreview = (conversation: AvatarConversation) => {
    const preview = conversation.messages.slice(0, 4);
    if (preview.length === 0) return 'No messages';

    return preview.map((message) => `${message.role === 'user' ? 'User' : 'AI'}: ${message.content}`).join('\n\n');
  };

  if (!isLoaded) {
    return (
      <div className="w-full max-w-7xl mx-auto border-2 border-foreground bg-background p-12 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ea580c]" />
        <span className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em]">INITIALIZING...</span>
      </div>
    );
  }

  if (userAvatars.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto border-2 border-foreground bg-background">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-foreground bg-foreground/5">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-foreground">NO_AVATARS</span>
        </div>
        <div className="p-12 text-center">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-6">
            No avatars found. Create an avatar first to view memories.
          </p>
          <Button 
            onClick={() => window.location.href = '/dashboard?view=create-avatar'}
            className="bg-foreground hover:bg-foreground/90 text-background rounded-none border-2 border-foreground font-mono text-xs uppercase tracking-widest px-8 h-12"
          >
            CREATE_AVATAR
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10">
      {/* Avatar Selector */}
      <div className="border-2 border-foreground bg-background overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-foreground bg-foreground/5">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-foreground" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-foreground">SELECT_MEMORY_SOURCE</span>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedAvatarId} onValueChange={setSelectedAvatarId}>
              <SelectTrigger className="rounded-none border-2 border-foreground bg-background h-12 font-mono text-xs">
                <SelectValue placeholder="Select an avatar" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-foreground font-mono text-xs">
                {userAvatars.map((avatar) => (
                  <SelectItem key={avatar.id} value={avatar.id} className="focus:bg-foreground/5 rounded-none">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      {avatar.avatarName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="w-full max-w-7xl mx-auto border-2 border-foreground bg-background p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#ea580c]" />
          <span className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em]">LOADING_MEMORIES...</span>
        </div>
      ) : (
        <>
          {/* Early Conversations */}
          <div className="border-2 border-foreground bg-background overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-foreground bg-foreground/5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-foreground" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-foreground">EARLY_CONVERSATIONS</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{conversations.length} SESSIONS</span>
            </div>

            {conversationLoading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#ea580c]" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">NO_CONVERSATIONS_FOUND</p>
              </div>
            ) : (
              <div className="divide-y-2 divide-foreground">
                {conversations.map((conversation) => (
                  <div key={conversation._id} className="p-6 bg-background hover:bg-foreground/5 transition-colors">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-3 items-center">
                        <div className="px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest border rounded bg-cyan-600/20 border-cyan-600/50 text-cyan-700">
                          Session {conversation.sessionId.slice(0, 10)}
                        </div>
                        <div className="px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest border border-foreground/30 bg-foreground/5 rounded text-foreground">
                          {conversation.messageCount} Messages
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-auto">
                          <Clock className="h-3 w-3" />
                          {formatDate(conversation.updatedAt)}
                        </div>
                      </div>

                      <div className="text-xs font-mono leading-relaxed text-foreground whitespace-pre-wrap break-words">
                        {formatConversationPreview(conversation)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filters and Search */}
          <div className="border-2 border-foreground bg-background overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-foreground bg-foreground/5">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-foreground" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-foreground">FILTER_MEMORIES</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{filteredMemories.length} RESULTS</span>
            </div>
            <div className="p-6 space-y-4">
              {/* Search */}
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search memories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-2 border-foreground rounded-none h-10 font-mono text-xs focus:ring-0 focus:border-[#ea580c]"
                  />
                </div>
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sort */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                    <SelectTrigger className="rounded-none border-2 border-foreground bg-background h-10 font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-foreground font-mono text-xs">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="source">Source</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Trust Filter */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Trust Weight</label>
                  <Select value={filterTrust} onValueChange={(v) => setFilterTrust(v as FilterTrust)}>
                    <SelectTrigger className="rounded-none border-2 border-foreground bg-background h-10 font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-foreground font-mono text-xs">
                      <SelectItem value="all">All Trust Levels</SelectItem>
                      <SelectItem value="owner">Owner Only</SelectItem>
                      <SelectItem value="trainer">Trainer Only</SelectItem>
                      <SelectItem value="derived">Derived Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Source Filter */}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Source</label>
                  <Select value={filterSource} onValueChange={(v) => setFilterSource(v as FilterSource)}>
                    <SelectTrigger className="rounded-none border-2 border-foreground bg-background h-10 font-mono text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-2 border-foreground font-mono text-xs">
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="user_saved">User Saved</SelectItem>
                      <SelectItem value="trainer_added">Trainer Added</SelectItem>
                      <SelectItem value="voice_input">Voice Input</SelectItem>
                      <SelectItem value="conversation_extract">Conversation Extract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Memories List */}
          <div className="border-2 border-foreground bg-background overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-foreground bg-foreground/5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-foreground" />
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-foreground">MEMORY_DATABASE</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{filteredMemories.length} ENTRIES</span>
            </div>

            {filteredMemories.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">NO_MEMORIES_FOUND</p>
              </div>
            ) : (
              <div className="divide-y-2 divide-foreground">
                {filteredMemories.map((memory, index) => (
                  <div key={memory._id} className="p-6 bg-background hover:bg-foreground/5 transition-colors">
                    <div className="space-y-3">
                      {/* Memory Text */}
                      <div>
                        <p className="text-xs font-mono leading-relaxed text-foreground whitespace-pre-wrap break-words">
                          {memory.text}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-3 items-center">
                        {/* Trust Weight Badge */}
                        <div className={cn(
                          'px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest border rounded',
                          getTrustBadgeColor(memory.trustWeight)
                        )}>
                          {trustLabel[memory.trustWeight as keyof typeof trustLabel]}
                        </div>

                        {/* Source Badge */}
                        <div className={cn(
                          'px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest border rounded',
                          getSourceBadgeColor(memory.source)
                        )}>
                          {sourceLabel[memory.source as keyof typeof sourceLabel]}
                        </div>

                        {/* Category Badge */}
                        {memory.category && (
                          <div className="px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest border border-foreground/30 bg-foreground/5 rounded text-foreground">
                            {memory.category}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-auto">
                          <Clock className="h-3 w-3" />
                          {formatDate(memory.createdAt)}
                        </div>
                      </div>

                      {/* Updated indicator */}
                      {memory.updatedAt !== memory.createdAt && (
                        <div className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
                          Updated: {formatDate(memory.updatedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
