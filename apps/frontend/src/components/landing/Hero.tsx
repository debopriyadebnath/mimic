"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { GlowingButton } from "../ui/glowing-button"

const roles = [
  "privacy-first memories",
  "trusted identities",
  "explainable decisions",
  "trust-weighted recall",
  "reduced hallucination",
]

export function Hero() {
  const [currentRole, setCurrentRole] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const targetText = roles[currentRole]
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < targetText.length) {
            setDisplayText(targetText.slice(0, displayText.length + 1))
          } else {
            setTimeout(() => setIsDeleting(true), 2000)
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1))
          } else {
            setIsDeleting(false)
            setCurrentRole((prev) => (prev + 1) % roles.length)
          }
        }
      },
      isDeleting ? 30 : 60,
    )
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentRole])

   return (
    <section className="relative px-4 sm:px-6 pt-20 sm:pt-24 pb-16 sm:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 lg:items-center lg:min-h-[70vh]">
          {/* Left column - Text */}
          <div className="space-y-8 sm:space-y-10">
            <div className="space-y-3 animate-fade-in-up">
              <p className="font-mono text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em] text-primary">
                Mimic — Privacy‑First AI Avatars
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl text-balance">
                Build an AI that
                <br />
                <span className="text-foreground">
                  {displayText || <>&nbsp;</>}
                  <span className="animate-blink">|</span>
                </span>
              </h1>
            </div>

            <p className="max-w-lg text-base sm:text-lg leading-relaxed text-muted-foreground animate-fade-in-up stagger-2">
              Create a personal AI identity that only learns what you explicitly add. Store memories as embeddings, recall the most relevant trust‑weighted items, and generate responses grounded in explainable facts — not passive data.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-3">
              <GlowingButton text="Create Your Avatar" href="/signup" />
              <GlowingButton text="Explore Demo" href="/demo" />
            </div>
          </div>

          {/* Right column - ASCII Art / Visual */}
          <div className="relative animate-scale-in stagger-4">
            <div className="relative rounded-xl border border-border bg-card/60 p-5 sm:p-8">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/60 transition-colors hover:bg-destructive" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/60 transition-colors hover:bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-primary/60 transition-colors hover:bg-primary" />
              </div>
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 bg-background/50 rounded-md px-3 py-1 font-mono text-xs text-muted-foreground">
                terminal://mimic
              </div>

              <pre className="mt-6 overflow-hidden font-mono text-primary/80">
                <code className="sm:hidden block text-xs leading-relaxed">{`┌───────────────────────┐
│  > memories: 8        │
│  > trust-weighted     │
│  > convo: ephemeral    │
│  > provenance: on      │
└───────────────────────┘`}</code>
                <code className="hidden sm:block text-xs md:text-sm leading-relaxed" style={{color: 'var(--dynamic-text-color)'}}>{`┌──────────────────────────────────────────────────┐
│                                                  │
│    Mimic — Privacy‑First AI Avatars               │
│                                                  │
│     > memories_stored: 8                          │
│     > retrieval: vector-similarity                │
│     > trust_mode: enabled                         │
│     > convo_persistence: ephemeral                │
│     > explainability: shown in responses          │
│                                                  │
└──────────────────────────────────────────────────┘`}</code>
              </pre>
            </div>

            <div className="absolute -right-2 sm:-right-6 -top-2 sm:-top-6 rounded-lg border border-primary/40 bg-primary/15 px-3 sm:px-4 py-1.5 font-mono text-[11px] sm:text-xs text-primary animate-float">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                v1.0.0
              </span>
            </div>
            <div
              className="absolute -bottom-3 sm:-bottom-6 -left-2 sm:-left-6 rounded-lg border border-border bg-card px-3 sm:px-4 py-1.5 font-mono text-[11px] sm:text-xs text-muted-foreground animate-float"
              style={{ animationDelay: "1s" }}
            >
              Privacy‑first
            </div>

            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full bg-primary/5 blur-3xl" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 animate-fade-in stagger-6">
        <span className="font-mono text-xs text-muted-foreground">scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-primary/50 to-transparent animate-pulse" />
      </div>
    </section>
  )
}
