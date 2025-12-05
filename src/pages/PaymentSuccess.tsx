import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const [processing, setProcessing] = useState(true);
  const { user, refreshCredits } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const addCredits = async () => {
      if (!user) {
        setProcessing(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('add-credits');
        
        if (error) throw error;
        
        await refreshCredits();
        toast.success('3 conversation tokens added to your account!');
      } catch (error) {
        console.error('Error adding credits:', error);
        toast.error('There was an issue adding your credits. Please contact support.');
      } finally {
        setProcessing(false);
      }
    };

    addCredits();
  }, [user]);

  if (processing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">
          You've purchased 3 conversation tokens. Start practicing your salary negotiation skills now!
        </p>
        <Button variant="hero" onClick={() => navigate('/')}>
          Start Negotiating
        </Button>
      </div>
    </div>
  );
}
