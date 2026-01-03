
'use client';

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvitationCard } from "./InvitationCard";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useState, useEffect } from "react";
import { PsychologicalQuestionnaire } from "./PsychologicalQuestionnaire";
import { useRouter } from "next/navigation";

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

    // Fetch user's avatars on mount
    useEffect(() => {
        const fetchUserAvatars = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                if (!storedUser) {
                    setLoading(false);
                    return;
                }
                
                const user = JSON.parse(storedUser);
                const userId = user._id || user.id || user.email;
                
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
                
                // Fetch from local storage (avatarFlow dashboard endpoint)
                const dashboardRes = await fetch(`${backendUrl}/api/avatar-flow/dashboard/${userId}`);
                if (dashboardRes.ok) {
                    const dashboardData = await dashboardRes.json();
                    if (dashboardData.success && dashboardData.avatars) {
                        setUserAvatars(dashboardData.avatars);
                    }
                }
                
                // Also fetch from Convex cloud storage
                const cloudRes = await fetch(`${backendUrl}/api/avatar-flow/cloud-prompts/${userId}`);
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
    }, []);

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

    // Get random avatar image based on avatar name
    const getAvatarImage = (avatarName: string) => {
        const index = avatarName.charCodeAt(0) % PlaceHolderImages.length;
        return PlaceHolderImages[index]?.imageUrl || PlaceHolderImages[0]?.imageUrl || '';
    };

    if (showQuestionnaire && selectedAvatar) {
        return <PsychologicalQuestionnaire avatarName={selectedAvatar.name} onSubmit={handleQuestionnaireSubmit} />;
    }

    return (
        <>
            <div className="space-y-8 w-full max-w-6xl">
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
                                <div key={avatar.id} className="group block text-left cursor-pointer" onClick={() => router.push(`/dashboard?view=training-results&avatarId=${avatar.id}`)}>
                                    <Card className="card-glass overflow-hidden h-full transition-all duration-300 group-hover:border-primary/80 group-hover:shadow-xl group-hover:shadow-primary/10">
                                        <div className="relative aspect-[4/3]">
                                            <Image 
                                                src={getAvatarImage(avatar.avatarName)} 
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
                                    <div key={avatar._id} className="group block text-left cursor-pointer">
                                        <Card className="card-glass overflow-hidden h-full transition-all duration-300 group-hover:border-primary/80 group-hover:shadow-xl group-hover:shadow-primary/10">
                                            <div className="relative aspect-[4/3]">
                                                <Image 
                                                    src={getAvatarImage(avatar.avatarName)} 
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
