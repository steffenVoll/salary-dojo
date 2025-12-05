import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Phone, PhoneOff, Volume2 } from "lucide-react";
import { RealtimeChat } from "@/utils/RealtimeAudio";
import { BossPersonaInfo } from "@/types/negotiation";
import { toast } from "sonner";

interface VoiceChatProps {
  persona: BossPersonaInfo;
  targetAmount: string;
  onEnd: () => void;
}

const VoiceChat = ({ persona, targetAmount, onEnd }: VoiceChatProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Voice event:', event.type);
    
    switch (event.type) {
      case 'response.audio.delta':
        setIsSpeaking(true);
        break;
      case 'response.audio.done':
        setIsSpeaking(false);
        break;
      case 'response.audio_transcript.done':
        if (event.transcript) {
          setTranscript(prev => [...prev, `Boss: ${event.transcript}`]);
        }
        break;
      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          setTranscript(prev => [...prev, `You: ${event.transcript}`]);
        }
        break;
      case 'error':
        console.error('Realtime error:', event);
        toast.error("Voice connection error");
        break;
    }
  };

  const startConversation = async () => {
    setIsConnecting(true);
    try {
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init(persona.id, targetAmount);
      setIsConnected(true);
      toast.success("Voice chat connected! Start speaking.");
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start voice chat');
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{persona.emoji}</div>
            <div>
              <h2 className="font-semibold text-foreground">{persona.name}</h2>
              <p className="text-sm text-muted-foreground">Voice Negotiation</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onEnd}>
            Exit
          </Button>
        </div>
      </div>

      {/* Voice Status */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className={`relative w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all duration-300 ${
          isSpeaking 
            ? 'bg-toast-gold/20 animate-pulse' 
            : isConnected 
              ? 'bg-green-500/20' 
              : 'bg-muted'
        }`}>
          <div className="text-6xl">{persona.emoji}</div>
          {isSpeaking && (
            <div className="absolute inset-0 rounded-full border-4 border-toast-gold animate-ping opacity-50" />
          )}
        </div>

        <div className="text-center mb-8">
          {isConnecting ? (
            <p className="text-lg text-muted-foreground animate-pulse">Connecting...</p>
          ) : isConnected ? (
            <>
              <p className="text-lg font-medium text-foreground">
                {isSpeaking ? "Boss is speaking..." : "Listening..."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Speak naturally to negotiate your raise
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium text-foreground">Ready to negotiate?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click the button below to start your voice conversation
              </p>
            </>
          )}
        </div>

        {/* Transcript */}
        {transcript.length > 0 && (
          <div className="w-full max-w-md mb-8 max-h-48 overflow-y-auto bg-muted/30 rounded-lg p-4">
            {transcript.slice(-6).map((line, i) => (
              <p key={i} className={`text-sm mb-2 ${
                line.startsWith('You:') ? 'text-toast-gold' : 'text-foreground'
              }`}>
                {line}
              </p>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-4">
          {!isConnected ? (
            <Button
              onClick={startConversation}
              disabled={isConnecting}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Phone className="w-5 h-5" />
              {isConnecting ? "Connecting..." : "Start Voice Chat"}
            </Button>
          ) : (
            <Button
              onClick={endConversation}
              size="lg"
              variant="destructive"
              className="gap-2"
            >
              <PhoneOff className="w-5 h-5" />
              End Call
            </Button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-4 border-t border-border bg-card/50">
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          {isConnected ? (
            <>
              <span className="flex items-center gap-1">
                <Mic className="w-4 h-4 text-green-500" />
                Mic Active
              </span>
              <span className="flex items-center gap-1">
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-toast-gold' : 'text-muted-foreground'}`} />
                {isSpeaking ? 'Speaking' : 'Listening'}
              </span>
            </>
          ) : (
            <span>Voice chat powered by OpenAI Realtime API</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceChat;
