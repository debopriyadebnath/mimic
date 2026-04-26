'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useSignUp } from '@clerk/nextjs';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { GoogleIcon } from "@/components/shared/GoogleIcon";

type SignUpFields = { username: string; email: string; password: string };

function getClerkError(error: unknown): string {
  if (typeof error === "object" && error && Array.isArray((error as any).errors)) {
    const messages = (error as any).errors
      .map((err: any) => err?.message)
      .filter(Boolean);
    if (messages.length > 0) return messages.join("\n");
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [formData, setFormData] = useState<SignUpFields>({ username: "", email: "", password: "" });

  const updateField = (field: keyof SignUpFields, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const attempt = await signUp.create({
        username: formData.username.trim(),
        emailAddress: formData.email.trim(),
        password: formData.password,
      });
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        toast({ title: "Success!", description: "Your account is ready." });
        router.push("/dashboard");
        return;
      }
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setIsVerificationStep(true);
      toast({ title: "Verify your email", description: "We sent a 6-digit code to your inbox." });
    } catch (error) {
      toast({ title: "Sign up failed", description: getClerkError(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const verification = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (verification.status === "complete") {
        await setActive({ session: verification.createdSessionId });
        toast({ title: "Email verified", description: "Welcome aboard!" });
        router.push("/dashboard");
        return;
      }
      toast({ title: "Verification pending", description: "Please complete the remaining steps in your email." });
    } catch (error) {
      toast({ title: "Verification failed", description: getClerkError(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast({ title: "Code resent", description: "Check your email for a fresh verification code." });
    } catch (error) {
      toast({ title: "Unable to resend", description: getClerkError(error), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (error) {
      setIsLoading(false);
      toast({ title: "Google sign up failed", description: getClerkError(error), variant: "destructive" });
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/[0.07] bg-[#0a0a0e]/80 backdrop-blur-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_32px_80px_rgba(0,0,0,0.7)] p-8">

        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <Logo />
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              {isVerificationStep ? "Verify your email" : "Create an account"}
            </h1>
            <p className="text-sm text-white/40">
              {isVerificationStep
                ? "Enter the 6-digit code we sent to your inbox"
                : "Sign up with your details or continue with Google"}
            </p>
          </div>
        </div>

        {isVerificationStep ? (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-medium text-white/50 uppercase tracking-wider">Verification code</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                <Input
                  id="code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  placeholder="123456"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isLoading}
                  className="pl-9 h-10 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-primary/50 transition-all text-center tracking-[0.4em] text-lg font-mono"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || verificationCode.length === 0}
              className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:shadow-[0_0_28px_rgba(0,102,255,0.45)] transition-all duration-200 border-0"
            >
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</> : <>Verify email <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleResendCode}
              disabled={isLoading}
              className="w-full h-9 text-white/40 hover:text-white/70 text-sm"
            >
              Resend code
            </Button>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-medium text-white/50 uppercase tracking-wider">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                  <Input
                    id="username"
                    placeholder="splitsbinson"
                    required
                    value={formData.username}
                    onChange={(e) => updateField("username", e.target.value)}
                    disabled={isLoading}
                    className="pl-9 h-10 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

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
                    onChange={(e) => updateField("email", e.target.value)}
                    disabled={isLoading}
                    className="pl-9 h-10 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-white/50 uppercase tracking-wider">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    disabled={isLoading}
                    className="pl-9 h-10 rounded-lg bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:shadow-[0_0_28px_rgba(0,102,255,0.45)] transition-all duration-200 border-0 mt-1"
              >
                {isLoading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</>
                  : <>Create account <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>

            <div className="divider-text my-5">or</div>

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
          </>
        )}

        <p className="mt-6 text-center text-sm text-white/35">
          Already have an account?{" "}
          <Link href="/signin" className="text-primary/80 hover:text-primary transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
