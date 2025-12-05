import { useState } from "react";
import { Landing } from "@/components/Landing";
import { Setup } from "@/components/Setup";
import { NegotiationChat } from "@/components/NegotiationChat";
import VoiceChat from "@/components/VoiceChat";
import { BossPersonaInfo } from "@/types/negotiation";

type Screen = 'landing' | 'setup' | 'chat' | 'voice';

interface NegotiationConfig {
  persona: BossPersonaInfo;
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

  const handleStartNegotiation = (persona: BossPersonaInfo, targetRaise: string, useVoice: boolean = false) => {
    setConfig({ persona, targetRaise });
    setCurrentScreen(useVoice ? 'voice' : 'chat');
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
        persona={config.persona.id}
        targetRaise={config.targetRaise}
        onExit={handleExitChat}
      />
    );
  }

  if (currentScreen === 'voice' && config) {
    return (
      <VoiceChat
        persona={config.persona}
        targetAmount={config.targetRaise}
        onEnd={handleExitChat}
      />
    );
  }

  return null;
};

export default Index;
