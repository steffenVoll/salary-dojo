import { cn } from "@/lib/utils";
import { Message } from "@/types/negotiation";

interface ChatBubbleProps {
  message: Message;
  bossEmoji?: string;
}

export function ChatBubble({ message, bossEmoji = "👔" }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 animate-bubble-in">
        <div className="bg-secondary/50 text-secondary-foreground text-sm px-4 py-2 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex gap-3 mb-4 animate-bubble-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div 
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-lg",
          isUser ? "bg-primary/20" : "bg-secondary"
        )}
      >
        {isUser ? "😊" : bossEmoji}
      </div>

      {/* Bubble */}
      <div 
        className={cn(
          "max-w-[75%] px-4 py-3 rounded-2xl",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-md" 
            : "bg-card border border-border text-card-foreground rounded-tl-md shadow-card"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p className={cn(
          "text-xs mt-1.5",
          isUser ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
