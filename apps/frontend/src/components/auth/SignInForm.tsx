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

export function SignInForm() {
    const router = useRouter();
    const { toast } = useToast();
    const { isLoaded, signIn, setActive } = useSignIn();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        identifier: "",
        password: "",
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!isLoaded) return;
        setIsLoading(true);

        try {
            const attempt = await signIn.create({
                identifier: formData.identifier.trim(),
                password: formData.password,
            });

            if (attempt.status === "complete") {
                await setActive({ session: attempt.createdSessionId });
                toast({
                    title: "Welcome back!",
                    description: "You are now signed in.",
                });
                router.push("/dashboard");
                return;
            }

            toast({
                title: "Additional steps required",
                description: "Complete the pending verification to finish signing in.",
            });
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
                    <CardDescription>Continue with your username, email, or Google.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="identifier">Email or Username</Label>
                                <Input
                                    id="identifier"
                                    placeholder="you or you@example.com"
                                    required
                                    value={formData.identifier}
                                    onChange={(event) => setFormData({ ...formData, identifier: event.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="https://dashboard.clerk.com/forgot-password" className="ml-auto inline-block text-sm underline">
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
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
