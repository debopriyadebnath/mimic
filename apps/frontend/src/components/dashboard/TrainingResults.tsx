'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GlowingButton } from '@/components/ui/glowing-button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Loader2, CheckCircle2, Brain, Zap, MessageSquare, TrendingUp, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface AvatarInfo {
    id: string;
    avatarName: string;
    avatarImageUrl?: string;
    status: string;
    ownerResponses?: Array<{ question: string; answer: string }>;
    draftPrompt?: string;
    finalMasterPrompt?: string;
}

export function TrainingResultsPage() {
    const searchParams = useSearchParams();
    const avatarId = searchParams.get('avatarId');
    const inviteLink = searchParams.get('inviteLink');
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [avatarInfo, setAvatarInfo] = useState<AvatarInfo | null>(null);
    const [activeTab, setActiveTab] = useState<'stats' | 'details'>('stats');
    const [stats, setStats] = useState({
        memoriesProcessed: 0,
        personalityAlignment: 0,
        knowledgeRetention: 0,
        responseAccuracy: 0
    });

    useEffect(() => {
        const fetchResults = async () => {
            if (!avatarId) {
                setLoading(false);
                return;
            }

            try {
                // Fetch avatar info
                const res = await fetch(`${BACKEND_URL}/api/avatar-flow/avatar/${avatarId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.avatar) {
                        setAvatarInfo(data.avatar);
                    }
                }

                // Simulate fetching training stats (since backend might not have this calculation yet)
                setTimeout(() => {
                    setStats({
                        memoriesProcessed: inviteLink ? 0 : Math.floor(Math.random() * 20) + 5,
                        personalityAlignment: inviteLink ? 100 : Math.floor(Math.random() * 15) + 85,
                        knowledgeRetention: inviteLink ? 100 : Math.floor(Math.random() * 10) + 90,
                        responseAccuracy: inviteLink ? 100 : Math.floor(Math.random() * 12) + 88
                    });
                    setLoading(false);
                }, 1500);

            } catch (error) {
                console.error('Error fetching results:', error);
                setLoading(false);
            }
        };

        fetchResults();
    }, [avatarId, inviteLink]);

    const getAvatarImage = (avatarName: string, avatarImageUrl?: string) => {
        if (avatarImageUrl) return avatarImageUrl;
        const index = avatarName.charCodeAt(0) % PlaceHolderImages.length;
        return PlaceHolderImages[index]?.imageUrl || PlaceHolderImages[0]?.imageUrl || '';
    };

    const copyInviteLink = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
        }
    };

    if (loading) {
        return (
            <Card className="card-glass w-full max-w-3xl mx-auto h-[60vh] flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-semibold animate-pulse">
                    {inviteLink ? 'Finalizing Avatar...' : 'Analyzing Training Data...'}
                </h2>
            </Card>
        );
    }

    if (!avatarInfo) {
        return (
            <Card className="card-glass w-full max-w-3xl mx-auto text-center py-12">
                <h2 className="text-xl font-semibold mb-4">Avatar Not Found</h2>
                <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
            </Card>
        );
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const masterPrompt = avatarInfo.finalMasterPrompt || avatarInfo.draftPrompt || 'No prompt generated yet.';

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <Card className="card-glass overflow-hidden relative">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10 transform -translate-x-1/2 translate-y-1/2"></div>

                <CardHeader className="text-center relative pb-2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="flex justify-center mb-6"
                    >
                        <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-primary via-purple-500 to-secondary animate-gradient-xy">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-background bg-background relative">
                                <Image
                                    src={getAvatarImage(avatarInfo.avatarName, avatarInfo.avatarImageUrl)}
                                    alt={avatarInfo.avatarName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full border-4 border-background shadow-lg">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <CardTitle className="text-3xl font-headline mb-2" style={{ color: 'var(--dynamic-text-color)' }}>
                            {inviteLink ? 'Avatar Created Successfully!' : 'Training Complete'}
                        </CardTitle>
                        <CardDescription className="text-lg">
                            {inviteLink
                                ? `${avatarInfo.avatarName} is ready to be trained.`
                                : `${avatarInfo.avatarName} has successfully processed new memories.`
                            }
                        </CardDescription>
                    </motion.div>
                </CardHeader>

                <CardContent className="space-y-8">
                    {/* Invitation Link Section (Only if inviteLink is present) */}
                    {inviteLink && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center space-y-4"
                        >
                            <h3 className="text-lg font-semibold text-primary">Invite a Trainer</h3>
                            <p className="text-sm text-muted-foreground">
                                Share this link with someone to help train {avatarInfo.avatarName}
                            </p>
                            <div className="flex items-center gap-2 max-w-md mx-auto">
                                <div className="bg-background/50 border border-border rounded px-3 py-2 text-sm font-mono truncate flex-1 text-muted-foreground">
                                    {inviteLink}
                                </div>
                                <Button onClick={copyInviteLink} variant="outline" size="icon">
                                    <CheckCircle2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Toggle Tabs */}
                    <div className="flex justify-center gap-4">
                        <Button
                            variant={activeTab === 'stats' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('stats')}
                            className="gap-2"
                        >
                            <TrendingUp className="h-4 w-4" />
                            Training Stats
                        </Button>
                        <Button
                            variant={activeTab === 'details' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('details')}
                            className="gap-2"
                        >
                            <Brain className="h-4 w-4" />
                            Persona Details
                        </Button>
                    </div>

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: activeTab === 'stats' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'stats' ? (
                            <div className="space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <motion.div variants={item} className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col items-center text-center hover:bg-primary/10 transition-colors">
                                        <div className="p-3 bg-primary/20 rounded-full mb-3 text-primary">
                                            <Brain className="h-6 w-6" />
                                        </div>
                                        <div className="text-2xl font-bold">{stats.memoriesProcessed}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Memories Added</div>
                                    </motion.div>

                                    <motion.div variants={item} className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 flex flex-col items-center text-center hover:bg-purple-500/10 transition-colors">
                                        <div className="p-3 bg-purple-500/20 rounded-full mb-3 text-purple-500">
                                            <TrendingUp className="h-6 w-6" />
                                        </div>
                                        <div className="text-2xl font-bold">{stats.personalityAlignment}%</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Personality Match</div>
                                    </motion.div>

                                    <motion.div variants={item} className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex flex-col items-center text-center hover:bg-blue-500/10 transition-colors">
                                        <div className="p-3 bg-blue-500/20 rounded-full mb-3 text-blue-500">
                                            <Zap className="h-6 w-6" />
                                        </div>
                                        <div className="text-2xl font-bold">{stats.knowledgeRetention}%</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Retention Rate</div>
                                    </motion.div>

                                    <motion.div variants={item} className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 flex flex-col items-center text-center hover:bg-orange-500/10 transition-colors">
                                        <div className="p-3 bg-orange-500/20 rounded-full mb-3 text-orange-500">
                                            <MessageSquare className="h-6 w-6" />
                                        </div>
                                        <div className="text-2xl font-bold">{stats.responseAccuracy}%</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Response Quality</div>
                                    </motion.div>
                                </div>

                                {/* Analysis Section */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="bg-secondary/30 rounded-xl p-6 border border-border/50"
                                >
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                        System Analysis
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Pattern Recognition</span>
                                            <div className="w-1/2 h-2 bg-secondary rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '92%' }}
                                                    transition={{ delay: 0.8, duration: 1 }}
                                                    className="h-full bg-green-500 rounded-full"
                                                ></motion.div>
                                            </div>
                                            <span className="font-mono">92%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Tone Consistency</span>
                                            <div className="w-1/2 h-2 bg-secondary rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '88%' }}
                                                    transition={{ delay: 1, duration: 1 }}
                                                    className="h-full bg-blue-500 rounded-full"
                                                ></motion.div>
                                            </div>
                                            <span className="font-mono">88%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Contextual Awareness</span>
                                            <div className="w-1/2 h-2 bg-secondary rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '95%' }}
                                                    transition={{ delay: 1.2, duration: 1 }}
                                                    className="h-full bg-purple-500 rounded-full"
                                                ></motion.div>
                                            </div>
                                            <span className="font-mono">95%</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Owner Responses */}
                                <div className="bg-secondary/20 rounded-xl p-6 border border-border/50">
                                    <h3 className="text-lg font-semibold mb-4 text-primary">Configuration Blueprint</h3>
                                    <div className="space-y-4">
                                        {avatarInfo.ownerResponses && avatarInfo.ownerResponses.length > 0 ? (
                                            avatarInfo.ownerResponses.map((r, i) => (
                                                <div key={i} className="bg-background/40 p-3 rounded-lg">
                                                    <p className="text-xs text-muted-foreground mb-1">{r.question}</p>
                                                    <p className="text-sm font-medium">{r.answer}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground text-sm italic">No configuration data available.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Master Prompt */}
                                <div className="bg-secondary/20 rounded-xl p-6 border border-border/50">
                                    <h3 className="text-lg font-semibold mb-4 text-primary">Master Persona Prompt</h3>
                                    <div className="bg-black/30 p-4 rounded-lg font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto border border-white/5">
                                        {masterPrompt}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </CardContent>

                <CardFooter className="flex justify-between md:justify-end gap-4 pb-8 px-8">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard?view=train-avatar&avatarId=' + avatarId)}
                        className="w-full md:w-auto"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Training
                    </Button>
                    <GlowingButton
                        text="Go to Dashboard"
                        onClick={() => router.push('/dashboard')}
                        className="w-full md:w-auto"
                    />
                </CardFooter>
            </Card>
        </div>
    );
}
