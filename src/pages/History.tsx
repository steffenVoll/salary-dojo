import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MessageSquare, Trophy } from 'lucide-react';
import { BOSS_PERSONAS } from '@/types/negotiation';

interface Conversation {
  id: string;
  boss_persona: string;
  target_raise: string;
  status: string;
  grading: any;
  created_at: string;
}

export default function History() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchConversations = async () => {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setConversations(data);
      }
      setLoading(false);
    };

    fetchConversations();
  }, [user, navigate]);

  const getPersonaEmoji = (personaId: string) => {
    const persona = BOSS_PERSONAS.find(p => p.id === personaId);
    return persona?.emoji || '👔';
  };

  const getPersonaName = (personaId: string) => {
    const persona = BOSS_PERSONAS.find(p => p.id === personaId);
    return persona?.name || 'Boss';
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="w-full py-6 px-6 md:px-12 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-lg">🍞</span>
            </div>
            <span className="font-bold text-foreground">Breadshift</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Conversation History</h1>
        <p className="text-muted-foreground mb-8">Review your past negotiation practice sessions</p>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No conversations yet</p>
            <Button onClick={() => navigate('/')}>Start Your First Negotiation</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <div 
                key={conv.id}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                      {getPersonaEmoji(conv.boss_persona)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{getPersonaName(conv.boss_persona)}</h3>
                      <p className="text-sm text-muted-foreground">Target: ${conv.target_raise}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conv.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  {conv.grading && (
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {conv.grading.likelihood_of_success}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
