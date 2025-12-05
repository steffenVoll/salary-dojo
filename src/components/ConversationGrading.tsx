import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, ArrowRight, RotateCcw } from "lucide-react";

interface GradingArea {
  name: string;
  score: number;
  feedback: string;
}

interface Grading {
  likelihood_of_success: number;
  overall_summary: string;
  areas: GradingArea[];
}

interface ConversationGradingProps {
  grading: Grading;
  onNewConversation: () => void;
  onViewHistory: () => void;
}

export function ConversationGrading({ grading, onNewConversation, onViewHistory }: ConversationGradingProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-yellow-500";
    if (score >= 4) return "text-orange-500";
    return "text-red-500";
  };

  const getLikelihoodColor = (likelihood: number) => {
    if (likelihood >= 70) return "bg-green-500";
    if (likelihood >= 50) return "bg-yellow-500";
    if (likelihood >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Negotiation Complete</h1>
          <p className="text-muted-foreground">Here's how you did</p>
        </div>

        {/* Likelihood of Success */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Likelihood of Success</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress 
                value={grading.likelihood_of_success} 
                className="h-4"
              />
            </div>
            <span className={`text-2xl font-bold ${getScoreColor(grading.likelihood_of_success / 10)}`}>
              {grading.likelihood_of_success}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-4">{grading.overall_summary}</p>
        </div>

        {/* Scoring Areas */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Performance Breakdown</h2>
          <div className="space-y-6">
            {grading.areas.map((area, index) => (
              <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground">{area.name}</h3>
                  <span className={`text-xl font-bold ${getScoreColor(area.score)}`}>
                    {area.score}/10
                  </span>
                </div>
                <div className="mb-2">
                  <Progress value={area.score * 10} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">{area.feedback}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="hero" className="flex-1" onClick={onNewConversation}>
            <RotateCcw className="w-5 h-5 mr-2" />
            Practice Again
          </Button>
          <Button variant="outline" className="flex-1" onClick={onViewHistory}>
            View History
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
