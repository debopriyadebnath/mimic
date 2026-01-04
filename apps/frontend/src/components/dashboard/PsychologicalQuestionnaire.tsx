
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GlowingButton } from '../ui/glowing-button';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';

const questions = [
  {
    id: 'q1',
    text: 'When you’re stressed or overwhelmed, what do you usually do first?',
    description: 'Reveals coping style and emotional regulation',
    options: [
      'Take a short break to calm down',
      'Distract myself with entertainment or social media',
      'Talk to someone I trust',
      'Try to organize tasks or make a plan',
      'Push through and deal with it later',
      'Withdraw or rest until it passes',
    ]
  },
  {
    id: 'q2',
    text: 'What kind of activities make you lose track of time?',
    description: 'Shows genuine interests and intrinsic motivation',
    options: [
      'Creative work (designing, writing, music, art)',
      'Learning or researching new topics',
      'Coding, problem-solving, or building things',
      'Social activities and conversations',
      'Gaming, watching content, or entertainment',
      'Physical activities or sports',
    ]
  },
  {
    id: 'q3',
    text: 'How do you usually make important decisions?',
    description: 'Indicates decision-making style and independence',
    options: [
      'Mostly logical analysis and facts',
      'Strong intuition or gut feeling',
      'Advice from people I trust',
      'A balance of logic and intuition',
      'Trial and error—learn as I go',
      'I delay decisions until I feel confident',
    ]
  },
  {
    id: 'q4',
    text: 'What frustrates you most about working with other people?',
    description: 'Reveals expectations, boundaries, and interpersonal behavior',
    options: [
      'Lack of clear communication',
      'Missed deadlines or unreliability',
      'Ego or unwillingness to listen',
      'Unequal effort or responsibility',
      'Too many opinions slowing progress',
      'I rarely get frustrated working with others',
    ]
  },
  {
    id: 'q5',
    text: 'Do you prefer planning everything in advance or figuring things out as you go?',
    description: 'Shows structure vs flexibility preference',
    options: [
      'Detailed planning before starting',
      'Light planning with flexibility',
      'Mostly figuring things out as I go',
      'Adapting plans frequently based on situations',
      'Avoid planning unless necessary',
      'Depends on the task or context',
    ]
  },
  {
    id: 'q6',
    text: 'What motivates you more?',
    description: 'Uncovers core drivers and values',
    options: [
      'Recognition and appreciation',
      'Personal growth and learning',
      'Helping others or making an impact',
      'Financial stability or rewards',
      'Solving meaningful problems',
      'Freedom and independence',
    ]
  },
  {
    id: 'q7',
    text: 'How do you react when someone strongly disagrees with you?',
    description: 'Reveals conflict handling and emotional maturity',
    options: [
      'Listen and try to understand their view',
      'Defend my point with logic',
      'Reflect privately before responding',
      'Compromise if possible',
      'Get emotionally affected but calm down later',
      'Avoid the conflict altogether',
    ]
  },
  {
    id: 'q8',
    text: 'What kind of feedback affects you the most?',
    description: 'Shows sensitivity and growth mindset',
    options: [
      'Positive encouragement',
      'Constructive criticism with solutions',
      'Honest and direct feedback',
      'Feedback from people I respect',
      'Written or detailed feedback',
      'I’m affected by all types equally',
    ]
  },
  {
    id: 'q9',
    text: 'When you imagine your ideal day, what are you mostly doing and with whom?',
    description: 'Reveals social orientation and lifestyle preferences',
    options: [
      'Working deeply on something I love, alone',
      'Creating or building with a small team',
      'Learning or exploring new ideas',
      'Spending time with close friends or family',
      'Leading or contributing to a community',
      'Relaxing and enjoying personal time',
    ]
  },
  {
    id: 'q10',
    text: 'What is something you care deeply about that most people don’t notice?',
    description: 'Uncovers deeper interests, empathy, and individuality',
    options: [
      'Small design or aesthetic details',
      'Fairness and how people are treated',
      'Learning systems and how things work',
      'Emotional well-being of others',
      'Long-term impact over short-term results',
      'Personal values and integrity',
    ]
  },
];

