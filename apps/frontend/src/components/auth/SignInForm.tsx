'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useSignIn } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/Logo";
import { GlowingButton } from "@/components/ui/glowing-button";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type SignInFields = {
    email: string;
    password: string;
};

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
    const [formData, setFormData] = useState<SignInFields>({
        email: "",
        password: "",
    });

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

            toast({
                title: "Welcome back!",
                description: "Redirecting to your dashboard.",
            });
            router.push("/dashboard");
        } catch (error) {
            toast({
                title: "Sign in failed",
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
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/dashboard",
            });
        } catch (error) {
            setIsLoading(false);
            toast({
                title: "Google sign in failed",
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
                    <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
                    <CardDescription>Sign in with your email and password to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    value={formData.email}
                                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex justify-center">
                                <GlowingButton
                                    type="submit"
                                    text={isLoading ? "Signing in..." : "Sign In"}
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
                    <div className="mt-4 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" className="underline text-primary">
                            Create one
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
