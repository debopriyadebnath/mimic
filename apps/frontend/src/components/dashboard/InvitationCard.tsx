
"use client"

import { Button } from "../ui/button";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Check, X, UserCircle2 } from "lucide-react";

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
    toast({ title: "Invitation Accepted!", description: `Complete the questionnaire to begin training ${avatarName}.` });
    onAccept();
  };

  const handleReject = () => {
    toast({ title: "Invitation Rejected", variant: "destructive" });
    onReject();
  };

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] transition-all duration-200 overflow-hidden">
      {/* Avatar image strip */}
      <div className="relative h-32 w-full bg-white/[0.03]">
        <Image src={avatarImageUrl} alt={avatarName} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <h4 className="text-base font-semibold text-white leading-tight">{avatarName}</h4>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <UserCircle2 className="h-3.5 w-3.5 text-white/30 shrink-0" />
          <p className="text-xs text-white/50">
            <span className="text-white/70 font-medium">{fromUserName}</span> invited you to train this avatar
          </p>
        </div>
        <p className="text-xs text-white/35 leading-relaxed">
          Your unique perspective will directly influence how {avatarName} evolves and responds.
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            className="flex-1 h-8 rounded-lg border-red-500/25 bg-red-500/[0.06] hover:bg-red-500/15 text-red-400 hover:text-red-300 hover:border-red-500/40 transition-all text-xs font-medium"
          >
            <X className="h-3.5 w-3.5 mr-1" /> Decline
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="flex-1 h-8 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white border-0 shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all text-xs font-medium"
          >
            <Check className="h-3.5 w-3.5 mr-1" /> Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
