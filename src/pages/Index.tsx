import { useState } from "react";
import { Landing } from "@/components/Landing";
import { Setup } from "@/components/Setup";
import { NegotiationChat } from "@/components/NegotiationChat";
import { BossPersona } from "@/types/negotiation";

type Screen = 'landing' | 'setup' | 'chat';

interface NegotiationConfig {
  persona: BossPersona;
  targetRaise: string;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [config, setConfig] = useState<NegotiationConfig | null>(null);

  const handleEnterDojo = () => {
    setCurrentScreen('setup');
  };

  const handleBackToLanding = () => {
    setCurrentScreen('landing');
  };

  const handleStartNegotiation = (persona: BossPersona, targetRaise: string) => {
    setConfig({ persona, targetRaise });
    setCurrentScreen('chat');
  };

  const handleExitChat = () => {
    setConfig(null);
    setCurrentScreen('setup');
  };

  if (currentScreen === 'landing') {
    return <Landing onEnterDojo={handleEnterDojo} />;
  }

  if (currentScreen === 'setup') {
    return (
      <Setup 
        onBack={handleBackToLanding}
        onStart={handleStartNegotiation}
      />
    );
  }

  if (currentScreen === 'chat' && config) {
    return (
      <NegotiationChat
        persona={config.persona}
        targetRaise={config.targetRaise}
        onExit={handleExitChat}
      />
    );
  }

  return null;
};

export default Index;
