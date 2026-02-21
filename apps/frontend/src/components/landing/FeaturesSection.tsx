import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Brain, Database, MessageSquare, Shield } from "lucide-react";

const features = [
  {
    icon: <Brain className="w-5 h-5 text-primary" />,
    title: "Continuous Learning",
    description: "Your avatar learns and evolves from every text and voice interaction, growing more personalized over time.",
  },
  {
    icon: <Database className="w-5 h-5 text-primary" />,
    title: "Structured Memory",
    description: "Opinions, preferences, and behaviors are stored as structured memories, enabling complex and consistent personality traits.",
  },
  {
    icon: <MessageSquare className="w-5 h-5 text-primary" />,
    title: "Engaging Chat Interface",
    description: "Converse with your avatar, provide feedback, and watch its personality unfold in a seamless chat experience.",
  },
  {
    icon: <Shield className="w-5 h-5 text-primary" />,
    title: "Privacy First",
    description: "With a strict one-to-one training model, your digital identity is shaped only by those you trust. No crowdsourcing, no data leaks.",
  },
];

export function FeaturesSection() {
    return (
        <section className="w-full py-24 md:py-32 bg-background">
            <div className="container px-4 md:px-6 mx-auto max-w-6xl">
                <div className="flex flex-col items-start space-y-4 mb-16">
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
                        A New Era of Digital Identity
                    </h2>
                    <p className="max-w-[680px] text-muted-foreground text-lg">
                        MIMIC isn't just another chatbot. It's a suite of powerful, privacy-focused features designed to create a true digital extension of yourself.
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
                    {features.map((feature, index) => (
                        <div 
                            key={index} 
                            className="group relative rounded-xl border border-border bg-card p-6 sm:p-8 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:border-border/80"
                        >
                            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50 border border-border/50">
                                {feature.icon}
                            </div>
                            <h3 className="mb-2 text-lg font-medium text-foreground">
                                {feature.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
