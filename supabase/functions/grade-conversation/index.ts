import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRADING_PROMPT = `You are an expert negotiation coach. Analyze the salary negotiation conversation and provide detailed grading.

Return your response as valid JSON with this exact structure:
{
  "likelihood_of_success": number (0-100),
  "overall_summary": "2-3 sentence summary of how the negotiation went",
  "areas": [
    {
      "name": "Confidence & Assertiveness",
      "score": number (1-10),
      "feedback": "specific feedback on this area, include what was done well and what could improve"
    },
    {
      "name": "Evidence & Data Usage", 
      "score": number (1-10),
      "feedback": "specific feedback on this area"
    },
    {
      "name": "Objection Handling",
      "score": number (1-10),
      "feedback": "specific feedback on this area"
    },
    {
      "name": "Value Articulation",
      "score": number (1-10),
      "feedback": "specific feedback on this area"
    },
    {
      "name": "Closing Technique",
      "score": number (1-10),
      "feedback": "specific feedback on this area"
    }
  ]
}

Be specific with examples from the conversation. Be encouraging but honest.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, persona, outcome } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Grading conversation:", { messageCount: messages.length, persona, outcome });

    const conversationText = messages
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Employee' : 'Boss'}: ${m.content}`)
      .join('\n\n');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: GRADING_PROMPT },
          { role: "user", content: `Boss persona: ${persona}\nOutcome: ${outcome}\n\nConversation:\n${conversationText}` }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let grading;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        grading = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not find JSON in response");
      }
    } catch (parseError) {
      console.error("Error parsing grading JSON:", parseError, content);
      // Return a default structure if parsing fails
      grading = {
        likelihood_of_success: 50,
        overall_summary: "The negotiation showed some good elements but could be improved with more specific evidence and confident delivery.",
        areas: [
          { name: "Confidence & Assertiveness", score: 5, feedback: "Room for improvement in delivering your ask with conviction." },
          { name: "Evidence & Data Usage", score: 5, feedback: "Consider using more specific metrics and achievements." },
          { name: "Objection Handling", score: 5, feedback: "Practice acknowledging concerns while redirecting to your value." },
          { name: "Value Articulation", score: 5, feedback: "Focus on the impact of your contributions." },
          { name: "Closing Technique", score: 5, feedback: "Work on a clear call-to-action at the end." }
        ]
      };
    }

    console.log("Grading complete:", { likelihood: grading.likelihood_of_success });

    return new Response(JSON.stringify(grading), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in grade-conversation:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
