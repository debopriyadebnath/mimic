"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Brain,
  Users,
  Rocket,
  UserPlus,
  MessageCircle,
  Database,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Search,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function DocsPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <Card className="card-glass border-primary/20 bg-primary/5">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline mb-2" style={{ color: 'var(--dynamic-text-color)' }}>
            EvoAvatar — User Guide
          </CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            Welcome to EvoAvatar, a platform where you can create a personal AI avatar that represents you and evolves over time using explicit, trusted memory.
          </CardDescription>
        </CardHeader>
      </Card>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* What is EvoAvatar */}
        <motion.div variants={item}>
          <Card className="card-glass">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Brain className="h-6 w-6 text-purple-500" />
                <CardTitle>What Is EvoAvatar?</CardTitle>
              </div>
              <CardDescription>
                EvoAvatar lets you create an AI version of yourself that is grounded in reality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  "Learns only from information you approve",
                  "Does not hallucinate or guess",
                  "Answers questions using stored memories",
                  "Reflects your personality, preferences, and opinions",
                  "Adwaits explicit 'I don't know' rather than guessing"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 bg-secondary/20 p-3 rounded-lg text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Roles */}
        <motion.div variants={item}>
          <Card className="card-glass">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-blue-500" />
                <CardTitle>User Roles</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                  Avatar Owner (You)
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                  <li>The person whose AI avatar is created</li>
                  <li>Full control over identity and memory</li>
                  <li>Can invite one trusted trainer</li>
                  <li>Approves the final personality</li>
                </ul>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <h3 className="font-semibold text-orange-500 flex items-center gap-2">
                  <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                  Trainer (Optional)
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
                  <li>A trusted person who helps define your personality</li>
                  <li>Accessed via a one‑time link</li>
                  <li>Can answer setup questions once</li>
                  <li>No long‑term access or editing rights</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Getting Started & Process */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <Card className="card-glass h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Rocket className="h-6 w-6 text-pink-500" />
                  <CardTitle>Getting Started</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground">Step 1: Sign In</h4>
                  <p className="text-sm">Log in using the available authentication method. You will land on your dashboard.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground">Step 2: Create Your Avatar</h4>
                  <p className="text-sm mb-2">Click "Create Avatar" and enter:</p>
                  <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                    <li>Avatar name</li>
                    <li>Short description about yourself</li>
                  </ul>
                  <p className="text-sm mt-2 text-green-500 font-medium">✨ Your avatar is now ready for interaction.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="card-glass h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <UserPlus className="h-6 w-6 text-indigo-500" />
                  <CardTitle>Trainer (Optional)</CardTitle>
                </div>
                <CardDescription>Improve accuracy with a trusted person.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <span className="text-sm font-medium">How It Works</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <p>1. Click "Invite Trainer"</p>
                      <p>2. A one‑time link is generated</p>
                      <p>3. Share the link with your friend/family</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <span className="text-sm font-medium">What the Trainer Does</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground space-y-2">
                      <p>• Verifies identity</p>
                      <p>• Answers a short MCQ form about you</p>
                      <p>• Submits once (cannot edit later)</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="bg-secondary/30 p-3 rounded-md text-xs">
                  <strong>Final Approval:</strong> You review the input, accept/edit/reject it, and lock the final personality.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Interaction Features */}
        <motion.div variants={item}>
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Interaction & Learning
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 border-b border-border/50 pb-2">
                  <MessageCircle className="h-4 w-4 text-blue-400" /> Chatting
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• Ask questions naturally</li>
                  <li>• The avatar responds <strong>only</strong> from stored memory</li>
                  <li>• Conversations are temporary and do not auto‑train the AI</li>
                  <li className="bg-secondary/20 p-2 rounded">
                    If it says <em>"I don't know yet"</em>, it means no relevant memory exists. This is intentional.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 border-b border-border/50 pb-2">
                  <Database className="h-4 w-4 text-green-400" /> Adding Memory
                </h3>
                <p className="text-sm text-muted-foreground">Your avatar learns only when you choose to teach it.</p>
                <div className="text-sm space-y-2">
                  <p><strong>How:</strong> Select "Save as Memory" during chat, or use text/voice input.</p>
                  <p><strong>What to add:</strong> Preferences, Opinions, Facts, Experiences.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Technical & Safety */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={item} className="md:col-span-1">
            <Card className="card-glass h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4 text-yellow-500" />
                  Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>When you ask a question:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>System searches memories</li>
                  <li>Finds most relevant matches</li>
                  <li>Answers <strong>only</strong> using those matches</li>
                  <li>Refuses to guess if no match found</li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="md:col-span-2">
            <Card className="card-glass h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  Privacy & Safety
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4 text-primary" /> Control
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• No automatic learning from chat</li>
                    <li>• No public access to your avatar</li>
                    <li>• Your identity remains under your control</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <XCircle className="h-4 w-4" /> AI Limitations
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Will NOT guess or hallucinate</li>
                    <li>• Will NOT learn without permission</li>
                    <li>• Will NOT override your preferences</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Best Practices & Help */}
        <motion.div variants={item}>
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Best Practices & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-3">Tips for Success</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    Add memories gradually
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    Use clear, factual inputs
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    Review trainer input carefully
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    Teach before expecting answers
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Common Messages</h4>
                <div className="space-y-3">
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <p className="text-sm font-medium">“I don’t know yet”</p>
                    <p className="text-xs text-muted-foreground mt-1">The avatar has no memory about this topic.</p>
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <p className="text-sm font-medium">Answers changed after memory</p>
                    <p className="text-xs text-muted-foreground mt-1">This means learning is working correctly.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Footer */}
        <motion.div variants={item} className="text-center py-8 text-muted-foreground">
          <p className="text-sm">EvoAvatar is a memory‑based AI • You control what it learns • Trust and accuracy come first</p>
        </motion.div>

      </motion.div>
    </div>
  );
}
