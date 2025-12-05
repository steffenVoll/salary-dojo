import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { persona, targetAmount } = await req.json();

    // Build persona-specific instructions
    let personalityTraits = "";
    let voiceStyle = "alloy";
    
    switch (persona) {
      case "budget-blocker":
        personalityTraits = "You are friendly and warm but constantly claim there's no money in the budget. Use phrases like 'I'd love to help, but...', 'You know I value you, however...', 'Times are tough right now...'. Be sympathetic but firm about budget constraints.";
        voiceStyle = "alloy";
        break;
      case "data-driven":
        personalityTraits = "You are cold, analytical, and only care about ROI and metrics. Demand specific numbers, percentages, and data points. Use phrases like 'What's the ROI on that?', 'Show me the data', 'I need to see concrete metrics'. Be skeptical of emotional arguments.";
        voiceStyle = "echo";
        break;
      case "gaslighter":
        personalityTraits = "You are dismissive and try to make the employee feel lucky to have a job. Use phrases like 'In this economy?', 'You should be grateful...', 'Many people would kill for your position', 'Are you sure you've earned this?'. Subtly undermine their confidence.";
        voiceStyle = "sage";
        break;
      default:
        personalityTraits = "You are a tough but fair manager.";
    }

    const systemPrompt = `You are a realistic manager in a salary negotiation roleplay. The employee is asking for a ${targetAmount} raise.

${personalityTraits}

IMPORTANT RULES:
- Do NOT give in easily. Make the employee work for it.
- If they provide weak arguments, shut them down politely but firmly.
- If they provide strong, value-based arguments with specific examples, you can consider their request.
- Stay in character at all times.
- Keep responses conversational and natural for voice - use short sentences.
- React realistically to their arguments.
- The negotiation should feel challenging but winnable with the right approach.`;

    console.log("Creating realtime session with persona:", persona);

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: voiceStyle,
        instructions: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Session created successfully");

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
