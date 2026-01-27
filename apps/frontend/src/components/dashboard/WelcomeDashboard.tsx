
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitationCard } from "./InvitationCard";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useState, useEffect } from "react";
import { PsychologicalQuestionnaire } from "./PsychologicalQuestionnaire";
import { useRouter } from "next/navigation";
import { Users, Bot, CheckCircle, Clock } from "lucide-react";
import { useUser } from '@clerk/nextjs';

const initialInvitations = [
  {
    id: 'invite1',
    avatarName: 'Helios',
    avatarImageUrl: PlaceHolderImages.find(p => p.id === 'avatar-13')?.imageUrl || '',
    fromUserName: 'Aria',
  },
  {
    id: 'invite2',
    avatarName: 'Nyx',
    avatarImageUrl: PlaceHolderImages.find(p => p.id === 'avatar-14')?.imageUrl || '',
    fromUserName: 'Jaxon',
  },
];

interface UserAvatar {
  id: string;
  avatarName: string;
  avatarImageUrl?: string;  // Selected avatar image URL
  status: 'draft' | 'awaiting_trainer' | 'completed';
  finalMasterPrompt?: string;
  createdAt: number;
  completedAt?: number;
  convexPromptId?: string;
}

interface CloudPrompt {
  _id: string;
  avatarId: string;
  avatarName: string;
  avatarImageUrl?: string;
  ownerId: string;
  masterPrompt: string;
  trainerName?: string;
  createdAt: number;
}

