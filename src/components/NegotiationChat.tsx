import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatBubble } from "./ChatBubble";
import { TensionBar } from "./TensionBar";
import { 
  Message, 
  BossPersona, 
  BOSS_PERSONAS, 
  getSystemPrompt,
  getFeedbackPrompt 
} from "@/types/negotiation";
import { 
  ArrowLeft, 
  Send, 
  Lightbulb,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NegotiationChatProps {
  persona: BossPersona;
  targetRaise: string;
  onExit: () => void;
}

export function NegotiationChat({ persona, targetRaise, onExit }: NegotiationChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tensionLevel, setTensionLevel] = useState(20);
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const personaInfo = BOSS_PERSONAS.find(p => p.id === persona)!;
  const systemPrompt = getSystemPrompt(persona, targetRaise);

  useEffect(() => {
    // Initial boss greeting
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

    toast({
      title: "Negotiation Started",
      description: `You're now negotiating with ${personaInfo.name}`,
    });
  }, [persona, targetRaise]);

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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history for API
      const conversationHistory = [...messages, userMessage]
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

      setMessages(prev => [...prev, bossMessage]);
      
      // Update tension based on response
      const tensionIndicators = /budget|can't|won't|no|unfortunately|impossible|policy/gi;
      const matches = (data.content.match(tensionIndicators) || []).length;
      setTensionLevel(prev => Math.min(100, prev + Math.min(matches * 5, 15)));

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

  const handleGetFeedback = async () => {
    setIsFeedbackMode(true);
    
    const feedbackSystemMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: '🎯 Feedback Mode - Analyzing your negotiation...',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, feedbackSystemMessage]);
    setIsLoading(true);

    try {
      // Build conversation history for feedback
      const conversationHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const { data, error } = await supabase.functions.invoke('negotiation-chat', {
        body: { 
          messages: conversationHistory,
          systemPrompt: getFeedbackPrompt(),
          mode: 'feedback'
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const feedbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'boss',
        content: data.content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, feedbackMessage]);

    } catch (error) {
      console.error("Error getting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to get feedback. Please try again.",
        variant: "destructive"
      });
      setIsFeedbackMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
            <TensionBar level={tensionLevel} />
            {!isFeedbackMode && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGetFeedback}
                disabled={isLoading}
                className="hidden sm:flex"
              >
                <Lightbulb className="w-4 h-4 mr-1" />
                Feedback
              </Button>
            )}
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
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isFeedbackMode ? "Feedback mode - review the analysis above" : "Make your case..."}
              className="min-h-[50px] max-h-[120px] resize-none"
              disabled={isLoading || isFeedbackMode}
            />
            <Button 
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isFeedbackMode}
              className="h-auto"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleGetFeedback}
              disabled={isFeedbackMode || isLoading}
              className="sm:hidden"
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              Feedback
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
