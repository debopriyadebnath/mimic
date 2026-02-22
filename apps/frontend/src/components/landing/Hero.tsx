"use client"

import Link from "next/link"
import { Button } from "../ui/button"

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

      {/* Minimalist visual element */}
      <div className="mt-24 w-full max-w-5xl mx-auto relative animate-fade-in-up stagger-3">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent blur-3xl -z-10 rounded-full opacity-50" />
        <div className="rounded-xl border border-border bg-card/40 backdrop-blur-md p-1 shadow-2xl">
          <div className="rounded-lg bg-background border border-border/50 overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-border/50 bg-secondary/30">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="w-3 h-3 rounded-full bg-border" />
              </div>
              <div className="mx-auto text-xs font-mono text-muted-foreground">mimic-terminal</div>
            </div>
            <div className="p-6 font-mono text-sm text-muted-foreground space-y-2">
              <div className="flex gap-4">
                <span className="text-primary">~</span>
                <span>mimic init --user "Alex"</span>
              </div>
              <div className="flex gap-4">
                <span className="text-transparent">~</span>
                <span>Initializing neural pathways... [OK]</span>
              </div>
              <div className="flex gap-4">
                <span className="text-transparent">~</span>
                <span>Syncing communication patterns... [OK]</span>
              </div>
              <div className="flex gap-4">
                <span className="text-transparent">~</span>
                <span>Avatar ready. Awaiting input.</span>
              </div>
              <div className="flex gap-4 pt-2">
                <span className="text-primary">~</span>
                <span className="animate-pulse">_</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
