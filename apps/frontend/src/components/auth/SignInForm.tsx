'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useSignIn } from '@clerk/nextjs';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { GoogleIcon } from "@/components/shared/GoogleIcon";
import { cn } from "@/lib/utils";

type SignInFields = { email: string; password: string };

function getClerkError(error: unknown): string {
  if (typeof error === "object" && error && Array.isArray((error as any).errors)) {
    const messages = (error as any).errors
      .map((err: any) => err?.message || err?.longMessage)
      .filter(Boolean);
    if (messages.length > 0) return messages.join("\n");
  }
  if (error instanceof Error) return error.message;
  return "Unable to sign in. Please try again.";
}

export function SignInForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignInFields>({ email: "", password: "" });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      if (result.status !== "complete" || !result.createdSessionId) {
        throw new Error("Sign in requires additional verification.");
      }
      await setActive({ session: result.createdSessionId });
      toast({ title: "Welcome back!", description: "Redirecting to your dashboard." });
      router.push("/dashboard");
    } catch (error) {
      toast({ title: "Sign in failed", description: getClerkError(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (error) {
      setIsLoading(false);
      toast({ title: "Google sign in failed", description: getClerkError(error), variant: "destructive" });
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0a0a0e]/80 backdrop-blur-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_32px_80px_rgba(0,0,0,0.7)] p-8">

        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <Logo />
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold text-white tracking-tight">Welcome back</h1>
            <p className="text-sm text-white/40">Sign in to your account to continue</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-white/50 uppercase tracking-wider">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                className="pl-9 h-10 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-primary/50 focus:bg-white/[0.06] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-white/50 uppercase tracking-wider">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary/70 hover:text-primary transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                className="pl-9 h-10 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-primary/50 focus:bg-white/[0.06] transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:shadow-[0_0_28px_rgba(0,102,255,0.45)] transition-all duration-200 border-0 mt-2"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
            ) : (
              <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="divider-text my-5">or</div>

        {/* Google OAuth */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={isLoading}
          className="w-full h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-white/70 hover:text-white transition-all duration-200"
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-white/35">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary/80 hover:text-primary transition-colors font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
