import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const { data } = await anonClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    console.log("Adding 3 credits for user:", user.id);

    // Get current credits
    const { data: currentCredits } = await supabaseClient
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single();

    const newCredits = (currentCredits?.credits || 0) + 3;

    // Update credits
    const { error } = await supabaseClient
      .from('user_credits')
      .update({ credits: newCredits })
      .eq('user_id', user.id);

    if (error) throw error;

    console.log("Credits updated to:", newCredits);

    return new Response(JSON.stringify({ credits: newCredits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error adding credits:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
