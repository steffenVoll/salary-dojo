import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BossCard } from "./BossCard";
import { BOSS_PERSONAS, BossPersonaInfo } from "@/types/negotiation";
import { ArrowLeft, ArrowRight, DollarSign, Mic, MessageSquare } from "lucide-react";

interface SetupProps {
  onBack: () => void;
  onStart: (persona: BossPersonaInfo, targetRaise: string, useVoice: boolean) => void;
}

export function Setup({ onBack, onStart }: SetupProps) {
  const [selectedPersona, setSelectedPersona] = useState<BossPersonaInfo | null>(null);
  const [targetRaise, setTargetRaise] = useState("");
  const [useVoice, setUseVoice] = useState(false);

  const canStart = selectedPersona && targetRaise.trim();

  const handleStart = () => {
    if (selectedPersona && targetRaise.trim()) {
      onStart(selectedPersona, targetRaise.trim(), useVoice);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full py-6 px-6 md:px-12 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg">🍞</span>
            </div>
            <span className="font-bold text-foreground">Breadshift</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Choose Your Opponent
          </h1>
          <p className="text-muted-foreground">
            Select the type of boss you want to practice negotiating with
          </p>
        </div>

        {/* Boss Selection */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {BOSS_PERSONAS.map((persona, index) => (
            <div 
              key={persona.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <BossCard
                persona={persona}
                isSelected={selectedPersona?.id === persona.id}
                onSelect={() => setSelectedPersona(persona)}
              />
            </div>
          ))}
        </div>

        {/* Target Raise Input */}
        <div 
          className="max-w-md mx-auto mb-8 animate-slide-up"
          style={{ animationDelay: '0.3s' }}
        >
          <label className="block text-sm font-medium text-foreground mb-2">
            What's your target raise?
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="e.g., 10,000 or 15%"
              value={targetRaise}
              onChange={(e) => setTargetRaise(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Enter an amount or percentage you want to negotiate for
          </p>
        </div>

        {/* Mode Selection */}
        <div 
          className="max-w-md mx-auto mb-10 animate-slide-up"
          style={{ animationDelay: '0.35s' }}
        >
          <label className="block text-sm font-medium text-foreground mb-3">
            How do you want to negotiate?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setUseVoice(false)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                !useVoice 
                  ? 'border-toast-gold bg-toast-gold/10 text-foreground' 
                  : 'border-border bg-card hover:border-muted-foreground text-muted-foreground'
              }`}
            >
              <MessageSquare className="w-6 h-6" />
              <span className="font-medium text-sm">Text Chat</span>
            </button>
            <button
              onClick={() => setUseVoice(true)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                useVoice 
                  ? 'border-toast-gold bg-toast-gold/10 text-foreground' 
                  : 'border-border bg-card hover:border-muted-foreground text-muted-foreground'
              }`}
            >
              <Mic className="w-6 h-6" />
              <span className="font-medium text-sm">Voice Chat</span>
            </button>
          </div>
        </div>

        {/* Start Button */}
        <div 
          className="text-center animate-slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          <Button
            variant="hero"
            disabled={!canStart}
            onClick={handleStart}
            className="group"
          >
            {useVoice ? 'Start Voice Negotiation' : 'Start Negotiation'}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </main>
    </div>
  );
}
