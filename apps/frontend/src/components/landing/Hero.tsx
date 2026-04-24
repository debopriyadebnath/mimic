"use client"

import Link from "next/link"
import { Button } from "../ui/button"
import TerminalDemo from "@/components/terminal-demo"

export function Hero() {
  return (
    <section className="relative px-4 sm:px-6 pt-32 sm:pt-48 pb-24 sm:pb-32 flex flex-col items-center justify-center text-center min-h-[80vh]">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-6 animate-fade-in-up">
          <div className="inline-flex items-center rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            MIMIC v1.0 is now available
          </div>
          
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl text-foreground">
            Clone anyone, <br className="hidden sm:block" />
            <span className="text-muted-foreground">share their memories.</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg sm:text-xl leading-relaxed text-muted-foreground">
            Create a digital clone of your friends, relatives, or anyone. Preserve their memories, communication style, and interact with them anytime.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up stagger-2">
          <Link href="/signup" passHref>
            <Button variant="default" className="w-full sm:w-auto">
              Create Your Avatar
            </Button>
          </Link>
          <Link href="/signin" passHref>
            <Button variant="outline" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive terminal preview */}
      <div className="mt-24 w-full max-w-5xl mx-auto relative animate-fade-in-up stagger-3">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent blur-3xl -z-10 rounded-full opacity-50" />
        <TerminalDemo />
      </div>
    </section>
  )
}