interface PsychologicalQuestionnaireProps {
  avatarName: string;
  onSubmit: () => void;
}

export function PsychologicalQuestionnaire({ avatarName, onSubmit }: PsychologicalQuestionnaireProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { toast } = useToast();

  const handleOptionSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCustomInputChange = (questionId: string, value: string) => {
    setCustomInputs((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const currentQ = questions[currentQuestionIndex];
    const selectedOption = answers[currentQ.id];

    if (!selectedOption) {
      toast({
        title: 'Please select an option',
        variant: 'destructive',
      });
      return;
    }

    if (selectedOption === 'Other' && !customInputs[currentQ.id]?.trim()) {
      toast({
        title: 'Please enter your thought',
        variant: 'destructive',
      });
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const currentQ = questions[currentQuestionIndex];
    const selectedOption = answers[currentQ.id];

    if (!selectedOption) {
      toast({
        title: 'Please select an option',
        variant: 'destructive',
      });
      return;
    }

    if (selectedOption === 'Other' && !customInputs[currentQ.id]?.trim()) {
      toast({
        title: 'Please enter your thought',
        variant: 'destructive',
      });
      return;
    }

    // Prepare final answers, replacing 'Other' with the custom input
    const finalAnswers = { ...answers };
    Object.keys(finalAnswers).forEach(key => {
      if (finalAnswers[key] === 'Other') {
        finalAnswers[key] = customInputs[key] || 'Other';
      }
    });

    // In a real app, you would send these answers to a backend/AI flow
    console.log('Submitted Answers:', finalAnswers);

    toast({
      title: 'Questionnaire Complete!',
      description: `Thank you for training ${avatarName}.`,
    });
    onSubmit();
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="card-glass w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle style={{ color: 'var(--dynamic-text-color)' }}>
          Personality Analysis for {avatarName}
        </CardTitle>
        <CardDescription>
          Your answers will help shape the avatar's core personality. ({currentQuestionIndex + 1}/{questions.length})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              <div>
                <Label className="text-xl font-medium leading-relaxed block mb-2">
                  {currentQuestion.text}
                </Label>
                <p className="text-sm text-muted-foreground italic">
                  {currentQuestion.description}
                </p>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(currentQuestion.id, option)}
                    className={`w-full p-4 text-left rounded-lg border transition-all flex items-center gap-3 ${answers[currentQuestion.id] === option
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 shadow-sm shadow-cyan-500/20'
                        : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${answers[currentQuestion.id] === option
                        ? 'bg-cyan-500 border-cyan-500'
                        : 'border-muted-foreground/50'
                      }`}>
                      {answers[currentQuestion.id] === option && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    <span className="text-sm">{option}</span>
                  </button>
                ))}

                {/* Custom 'Other' Option */}
                <button
                  onClick={() => handleOptionSelect(currentQuestion.id, 'Other')}
                  className={`w-full p-4 text-left rounded-lg border transition-all flex items-center gap-3 ${answers[currentQuestion.id] === 'Other'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 shadow-sm shadow-cyan-500/20'
                      : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${answers[currentQuestion.id] === 'Other'
                      ? 'bg-cyan-500 border-cyan-500'
                      : 'border-muted-foreground/50'
                    }`}>
                    {answers[currentQuestion.id] === 'Other' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>
                  <span className="text-sm">Other (describe your own thought)</span>
                </button>

                {answers[currentQuestion.id] === 'Other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2"
                  >
                    <Textarea
                      placeholder="Type your answer here..."
                      value={customInputs[currentQuestion.id] || ''}
                      onChange={(e) => handleCustomInputChange(currentQuestion.id, e.target.value)}
                      className="bg-transparent border-cyan-500/50 focus-visible:ring-cyan-500"
                      autoFocus
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between">
        <GlowingButton
          text="Back"
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className={currentQuestionIndex === 0 ? 'opacity-50' : ''}
        />
        {currentQuestionIndex < questions.length - 1 ? (
          <GlowingButton text="Next" onClick={handleNext} />
        ) : (
          <GlowingButton text="Submit" onClick={handleSubmit} />
        )}
      </CardFooter>
    </Card>
  );
}
