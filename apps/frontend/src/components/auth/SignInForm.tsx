'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/Logo";
import { GlowingButton } from "@/components/ui/glowing-button";
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://mimic-xt46.onrender.com";

type SignInFields = {
    email: string;
    password: string;
};

type AuthResponse = {
    token: string;
    user: Record<string, unknown>;
    message?: string;
    error?: string;
};

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Unable to sign in. Please try again.";
}

export function SignInForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<SignInFields>({
        email: "",
        password: "",
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                }),
            });

            const data = (await response.json().catch(() => ({}))) as Partial<AuthResponse>;

            if (!response.ok) {
                const message = data?.error || data?.message || "Invalid email or password.";
                throw new Error(message);
            }

            if (!data?.token || !data?.user) {
                throw new Error("Authentication response missing token or user data.");
            }

            if (typeof window !== "undefined") {
                window.localStorage.setItem("token", data.token);
                window.localStorage.setItem("user", JSON.stringify(data.user));
            }

            toast({
                title: "Welcome back!",
                description: "Redirecting to your dashboard.",
            });
            router.push("/dashboard");
        } catch (error) {
            toast({
                title: "Sign in failed",
                description: getErrorMessage(error),
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
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
