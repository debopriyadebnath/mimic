
"use client";

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { GlowingButton } from '../ui/glowing-button';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { UploadCloud, Copy, Clock, Check } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const avatars = PlaceHolderImages.filter(p => p.id.startsWith('avatar-'));

const questions = [
    { id: 'q1', label: 'What is the avatar\'s primary function or purpose?', placeholder: 'e.g., A helpful assistant, a creative partner, a guardian...' },
    { id: 'q2', label: 'Describe the avatar\'s personality in three words.', placeholder: 'e.g., Curious, witty, and loyal' },
    { id: 'q3', label: 'What is a core value or principle the avatar follows?', placeholder: 'e.g., Always seek the truth, protect its user at all costs...' },
];

export function CreateAvatarPage() {
    const [step, setStep] = useState(1);
    const [avatarName, setAvatarName] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
    const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
    const [invitationLink, setInvitationLink] = useState('');
    const [expirationHours, setExpirationHours] = useState("2");
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setUploadedAvatar(dataUrl);
                setSelectedAvatar(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateLink = async () => {
        if (!avatarName || !selectedAvatar || !ownerName || Object.values(answers).some(a => !a)) {
            toast({
                title: "Incomplete Form",
                description: "Please fill out all fields including your name before generating.",
                variant: "destructive",
            });
            return;
        }

        setIsGenerating(true);
        toast({
            title: "Generating Invitation Link...",
            description: "Creating the avatar draft...",
        });

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            
            // Use a consistent owner ID (in production, get from auth)
            const ownerId = localStorage.getItem('ownerId') || 'owner-' + Date.now();
            localStorage.setItem('ownerId', ownerId);
            localStorage.setItem('ownerName', ownerName);
            if (ownerEmail) localStorage.setItem('ownerEmail', ownerEmail);

            // Step 1: Create draft avatar with owner's responses
            const ownerResponses = [
                { question: questions[0].label, answer: answers.q1 },
                { question: questions[1].label, answer: answers.q2 },
                { question: questions[2].label, answer: answers.q3 },
            ];

            const draftRes = await fetch(`${backendUrl}/api/avatar-flow/create-draft`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ownerId,
                    ownerName,
                    ownerEmail,
                    avatarName,
                    ownerResponses,
                }),
            });

            const draftData = await draftRes.json();

            if (!draftRes.ok) {
                throw new Error(draftData.error || 'Failed to create draft');
            }

            // Step 2: Generate trainer invitation link
            const inviteRes = await fetch(`${backendUrl}/api/avatar-flow/generate-invite`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    avatarId: draftData.avatarId,
                    avatarName: draftData.avatarName,
                    ownerId,
                    expiresInHours: parseFloat(expirationHours),
                }),
            });

            const inviteData = await inviteRes.json();

            if (!inviteRes.ok) {
                throw new Error(inviteData.error || 'Failed to generate invite');
            }

            setInvitationLink(inviteData.invitation.inviteUrl);
            setStep(4);
            toast({
                title: "Invitation Ready!",
                description: "Link generated successfully. Copy and share it!",
            });
        } catch (error) {
            console.error('Generation error:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to generate invitation link.",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(invitationLink);
        toast({
            title: "Copied!",
            description: "Invitation link copied to clipboard.",
        });
    };

    const handleRestart = () => {
        setStep(1);
        setAvatarName('');
        setOwnerName('');
        setOwnerEmail('');
        setSelectedAvatar('');
        setUploadedAvatar(null);
        setAnswers({ q1: '', q2: '', q3: '' });
        setInvitationLink('');
        setIsGenerating(false);
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                        <CardHeader>
                            <CardTitle style={{ color: 'var(--dynamic-text-color)' }}>Step 1: Your Information</CardTitle>
                            <CardDescription>Enter your details and name the avatar you're creating.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="ownerName">Your Name *</Label>
                                <Input 
                                    id="ownerName" 
                                    value={ownerName} 
                                    onChange={(e) => setOwnerName(e.target.value)} 
                                    placeholder="e.g., John Smith" 
                                    className="bg-transparent mt-2" 
                                />
                            </div>
                            <div>
                                <Label htmlFor="ownerEmail">Your Email (optional)</Label>
                                <Input 
                                    id="ownerEmail" 
                                    type="email"
                                    value={ownerEmail} 
                                    onChange={(e) => setOwnerEmail(e.target.value)} 
                                    placeholder="e.g., john@example.com" 
                                    className="bg-transparent mt-2" 
                                />
                            </div>
                            <div>
                                <Label htmlFor="avatarName">Avatar Name *</Label>
                                <Input 
                                    id="avatarName" 
                                    value={avatarName} 
                                    onChange={(e) => setAvatarName(e.target.value)} 
                                    placeholder="e.g., Neo, Aura, K.A.I." 
                                    className="bg-transparent mt-2" 
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <GlowingButton text="Next" onClick={handleNext} disabled={!avatarName || !ownerName} />
                        </CardFooter>
                    </motion.div>
                );
            case 2:
                // ... same as before ...
                return (
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                        <CardHeader>
                            <CardTitle style={{ color: 'var(--dynamic-text-color)' }}>Step 2: Choose Its Appearance</CardTitle>
                            <CardDescription>Select a base visual form for the avatar, or upload your own.</CardDescription>
                        </CardHeader>
                        <CardContent className="max-h-[50vh] overflow-y-auto">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                <label htmlFor="avatar-upload" className="relative aspect-square w-full rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-muted-foreground hover:bg-accent/10 hover:border-primary cursor-pointer transition-all">
                                    <UploadCloud className="h-8 w-8" />
                                    <span className="text-xs mt-2 text-center">Upload Your Own</span>
                                    <input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                                </label>
                                {uploadedAvatar && (
                                    <button
                                        onClick={() => setSelectedAvatar(uploadedAvatar)}
                                        className={cn("relative aspect-square w-full rounded-lg overflow-hidden border-2 transition-all",
                                            selectedAvatar === uploadedAvatar ? 'border-primary ring-2 ring-primary/50' : 'border-border/50 hover:border-primary'
                                        )}
                                    >
                                        <Image src={uploadedAvatar} alt="Uploaded Avatar" fill className="object-cover" />
                                        {selectedAvatar === uploadedAvatar && <div className="absolute inset-0 bg-primary/50" />}
                                    </button>
                                )}
                                {avatars.map(avatar => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => setSelectedAvatar(avatar.imageUrl)}
                                        className={cn("relative aspect-square w-full rounded-lg overflow-hidden border-2 transition-all",
                                            selectedAvatar === avatar.imageUrl ? 'border-primary ring-2 ring-primary/50' : 'border-border/50 hover:border-primary'
                                        )}
                                    >
                                        <Image src={avatar.imageUrl} alt={avatar.imageHint || 'Avatar image'} fill className="object-cover" data-ai-hint={avatar.imageHint} unoptimized />
                                        {selectedAvatar === avatar.imageUrl && <div className="absolute inset-0 bg-primary/50" />}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between">
                            <Button variant="ghost" onClick={handleBack}>Back</Button>
                            <GlowingButton text="Next" onClick={handleNext} disabled={!selectedAvatar} />
                        </CardFooter>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
                        <CardHeader>
                            <CardTitle style={{ color: 'var(--dynamic-text-color)' }}>Step 3: Define & Configure</CardTitle>
                            <CardDescription>Answer these questions and set invitation settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {questions.map(q => (
                                <div key={q.id} className="grid w-full items-center gap-1.5">
                                    <Label htmlFor={q.id}>{q.label}</Label>
                                    <Textarea id={q.id} value={answers[q.id as keyof typeof answers]} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder={q.placeholder} className="bg-transparent" />
                                </div>
                            ))}

                            <div className="grid w-full items-center gap-1.5 pt-4 border-t border-border/50">
                                <Label htmlFor="expiration" className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" /> Link Expiration
                                </Label>
                                <Select value={expirationHours} onValueChange={setExpirationHours}>
                                    <SelectTrigger className="w-full bg-transparent">
                                        <SelectValue placeholder="Select duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0.5">30 Minutes</SelectItem>
                                        <SelectItem value="1">1 Hour</SelectItem>
                                        <SelectItem value="1.5">1.5 Hours</SelectItem>
                                        <SelectItem value="2">2 Hours</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">The invitation link will become invalid after this time.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between">
                            <Button variant="ghost" onClick={handleBack} disabled={isGenerating}>Back</Button>
                            <GlowingButton
                                text={isGenerating ? "Generating..." : "Generate Invite Link"}
                                onClick={handleGenerateLink}
                                disabled={isGenerating || !avatarName || !selectedAvatar || !answers.q1 || !answers.q2 || !answers.q3}
                            />
                        </CardFooter>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8">
                        <CardTitle className="text-2xl font-headline mb-4" style={{ color: 'var(--dynamic-text-color)' }}>Invitation Ready!</CardTitle>
                        <CardDescription className="mb-6">The avatar, {avatarName}, has been created for your participant.</CardDescription>
                        <div className="relative aspect-square max-w-xs mx-auto rounded-lg overflow-hidden border-2 border-primary shadow-2xl shadow-primary/20 mb-8">
                            {selectedAvatar && <Image src={selectedAvatar} alt="Final Avatar" fill className="object-cover" unoptimized />}
                        </div>
                        <div className='flex flex-col items-center gap-4 w-full max-w-md mx-auto'>
                            <p className='text-sm text-muted-foreground'>Share this link with your participant:</p>

                            <div className="flex items-center w-full gap-2">
                                <Input value={invitationLink} readOnly className="bg-secondary/50 font-mono text-sm" />
                                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>

                            <Button variant="ghost" onClick={handleRestart} className="mt-4">Create Another</Button>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <Card className="card-glass w-full max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
                <motion.div key={step}>
                    {renderStep()}
                </motion.div>
            </AnimatePresence>
        </Card>
    );
}