export function WelcomeDashboard() {
    const router = useRouter();
    const [invitations, setInvitations] = useState(initialInvitations);
    const [userAvatars, setUserAvatars] = useState<UserAvatar[]>([]);
    const [cloudAvatars, setCloudAvatars] = useState<CloudPrompt[]>([]);
    const [loading, setLoading] = useState(true);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<{name: string, imageUrl: string} | null>(null);
    const [userEmail, setUserEmail] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const { user, isLoaded } = useUser();
    useEffect(() => {
        const fetchUserAvatars = async () => {
            if (!isLoaded) {
                return;
            }

            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

                setUserEmail(user.primaryEmailAddress?.emailAddress || '');
                setUserName(user.username || user.fullName || 'User');

                const dashboardRes = await fetch(`${backendUrl}/api/avatar-flow/dashboard/${user.id}`);
                if (dashboardRes.ok) {
                    const dashboardData = await dashboardRes.json();
                    if (dashboardData.success && dashboardData.avatars) {
                        setUserAvatars(dashboardData.avatars);
                    }
                }

                const cloudRes = await fetch(`${backendUrl}/api/avatar-flow/cloud-prompts/${user.id}`);
                if (cloudRes.ok) {
                    const cloudData = await cloudRes.json();
                    if (cloudData.success && cloudData.prompts) {
                        setCloudAvatars(cloudData.prompts);
                    }
                }
            } catch (error) {
                console.error('Error fetching avatars:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserAvatars();
    }, [isLoaded, user]);

    const handleAcceptInvitation = (inviteId: string, avatarName: string, avatarImageUrl: string) => {
        setSelectedAvatar({ name: avatarName, imageUrl: avatarImageUrl });
        setShowQuestionnaire(true);
        setInvitations(invitations.filter(inv => inv.id !== inviteId));
    };

    const handleRejectInvitation = (inviteId: string) => {
        setInvitations(invitations.filter(inv => inv.id !== inviteId));
    }
    
    const handleQuestionnaireSubmit = () => {
        setShowQuestionnaire(false);
        setSelectedAvatar(null);
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/50';
            case 'awaiting_trainer': return 'bg-yellow-500/50';
            case 'draft': return 'bg-blue-500/50';
            default: return 'bg-gray-500/50';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'Trained';
            case 'awaiting_trainer': return 'Awaiting Trainer';
            case 'draft': return 'Draft';
            default: return status;
        }
    };

    // Get avatar image - use stored URL if available, otherwise fallback to generated
    const getAvatarImage = (avatarName: string, avatarImageUrl?: string) => {
        if (avatarImageUrl) return avatarImageUrl;
        const index = avatarName.charCodeAt(0) % PlaceHolderImages.length;
        return PlaceHolderImages[index]?.imageUrl || PlaceHolderImages[0]?.imageUrl || '';
    };

    if (showQuestionnaire && selectedAvatar) {
        return <PsychologicalQuestionnaire avatarName={selectedAvatar.name} onSubmit={handleQuestionnaireSubmit} />;
    }

    // Calculate avatar stats
    const totalAvatars = userAvatars.length + cloudAvatars.filter(cloud => !userAvatars.some(local => local.id === cloud.avatarId)).length;
    const completedAvatars = userAvatars.filter(a => a.status === 'completed').length + cloudAvatars.filter(cloud => !userAvatars.some(local => local.id === cloud.avatarId)).length;
    const pendingAvatars = userAvatars.filter(a => a.status === 'awaiting_trainer' || a.status === 'draft').length;

    return (
        <>
            <div className="space-y-8 w-full max-w-6xl">
                {/* User Stats Section */}
                <div>
                    <h2 className="text-2xl font-headline mb-4" style={{color: 'var(--dynamic-text-color)'}}>
                        Welcome back{userName ? `, ${userName}` : ''}!
                    </h2>
                    {userEmail && (
                        <p className="text-sm text-muted-foreground mb-4">{userEmail}</p>
                    )}
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Total Avatars */}
                        <Card className="card-glass">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Avatars</CardTitle>
                                <Bot className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold" style={{color: 'var(--dynamic-text-color)'}}>{loading ? '...' : totalAvatars}</div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Created by you
                                </p>
                                {/* Avatar thumbnails */}
                                {!loading && totalAvatars > 0 && (
                                    <div className="flex -space-x-2 mt-2">
                                        {userAvatars.slice(0, 4).map((avatar, idx) => (
                                            <div key={avatar.id} className="relative w-8 h-8 rounded-full border-2 border-background overflow-hidden" style={{zIndex: 4-idx}}>
                                                <Image src={getAvatarImage(avatar.avatarName, avatar.avatarImageUrl)} alt={avatar.avatarName} fill className="object-cover" />
                                            </div>
                                        ))}
                                        {totalAvatars > 4 && (
                                            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                                                +{totalAvatars - 4}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Trained Avatars */}
                        <Card className="card-glass">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Trained</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">{loading ? '...' : completedAvatars}</div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Fully trained avatars
                                </p>
                                {/* Trained avatar thumbnails */}
                                {!loading && completedAvatars > 0 && (
                                    <div className="flex -space-x-2 mt-2">
                                        {userAvatars.filter(a => a.status === 'completed').slice(0, 4).map((avatar, idx) => (
                                            <div key={avatar.id} className="relative w-8 h-8 rounded-full border-2 border-green-500/50 overflow-hidden" style={{zIndex: 4-idx}}>
                                                <Image src={getAvatarImage(avatar.avatarName, avatar.avatarImageUrl)} alt={avatar.avatarName} fill className="object-cover" />
                                            </div>
                                        ))}
                                        {completedAvatars > 4 && (
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center text-xs font-medium text-green-500">
                                                +{completedAvatars - 4}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pending Avatars */}
                        <Card className="card-glass">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-500">{loading ? '...' : pendingAvatars}</div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Awaiting training
                                </p>
                                {/* Pending avatar thumbnails */}
                                {!loading && pendingAvatars > 0 && (
                                    <div className="flex -space-x-2 mt-2">
                                        {userAvatars.filter(a => a.status === 'awaiting_trainer' || a.status === 'draft').slice(0, 4).map((avatar, idx) => (
                                            <div key={avatar.id} className="relative w-8 h-8 rounded-full border-2 border-yellow-500/50 overflow-hidden" style={{zIndex: 4-idx}}>
                                                <Image src={getAvatarImage(avatar.avatarName, avatar.avatarImageUrl)} alt={avatar.avatarName} fill className="object-cover" />
                                            </div>
                                        ))}
                                        {pendingAvatars > 4 && (
                                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 flex items-center justify-center text-xs font-medium text-yellow-500">
                                                +{pendingAvatars - 4}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Cloud Synced */}
                        <Card className="card-glass">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Cloud Synced</CardTitle>
                                <span className="text-sm">☁️</span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-500">{loading ? '...' : cloudAvatars.length}</div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Saved to cloud
                                </p>
                                {/* Cloud avatar thumbnails */}
                                {!loading && cloudAvatars.length > 0 && (
                                    <div className="flex -space-x-2 mt-2">
                                        {cloudAvatars.slice(0, 4).map((avatar, idx) => (
                                            <div key={avatar._id} className="relative w-8 h-8 rounded-full border-2 border-purple-500/50 overflow-hidden" style={{zIndex: 4-idx}}>
                                                <Image src={getAvatarImage(avatar.avatarName, avatar.avatarImageUrl)} alt={avatar.avatarName} fill className="object-cover" />
                                            </div>
                                        ))}
                                        {cloudAvatars.length > 4 && (
                                            <div className="w-8 h-8 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center text-xs font-medium text-purple-500">
                                                +{cloudAvatars.length - 4}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* My Avatars Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-headline" style={{color: 'var(--dynamic-text-color)'}}>My Avatars</h2>
                        <button 
                            onClick={() => router.push('/dashboard?view=create-avatar')}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm"
                        >
                            + Create Avatar
                        </button>
                    </div>
                    
                    {loading ? (
                        <Card className="card-glass">
                            <CardHeader>
                                <CardDescription>Loading your avatars...</CardDescription>
                            </CardHeader>
                        </Card>
                    ) : userAvatars.length > 0 || cloudAvatars.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Show avatars from local storage */}
                            {userAvatars.map((avatar) => (
                                <div key={avatar.id} className="group block text-left cursor-pointer" onClick={() => router.push(`/chat/${avatar.id}`)}>
                                    <Card className="card-glass overflow-hidden h-full transition-all duration-300 group-hover:border-primary/80 group-hover:shadow-xl group-hover:shadow-primary/10">
                                        <div className="relative aspect-[4/3]">
                                            <Image 
                                                src={getAvatarImage(avatar.avatarName, avatar.avatarImageUrl)} 
                                                alt={avatar.avatarName} 
                                                fill 
                                                className="object-cover transition-transform duration-300 group-hover:scale-105" 
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <h3 className="text-xl font-bold text-white">{avatar.avatarName}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs text-white px-2 py-1 rounded-full ${getStatusColor(avatar.status)}`}>
                                                        {getStatusLabel(avatar.status)}
                                                    </span>
                                                    {avatar.convexPromptId && (
                                                        <span className="text-xs text-white/80 bg-purple-500/50 px-2 py-1 rounded-full">
                                                            ☁️ Cloud
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-white/60 mt-2">
                                                    Created {new Date(avatar.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                            
                            {/* Show cloud avatars not in local storage */}
                            {cloudAvatars
                                .filter(cloud => !userAvatars.some(local => local.id === cloud.avatarId))
                                .map((avatar) => (
                                    <div key={avatar._id} className="group block text-left cursor-pointer" onClick={() => router.push(`/chat/${avatar.avatarId}`)}>
                                        <Card className="card-glass overflow-hidden h-full transition-all duration-300 group-hover:border-primary/80 group-hover:shadow-xl group-hover:shadow-primary/10">
                                            <div className="relative aspect-[4/3]">
                                                <Image 
                                                    src={getAvatarImage(avatar.avatarName, avatar.avatarImageUrl)} 
                                                    alt={avatar.avatarName} 
                                                    fill 
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <h3 className="text-xl font-bold text-white">{avatar.avatarName}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-white px-2 py-1 rounded-full bg-green-500/50">
                                                            Trained
                                                        </span>
                                                        <span className="text-xs text-white/80 bg-purple-500/50 px-2 py-1 rounded-full">
                                                            ☁️ Cloud
                                                        </span>
                                                    </div>
                                                    {avatar.trainerName && (
                                                        <p className="text-xs text-white/60 mt-2">
                                                            Trained by {avatar.trainerName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <Card className="card-glass">
                            <CardHeader>
                                <CardTitle className="text-lg">No avatars yet</CardTitle>
                                <CardDescription>
                                    Create your first avatar to get started with personalized AI training.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </div>

                {/* Pending Invitations Section */}
                <div>
                    <h2 className="text-2xl font-headline mb-4" style={{color: 'var(--dynamic-text-color)'}}>Pending Invitations</h2>
                    {invitations.length > 0 ? (
                         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {invitations.map((invite) => (
                                <InvitationCard 
                                    key={invite.id}
                                    {...invite}
                                    onAccept={() => handleAcceptInvitation(invite.id, invite.avatarName, invite.avatarImageUrl)}
                                    onReject={() => handleRejectInvitation(invite.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="card-glass">
                            <CardHeader>
                                <CardDescription>You have no pending invitations.</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
