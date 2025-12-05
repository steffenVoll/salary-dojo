import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatBubble } from "./ChatBubble";
import { CoachingTip } from "./CoachingTip";
import { ConversationGrading } from "./ConversationGrading";
import { 
  Message, 
  BossPersona, 
  BOSS_PERSONAS, 
  getSystemPrompt
} from "@/types/negotiation";
import { 
  ArrowLeft, 
  Send, 
  Lightbulb,
  Loader2,
  Flag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface NegotiationChatProps {
  persona: BossPersona;
  targetRaise: string;
  onExit: () => void;
}

interface Grading {
  likelihood_of_success: number;
  overall_summary: string;
  areas: Array<{ name: string; score: number; feedback: string }>;
}

export function NegotiationChat({ persona, targetRaise, onExit }: NegotiationChatProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [coachingTip, setCoachingTip] = useState<{ tactic: string; tip: string } | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isEnded, setIsEnded] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [grading, setGrading] = useState<Grading | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const personaInfo = BOSS_PERSONAS.find(p => p.id === persona)!;
  const systemPrompt = getSystemPrompt(persona, targetRaise);

  useEffect(() => {
    const initConversation = async () => {
      const greeting = getBossGreeting(persona);
      setMessages([
        {
          id: '1',
          role: 'system',
          content: 'Negotiation started',
          timestamp: new Date()
        },
        {
          id: '2',
          role: 'boss',
          content: greeting,
          timestamp: new Date()
        }
      ]);

      // Save conversation to database
      if (user) {
        const { data } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            boss_persona: persona,
            target_raise: targetRaise,
            messages: [{ role: 'boss', content: greeting }],
            status: 'active'
          })
          .select()
          .single();

        if (data) {
          setConversationId(data.id);
        }
      }

      toast({
        title: "Negotiation Started",
        description: `You're now negotiating with ${personaInfo.name}`,
      });
    };

    initConversation();
  }, [persona, targetRaise, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getBossGreeting = (persona: BossPersona): string => {
    const greetings: Record<BossPersona, string> = {
      'budget-blocker': `Hey! Come on in, have a seat. So, you wanted to chat about your compensation? I saw your meeting request... look, I really appreciate you bringing this up directly with me. So, what's on your mind?`,
      'data-driven': `You requested this meeting to discuss compensation. I have exactly 15 minutes. Let's get straight to it - what specifically are you proposing?`,
      'gaslighter': `Oh, a meeting about your salary? Really? Okay, well... I suppose we can talk. Though I have to say, I wasn't expecting this from you. Go ahead, what is it?`,
    };
    return greetings[persona];
  };

  const updateConversationInDb = async (newMessages: Message[]) => {
    if (!conversationId) return;
    
    const messagesToSave = newMessages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));

    await supabase
      .from('conversations')
      .update({ messages: messagesToSave })
      .eq('id', conversationId);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = newMessages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const { data, error } = await supabase.functions.invoke('negotiation-chat', {
        body: { 
          messages: conversationHistory,
          systemPrompt,
          mode: 'negotiate'
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const bossMessage: Message = {
        id: Date.now().toString(),
        role: 'boss',
        content: data.content,
        timestamp: new Date()
      };

      const updatedMessages = [...newMessages, bossMessage];
      setMessages(updatedMessages);
      updateConversationInDb(updatedMessages);
      
      if (data.coachingTip) {
        setCoachingTip(data.coachingTip);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndConversation = async (outcome: 'won' | 'gave_up') => {
    setIsEnded(true);
    setIsGrading(true);

    try {
      const conversationHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke('grade-conversation', {
        body: { 
          messages: conversationHistory,
          persona: personaInfo.name,
          outcome
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setGrading(data);

      // Update conversation with grading
      if (conversationId) {
        await supabase
          .from('conversations')
          .update({ 
            status: 'completed',
            grading: data
          })
          .eq('id', conversationId);
      }

    } catch (error) {
      console.error("Error grading conversation:", error);
      toast({
        title: "Error",
        description: "Failed to grade conversation",
        variant: "destructive"
      });
    } finally {
      setIsGrading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Show grading screen
  if (grading) {
    return (
      <ConversationGrading 
        grading={grading}
        onNewConversation={onExit}
        onViewHistory={() => navigate('/history')}
      />
    );
  }

  // Show loading while grading
  if (isGrading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Analyzing your negotiation...</p>
          <p className="text-sm text-muted-foreground">This will just take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button 
            onClick={onExit}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Exit</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-lg">
              {personaInfo.emoji}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{personaInfo.name}</p>
              <p className="text-xs text-muted-foreground">Target: ${targetRaise}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEndConversation('won')}
              disabled={isLoading}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              I Won! 🎉
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleEndConversation('gave_up')}
              disabled={isLoading}
            >
              <Flag className="w-4 h-4 mr-1" />
              End
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <ChatBubble 
              key={message.id} 
              message={message} 
              bossEmoji={personaInfo.emoji}
            />
          ))}
          {isLoading && (
            <div className="flex gap-3 mb-4 animate-bubble-in">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg">
                {personaInfo.emoji}
              </div>
              <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-md shadow-card">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Coaching Tip */}
          <div className="mb-4">
            <CoachingTip tip={coachingTip} />
          </div>
          
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Make your case..."
              className="min-h-[50px] max-h-[120px] resize-none"
              disabled={isLoading || isEnded}
            />
            <Button 
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isEnded}
              className="h-auto"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
