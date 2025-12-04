import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Target, TrendingUp } from "lucide-react";

interface LandingProps {
  onEnterDojo: () => void;
}

export function Landing({ onEnterDojo }: LandingProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-2xl">🍞</span>
            </div>
            <span className="font-bold text-xl text-foreground">Breadshift</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 md:px-12 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-8 animate-fade-in">
            <span className="text-sm font-medium text-secondary-foreground">
              The Salary Negotiation Dojo
            </span>
            <span className="text-lg">🥋</span>
          </div>

          {/* Headline */}
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight mb-6 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            Shift Your Income.{' '}
            <span className="text-gradient">Practice the Hardest Conversation.</span>
          </h1>

          {/* Subheadline */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            Don't practice on your real boss. Roleplay your salary negotiation here first 
            with AI-powered managers who push back just like the real thing.
          </p>

          {/* CTA Button */}
          <div 
            className="animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Button 
              variant="hero" 
              onClick={onEnterDojo}
              className="group"
            >
              Enter the Dojo
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Features */}
          <div 
            className="grid md:grid-cols-3 gap-6 mt-20 animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6" />}
              title="Realistic Roleplay"
              description="Face tough boss personas that challenge your arguments"
            />
            <FeatureCard 
              icon={<Target className="w-6 h-6" />}
              title="Get Feedback"
              description="Receive expert coaching on your negotiation tactics"
            />
            <FeatureCard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="Build Confidence"
              description="Practice until you're ready for the real conversation"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 text-center text-sm text-muted-foreground">
        <p>Practice makes permanent. Your next raise starts here.</p>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 text-left card-hover shadow-card">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
