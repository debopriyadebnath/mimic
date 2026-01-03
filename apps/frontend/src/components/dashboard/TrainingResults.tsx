'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, CheckCircle, Clock, XCircle, Loader2, RefreshCw, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface TrainerResponse {
  question: string;
  answer: string;
  note?: string;
}

interface CompletedTraining {
  invitationId: string;
  avatarId: string;
  avatarName: string;
  status: string;
  submittedAt: string | null;
  trainerResponses: TrainerResponse[];
  finalMasterPrompt: string;
  ownerResponses: Array<{ question: string; answer: string }>;
}

interface PendingInvitation {
  invitationId: string;
  avatarId: string;
  avatarName: string;
  status: string;
  trainerName?: string;
  acceptedAt?: string | null;
  expiresAt: string;
  token: string;
}

export function TrainingResultsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [completedTrainings, setCompletedTrainings] = useState<CompletedTraining[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<CompletedTraining | null>(null);

  useEffect(() => {
    fetchTrainerInfo();
  }, []);

  const fetchTrainerInfo = async () => {
    setLoading(true);
    try {
      const ownerId = localStorage.getItem('ownerId');
      
      if (!ownerId) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${BACKEND_URL}/api/avatar-flow/trainer-info/${ownerId}`);
      const data = await res.json();

      if (data.success) {
        setCompletedTrainings(data.completedTrainings || []);
        setPendingInvitations(data.pendingInvitations || []);
      }
    } catch (error) {
      console.error('Error fetching trainer info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load training data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/trainer-invite/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Copied!',
      description: 'Invitation link copied to clipboard',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--dynamic-text-color)' }}>Training Results</h2>
          <p className="text-muted-foreground">View completed and pending avatar trainings</p>
        </div>
        <Button variant="outline" onClick={fetchTrainerInfo}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Completed Trainings */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Completed Trainings
          </CardTitle>
          <CardDescription>
            Trainings that have been completed with master prompts generated
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedTrainings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No completed trainings yet. Share an invitation link to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {completedTrainings.map((training) => (
                <div
                  key={training.invitationId}
                  className="p-4 rounded-lg border border-border bg-secondary/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{training.avatarName}</h4>
                        {getStatusBadge(training.status)}
                      </div>
                      {training.submittedAt && (
                        <p className="text-xs text-muted-foreground">
                          Completed: {new Date(training.submittedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTraining(training)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{training.avatarName} - Training Details</DialogTitle>
                          <DialogDescription>
                            View the complete training data and master prompt
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          {/* Owner Responses */}
                          <div>
                            <h4 className="font-semibold mb-2">Owner Configuration</h4>
                            <div className="space-y-2">
                              {training.ownerResponses?.map((resp, idx) => (
                                <div key={idx} className="p-2 bg-secondary/50 rounded text-sm">
                                  <p className="font-medium">{resp.question}</p>
                                  <p className="text-muted-foreground">{resp.answer}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Trainer Responses */}
                          <div>
                            <h4 className="font-semibold mb-2">Trainer Responses</h4>
                            <div className="space-y-2">
                              {training.trainerResponses?.map((resp, idx) => (
                                <div key={idx} className="p-2 bg-secondary/50 rounded text-sm">
                                  <p className="font-medium">{resp.question}</p>
                                  <p className="text-muted-foreground">{resp.answer}</p>
                                  {resp.note && (
                                    <p className="text-xs text-primary mt-1">Note: {resp.note}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Final Master Prompt */}
                          <div>
                            <h4 className="font-semibold mb-2">Generated Master Prompt</h4>
                            <pre className="p-3 bg-secondary/50 rounded text-xs whitespace-pre-wrap overflow-x-auto max-h-64">
                              {training.finalMasterPrompt}
                            </pre>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Pending & In-Progress Invitations
          </CardTitle>
          <CardDescription>
            Active invitation links waiting for trainer response
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingInvitations.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending invitations. Create an avatar to generate an invitation link.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.invitationId}
                  className="p-4 rounded-lg border border-border bg-secondary/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{invitation.avatarName}</h4>
                        {getStatusBadge(invitation.status)}
                      </div>
                      {invitation.status === 'accepted' && invitation.trainerName && (
                        <p className="text-sm text-primary mb-1">
                          Trainer: <span className="font-medium">{invitation.trainerName}</span>
                          {invitation.acceptedAt && (
                            <span className="text-muted-foreground ml-2">
                              (accepted {new Date(invitation.acceptedAt).toLocaleString()})
                            </span>
                          )}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(invitation.expiresAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInviteLink(invitation.token)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
