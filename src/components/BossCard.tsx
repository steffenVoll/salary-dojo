import { cn } from "@/lib/utils";
import { BossPersonaInfo } from "@/types/negotiation";
import { Check } from "lucide-react";

interface BossCardProps {
  persona: BossPersonaInfo;
  isSelected: boolean;
  onSelect: () => void;
}

export function BossCard({ persona, isSelected, onSelect }: BossCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-full text-left p-6 rounded-xl border-2 transition-all duration-300 card-hover",
        "bg-card shadow-card",
        isSelected 
          ? "border-primary shadow-soft ring-2 ring-primary/20" 
          : "border-border hover:border-primary/50"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      {/* Emoji avatar */}
      <div className={cn(
        "w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-4 transition-all duration-300",
        isSelected ? "bg-primary/20" : "bg-secondary"
      )}>
        {persona.emoji}
      </div>

      {/* Content */}
      <h3 className="font-bold text-lg text-foreground mb-1">
        {persona.name}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {persona.title}
      </p>
      <p className="text-sm text-secondary-foreground mb-4">
        {persona.description}
      </p>

      {/* Traits */}
      <div className="flex flex-wrap gap-2">
        {persona.traits.map((trait) => (
          <span 
            key={trait}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full font-medium transition-colors",
              isSelected 
                ? "bg-primary/15 text-primary" 
                : "bg-muted text-muted-foreground"
            )}
          >
            {trait}
          </span>
        ))}
      </div>
    </button>
  );
}
