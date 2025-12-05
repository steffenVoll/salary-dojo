import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BossCard } from "./BossCard";
import { BOSS_PERSONAS, BossPersonaInfo } from "@/types/negotiation";
import { ArrowLeft, ArrowRight, DollarSign, Mic, MessageSquare, Coins } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SetupProps {
  onBack: () => void;
  onStart: (persona: BossPersonaInfo, targetRaise: string, useVoice: boolean) => void;
}

export function Setup({ onBack, onStart }: SetupProps) {
  const [selectedPersona, setSelectedPersona] = useState<BossPersonaInfo | null>(null);
  const [targetRaise, setTargetRaise] = useState("");
  const [useVoice, setUseVoice] = useState(false);
  const { credits, deductCredit, user } = useAuth();
  const navigate = useNavigate();

  const canStart = selectedPersona && targetRaise.trim() && credits > 0;

  const handleStart = async () => {
    if (!selectedPersona || !targetRaise.trim()) return;
    
    if (credits <= 0) {
      toast.error("You need conversation tokens to practice!");
      return;
    }

    const success = await deductCredit();
    if (!success) {
      toast.error("Failed to use token. Please try again.");
      return;
    }

    onStart(selectedPersona, targetRaise.trim(), useVoice);
  };

  const handleBuyCredits = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to start payment. Please try again.');
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
          <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
            <Coins className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{credits} tokens</span>
          </div>
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

        {/* Credits Warning */}
        {credits <= 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-8 text-center">
            <p className="text-orange-600 font-medium mb-2">You're out of conversation tokens!</p>
            <Button onClick={handleBuyCredits} className="bg-orange-500 hover:bg-orange-600">
              <Coins className="w-4 h-4 mr-2" />
              Buy 3 Tokens - £5
            </Button>
          </div>
        )}

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
                  ? 'border-primary bg-primary/10 text-foreground' 
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
                  ? 'border-primary bg-primary/10 text-foreground' 
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
          {!canStart && credits > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              Select a boss and enter your target raise to continue
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
