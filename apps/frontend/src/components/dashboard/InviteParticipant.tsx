"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { Copy, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

interface Invitation {
    token: string;
    avatarName: string;
    createdAt: string;
    expiresAt: string;
    used: boolean;
    masterPrompt?: string;
}

export function InviteParticipantPage() {
    const { toast } = useToast();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            const response = await fetch('/api/invitations');
            const data = await response.json();
            setInvitations(data.invitations || []);
        } catch (error) {
            console.error('Error fetching invitations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (token: string) => {
        const link = `${window.location.origin}/invite/${token}`;
        navigator.clipboard.writeText(link);
        toast({
            title: "Link Copied!",
            description: "The invitation link has been copied to your clipboard.",
        });
    };

    const getInvitationStatus = (invitation: Invitation) => {
        if (invitation.used) {
            return { status: 'completed', icon: CheckCircle, color: 'text-green-500', label: 'Completed' };
        }
        if (new Date(invitation.expiresAt) < new Date()) {
            return { status: 'expired', icon: XCircle, color: 'text-red-500', label: 'Expired' };
        }
        return { status: 'pending', icon: Clock, color: 'text-yellow-500', label: 'Pending' };
    };

    const formatTimeRemaining = (expiresAt: string) => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
    };

    return (
        <div className="space-y-6 w-full max-w-4xl mx-auto">
            {/* Existing Invitations */}
            <Card className="card-glass">
                <CardHeader>
                    <CardTitle className="font-headline" style={{ color: 'var(--dynamic-text-color)' }}>
                        Your Invitations
                    </CardTitle>
                    <CardDescription>
                        Manage and track your invitation links.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : invitations.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No invitations found. Create one from the "Create Avatar" page.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {invitations.map((invitation) => {
                                const statusInfo = getInvitationStatus(invitation);
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <div
                                        key={invitation.token}
                                        className="p-4 rounded-lg border border-border bg-secondary/30"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium truncate">{invitation.avatarName}</h4>
                                                    <Badge variant={
                                                        statusInfo.status === 'completed' ? 'default' :
                                                            statusInfo.status === 'expired' ? 'destructive' : 'secondary'
                                                    }>
                                                        <StatusIcon className={`h-3 w-3 mr-1 ${statusInfo.color}`} />
                                                        {statusInfo.label}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Created: {new Date(invitation.createdAt).toLocaleString()}
                                                </p>
                                                {statusInfo.status === 'pending' && (
                                                    <p className="text-xs text-yellow-500">
                                                        {formatTimeRemaining(invitation.expiresAt)}
                                                    </p>
                                                )}
                                                {invitation.masterPrompt && (
                                                    <details className="mt-2">
                                                        <summary className="text-xs text-primary cursor-pointer hover:underline">
                                                            View Master Prompt
                                                        </summary>
                                                        <p className="mt-2 text-xs text-muted-foreground p-2 bg-background/50 rounded">
                                                            {invitation.masterPrompt}
                                                        </p>
                                                    </details>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                {statusInfo.status === 'pending' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(invitation.token)}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

