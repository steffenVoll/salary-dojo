import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Coaching tips based on detected tactics
const COACHING_TIPS: Record<string, { tip: string; tactic: string }> = {
  vague: {
    tactic: "Be Specific",
    tip: "Try quantifying your contributions with specific numbers, percentages, or dollar amounts."
  },
  emotional: {
    tactic: "Use Data",
    tip: "Emotions are valid, but back them up with concrete examples of your impact."
  },
  apologetic: {
    tactic: "Own Your Value",
    tip: "Avoid apologizing for asking. You've earned the right to this conversation."
  },
  comparison: {
    tactic: "Market Research",
    tip: "Good use of market data! Make sure you have sources ready if challenged."
  },
  achievement: {
    tactic: "Strong Evidence",
    tip: "Great job highlighting achievements! Keep emphasizing measurable results."
  },
  deflecting: {
    tactic: "Stay Focused",
    tip: "Don't let the conversation shift. Redirect back to your value and request."
  },
  future: {
    tactic: "Future Value",
    tip: "Smart! Showing future value demonstrates you're thinking about the company's success."
  },
  weak: {
    tactic: "Be Assertive",
    tip: "Avoid weak language like 'maybe' or 'I was wondering.' State your case confidently."
  },
  strong: {
    tactic: "Perfect Tone",
    tip: "Excellent confident tone without being aggressive. Keep this energy!"
  },
  anchor: {
    tactic: "Anchoring",
    tip: "You've set an anchor point. Be prepared to negotiate from here, not against yourself."
  }
};

function analyzeUserMessage(message: string): { tip: string; tactic: string } | null {
  const lowerMessage = message.toLowerCase();
  
  // Check for weak/apologetic language
  if (/sorry|apologize|i know this is bad timing|hate to ask|don't want to bother/i.test(message)) {
    return COACHING_TIPS.apologetic;
  }
  
  // Check for vague language
  if (/i think i deserve|i feel like|maybe|kind of|sort of|a bit more/i.test(message)) {
    return COACHING_TIPS.vague;
  }
  
  // Check for weak asks
  if (/was wondering|would it be possible|is there any chance|could you maybe/i.test(message)) {
    return COACHING_TIPS.weak;
  }
  
  // Check for emotional appeals without data
  if (/i need|bills|family|expenses|struggling|stressed/i.test(message) && 
      !/\d+%|\$\d+|increased|grew|saved|generated/i.test(message)) {
    return COACHING_TIPS.emotional;
  }
  
  // Check for strong achievements with numbers
  if (/\d+%|increased.*\d|saved.*\$|generated.*\$|grew.*\d|revenue|profit|efficiency/i.test(message)) {
    return COACHING_TIPS.achievement;
  }
  
  // Check for market comparisons
  if (/market rate|industry standard|glassdoor|linkedin|competitive|other companies|offers/i.test(message)) {
    return COACHING_TIPS.comparison;
  }
  
  // Check for future value propositions
  if (/plan to|going to|will deliver|next quarter|upcoming|roadmap|initiative/i.test(message)) {
    return COACHING_TIPS.future;
  }
  
  // Check for confident assertions
  if (/i've delivered|i have proven|my track record|i've consistently|i bring|i contribute/i.test(message)) {
    return COACHING_TIPS.strong;
  }
  
  // Check for anchoring with specific numbers
  if (/\$\d{2,}|asking for \d|requesting \d|\d{2,}k|\d{2,},\d{3}/i.test(message)) {
    return COACHING_TIPS.anchor;
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt, mode } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Negotiation chat request:", { mode, messageCount: messages.length });

    // Analyze the user's last message for coaching tips
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user');
    const coachingTip = lastUserMessage ? analyzeUserMessage(lastUserMessage.content) : null;

    // Build the messages array with system prompt
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'boss' ? 'assistant' : msg.role,
        content: msg.content
      }))
    ];

    console.log("Calling Lovable AI Gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response:", data);
      throw new Error("No response from AI");
    }

    console.log("AI response received successfully", { hasCoachingTip: !!coachingTip });

    return new Response(JSON.stringify({ content, coachingTip }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in negotiation-chat function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
