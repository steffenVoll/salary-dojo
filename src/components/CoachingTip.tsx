import { useState, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";

interface CoachingTipProps {
  tip: {
    tactic: string;
    tip: string;
  } | null;
}

export function CoachingTip({ tip }: CoachingTipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState(tip);

  useEffect(() => {
    if (tip) {
      setCurrentTip(tip);
      setIsVisible(true);
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [tip]);

  if (!isVisible || !currentTip) return null;

  return (
    <div className="animate-slide-up">
      <div className="bg-toast-gold/10 border border-toast-gold/30 rounded-xl p-4 relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-toast-gold/20 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-toast-gold" />
          </div>
          <div className="pr-4">
            <p className="text-xs font-semibold text-toast-gold uppercase tracking-wide mb-1">
              {currentTip.tactic}
            </p>
            <p className="text-sm text-foreground">
              {currentTip.tip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
