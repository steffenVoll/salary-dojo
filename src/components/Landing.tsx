import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, MessageSquare, Target, TrendingUp, LogIn, LogOut, Coins, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LandingProps {
  onEnterDojo: () => void;
}

export function Landing({ onEnterDojo }: LandingProps) {
  const { user, credits, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleBuyCredits = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-payment');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to start payment. Please try again.');
    }
  };

  const handleEnterDojo = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (credits <= 0) {
      toast.error('You need conversation tokens to practice. Buy some first!');
      return;
    }
    onEnterDojo();
  };

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
          
          <div className="flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/history')}
                      className="hidden sm:flex"
                    >
                      <History className="w-4 h-4 mr-2" />
                      History
                    </Button>
                    <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
                      <Coins className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{credits} tokens</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={signOut}>
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </>
            )}
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

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <Button 
              variant="hero" 
              onClick={handleEnterDojo}
              className="group"
            >
              Enter the Dojo
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            {user && credits <= 0 && (
              <Button 
                variant="outline"
                onClick={handleBuyCredits}
                className="group"
              >
                <Coins className="w-5 h-5 mr-2" />
                Buy 3 Tokens - £5
              </Button>
            )}
            
            {!user && (
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Sign up to get started
              </Button>
            )}
          </div>

          {/* Pricing Info */}
          {user && credits <= 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Each token = 1 practice conversation
            </p>
          )}

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
              title="Get Graded"
              description="Receive detailed scoring and feedback on your performance"
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
