
'use client';

import { InvitationCard } from "./InvitationCard";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { API_URL } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import { PsychologicalQuestionnaire } from "./PsychologicalQuestionnaire";
import { useRouter } from "next/navigation";
import { Bot, CheckCircle, Clock, Cloud, Plus, Sparkles, ArrowRight } from "lucide-react";
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

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
  avatarImageUrl?: string;
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

const STATUS_CONFIG = {
  completed:       { label: 'Trained',          bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', border: 'border-emerald-500/20' },
  awaiting_trainer:{ label: 'Awaiting Trainer',  bg: 'bg-amber-500/15',   text: 'text-amber-400',   dot: 'bg-amber-400',   border: 'border-amber-500/20'   },
  draft:           { label: 'Draft',             bg: 'bg-blue-500/15',    text: 'text-blue-400',    dot: 'bg-blue-400',    border: 'border-blue-500/20'    },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.4, 0, 0.2, 1] },
  }),
};

export function WelcomeDashboard() {
  const router = useRouter();
  const [invitations, setInvitations] = useState(initialInvitations);
  const [userAvatars, setUserAvatars] = useState<UserAvatar[]>([]);
  const [cloudAvatars, setCloudAvatars] = useState<CloudPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<{name: string; imageUrl: string} | null>(null);
  const [userName, setUserName] = useState<string>('');
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const fetchUserAvatars = async () => {
      if (!isLoaded) return;
      if (!user) { setLoading(false); return; }
      try {
        setUserName(user.username || user.fullName || 'User');
        const backendUrl = API_URL;
        const [dashRes, cloudRes] = await Promise.all([
          fetch(`${backendUrl}/api/avatar-flow/dashboard/${user.id}`),
          fetch(`${backendUrl}/api/avatar-flow/cloud-prompts/${user.id}`),
        ]);
        if (dashRes.ok) {
          const d = await dashRes.json();
          if (d.success && d.avatars) setUserAvatars(d.avatars);
        }
        if (cloudRes.ok) {
          const d = await cloudRes.json();
          if (d.success && d.prompts) setCloudAvatars(d.prompts);
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

  const handleRejectInvitation = (inviteId: string) =>
    setInvitations(invitations.filter(inv => inv.id !== inviteId));

  const handleQuestionnaireSubmit = () => {
    setShowQuestionnaire(false);
    setSelectedAvatar(null);
  };

  const getAvatarImage = (avatarName: string, avatarImageUrl?: string) => {
    if (avatarImageUrl) return avatarImageUrl;
    const index = avatarName.charCodeAt(0) % PlaceHolderImages.length;
    return PlaceHolderImages[index]?.imageUrl || PlaceHolderImages[0]?.imageUrl || '';
  };

  if (showQuestionnaire && selectedAvatar) {
    return <PsychologicalQuestionnaire avatarName={selectedAvatar.name} onSubmit={handleQuestionnaireSubmit} />;
  }

  const totalAvatars = userAvatars.length + cloudAvatars.filter(c => !userAvatars.some(l => l.id === c.avatarId)).length;
  const completedAvatars = userAvatars.filter(a => a.status === 'completed').length + cloudAvatars.filter(c => !userAvatars.some(l => l.id === c.avatarId)).length;
  const pendingAvatars = userAvatars.filter(a => a.status === 'awaiting_trainer' || a.status === 'draft').length;

  const stats = [
    { label: 'Total Avatars',  value: totalAvatars,       icon: Bot,          color: 'text-blue-400',    glow: 'shadow-blue-500/10'    },
    { label: 'Trained',        value: completedAvatars,   icon: CheckCircle,  color: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    { label: 'In Progress',    value: pendingAvatars,     icon: Clock,        color: 'text-amber-400',   glow: 'shadow-amber-500/10'   },
    { label: 'Cloud Synced',   value: cloudAvatars.length,icon: Cloud,        color: 'text-purple-400',  glow: 'shadow-purple-500/10'  },
  ];

  return (
    <div className="space-y-10 w-full max-w-6xl">

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-semibold tracking-tight text-white/90">
          {userName ? `Welcome back, ${userName}` : 'Welcome back'}
          <span className="text-white/25"> — </span>
          <span className="gradient-text-blue">your workspace</span>
        </h2>
        <p className="text-sm text-white/35 mt-1">Manage your avatars, training, and memories from one place.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <div className={`rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 shadow-lg ${stat.glow} hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-200`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={`h-4 w-4 ${stat.color} opacity-70`} />
              </div>
              <div className={`text-3xl font-bold tracking-tight ${stat.color}`}>
                {loading ? <span className="inline-block w-6 h-6 rounded bg-white/10 animate-pulse" /> : stat.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* My Avatars */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white/80">My Avatars</h3>
            <p className="text-xs text-white/30 mt-0.5">Click any avatar to start chatting</p>
          </div>
          <Button
            size="sm"
            onClick={() => router.push('/dashboard?view=create-avatar')}
            className="h-8 px-3 rounded-lg bg-primary/90 hover:bg-primary text-white text-xs font-medium border-0 shadow-[0_0_16px_rgba(0,102,255,0.25)] hover:shadow-[0_0_24px_rgba(0,102,255,0.4)] transition-all"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Avatar
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] aspect-[4/3] animate-pulse" />
            ))}
          </div>
        ) : userAvatars.length > 0 || cloudAvatars.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Local avatars */}
            {userAvatars.map((avatar, idx) => {
              const s = STATUS_CONFIG[avatar.status] ?? STATUS_CONFIG.draft;
              return (
                <motion.div
                  key={avatar.id}
                  custom={idx}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="group cursor-pointer"
                  onClick={() => router.push(`/chat/${avatar.id}`)}
                >
                  <div className="relative rounded-xl border border-white/[0.07] overflow-hidden aspect-[4/3] bg-white/[0.02] hover:border-primary/30 transition-all duration-200 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    <Image
                      src={getAvatarImage(avatar.avatarName, avatar.avatarImageUrl)}
                      alt={avatar.avatarName}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    {/* Top-right badges */}
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      {avatar.convexPromptId && (
                        <span className="status-pill bg-purple-500/20 text-purple-300 border border-purple-500/20">
                          <Cloud className="h-2.5 w-2.5" /> Cloud
                        </span>
                      )}
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="text-base font-semibold text-white leading-tight">{avatar.avatarName}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`status-pill border ${s.bg} ${s.text} ${s.border}`}>
                          <span className={`status-pill-dot ${s.dot}`} />
                          {s.label}
                        </span>
                        <span className="text-xs text-white/35">{new Date(avatar.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Hover arrow */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="h-7 w-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <ArrowRight className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Cloud-only avatars */}
            {cloudAvatars
              .filter(c => !userAvatars.some(l => l.id === c.avatarId))
              .map((avatar, idx) => (
                <motion.div
                  key={avatar._id}
                  custom={userAvatars.length + idx}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="group cursor-pointer"
                  onClick={() => router.push(`/chat/${avatar.avatarId}`)}
                >
                  <div className="relative rounded-xl border border-white/[0.07] overflow-hidden aspect-[4/3] bg-white/[0.02] hover:border-primary/30 transition-all duration-200 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    <Image
                      src={getAvatarImage(avatar.avatarName, avatar.avatarImageUrl)}
                      alt={avatar.avatarName}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <span className="status-pill bg-purple-500/20 text-purple-300 border border-purple-500/20">
                        <Cloud className="h-2.5 w-2.5" /> Cloud
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h4 className="text-base font-semibold text-white leading-tight">{avatar.avatarName}</h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="status-pill border bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
                          <span className="status-pill-dot bg-emerald-400" />
                          Trained
                        </span>
                        {avatar.trainerName && (
                          <span className="text-xs text-white/35">by {avatar.trainerName}</span>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="h-7 w-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <ArrowRight className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        ) : (
          /* Empty state */
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] p-10 flex flex-col items-center justify-center text-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary/70" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/60">No avatars yet</p>
              <p className="text-xs text-white/30 mt-1 max-w-xs">Create your first avatar to begin personalised AI training and memory preservation.</p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push('/dashboard?view=create-avatar')}
              className="h-8 px-4 rounded-lg bg-primary/90 hover:bg-primary text-white text-xs border-0 shadow-[0_0_16px_rgba(0,102,255,0.25)]"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Avatar
            </Button>
          </div>
        )}
      </section>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <section>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white/80">Pending Invitations</h3>
            <p className="text-xs text-white/30 mt-0.5">{invitations.length} invitation{invitations.length !== 1 ? 's' : ''} waiting for your response</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {invitations.map((invite) => (
              <InvitationCard
                key={invite.id}
                {...invite}
                onAccept={() => handleAcceptInvitation(invite.id, invite.avatarName, invite.avatarImageUrl)}
                onReject={() => handleRejectInvitation(invite.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
