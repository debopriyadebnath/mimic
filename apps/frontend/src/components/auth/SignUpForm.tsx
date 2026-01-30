'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useSignUp } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/Logo";
import { GlowingButton } from "@/components/ui/glowing-button";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type SignUpFields = {
    username: string;
    email: string;
    password: string;
};

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
    const [formData, setFormData] = useState<SignUpFields>({
        username: "",
        email: "",
        password: "",
    });

    const updateField = (field: keyof SignUpFields, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

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
                toast({
                    title: "Success!",
                    description: "Your account is ready.",
                });
                router.push("/dashboard");
                return;
            }

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setIsVerificationStep(true);
            toast({
                title: "Verify your email",
                description: "We just sent a 6-digit code to your inbox.",
            });
        } catch (error) {
            toast({
                title: "Sign up failed",
                description: getClerkError(error),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isLoaded) return;
        setIsLoading(true);

        try {
            const verification = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            });

            if (verification.status === "complete") {
                await setActive({ session: verification.createdSessionId });
                toast({
                    title: "Email verified",
                    description: "Welcome aboard!",
                });
                router.push("/dashboard");
                return;
            }

            toast({
                title: "Verification pending",
                description: "Please complete the remaining steps in your email.",
            });
        } catch (error) {
            toast({
                title: "Verification failed",
                description: getClerkError(error),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!isLoaded) return;
        setIsLoading(true);
        try {
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            toast({
                title: "Code resent",
                description: "Check your email for a fresh verification code.",
            });
        } catch (error) {
            toast({
                title: "Unable to resend",
                description: getClerkError(error),
                variant: "destructive",
            });
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
            toast({
                title: "Google sign up failed",
                description: getClerkError(error),
                variant: "destructive",
            });
        }
    };

    return (
        <div className="w-full max-w-md">
            <Card className="mx-auto max-w-sm bg-neutral-900/90 border-border/60">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4"><Logo /></div>
                    <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
                    <CardDescription>Sign up with your email, username, or Google.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isVerificationStep ? (
                        <form onSubmit={handleVerifyCode}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="verification-code">Verification Code</Label>
                                    <Input
                                        id="verification-code"
                                        inputMode="numeric"
                                        pattern="[0-9]{6}"
                                        placeholder="123456"
                                        required
                                        value={verificationCode}
                                        onChange={(event) => setVerificationCode(event.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <GlowingButton
                                        type="submit"
                                        text={isLoading ? "Verifying..." : "Verify Email"}
                                        disabled={isLoading || verificationCode.length === 0}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleResendCode}
                                    disabled={isLoading}
                                >
                                    Resend code
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="splitsbinson"
                                        required
                                        value={formData.username}
                                        onChange={(event) => updateField("username", event.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={formData.email}
                                        onChange={(event) => updateField("email", event.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        minLength={8}
                                        value={formData.password}
                                        onChange={(event) => updateField("password", event.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <GlowingButton
                                        type="submit"
                                        text={isLoading ? "Creating account..." : "Create Account"}
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGoogle}
                                    disabled={isLoading}
                                >
                                    Continue with Google
                                </Button>
                            </div>
                        </form>
                    )}
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/signin" className="underline text-primary">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
