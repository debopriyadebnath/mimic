
"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

interface InvitationCardProps {
    avatarName: string;
    avatarImageUrl: string;
    fromUserName: string;
    onAccept: () => void;
    onReject: () => void;
}

export function InvitationCard({ avatarName, avatarImageUrl, fromUserName, onAccept, onReject }: InvitationCardProps) {
    const { toast } = useToast();

    const handleAccept = () => {
        toast({
            title: "Invitation Accepted!",
            description: `Please complete the questionnaire to begin training ${avatarName}.`
        });
        onAccept();
    }

    const handleReject = () => {
        toast({
            title: "Invitation Rejected",
            variant: "destructive",
        });
        onReject();
    }

    return (
        <Card className="card-glass flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline" style={{ color: 'var(--dynamic-text-color)' }}>{avatarName}</CardTitle>
                <CardDescription>
                    {fromUserName} has invited you to train this avatar. Establish a unique 1:1 connection to help shape its personality.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col items-center justify-center gap-4">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-primary/50 shadow-lg shadow-primary/20">
                    <Image src={avatarImageUrl} alt={avatarName} fill className="object-cover" />
                </div>
                <p className="text-sm text-center text-muted-foreground px-4">
                    Your unique perspective will directly influence how {avatarName} evolves and responds.
                </p>
            </CardContent>
            <CardFooter className="flex justify-between gap-4 pt-4">
                <Button
                    variant="outline"
                    onClick={handleReject}
                    className="flex-1 border-red-500/50 hover:bg-red-500/20 hover:text-red-500 text-red-400 transition-all duration-300"
                >
                    <X className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button
                    onClick={handleAccept}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-[0_0_15px_rgba(22,163,74,0.5)] hover:shadow-[0_0_25px_rgba(22,163,74,0.6)] transition-all duration-300 border-none"
                >
                    <Check className="mr-2 h-4 w-4" /> Accept
                </Button>
            </CardFooter>
        </Card>
    );
}
