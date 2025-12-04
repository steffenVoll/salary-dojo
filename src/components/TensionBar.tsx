import { cn } from "@/lib/utils";

interface TensionBarProps {
  level: number; // 0-100
}

export function TensionBar({ level }: TensionBarProps) {
  const getLabel = () => {
    if (level < 30) return "Calm";
    if (level < 60) return "Tense";
    if (level < 80) return "Heated";
    return "Critical";
  };

  const getColor = () => {
    if (level < 30) return "bg-green-500";
    if (level < 60) return "bg-yellow-500";
    if (level < 80) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        Tension: {getLabel()}
      </span>
      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            getColor()
          )}
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}
