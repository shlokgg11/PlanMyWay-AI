import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a friendly AI travel assistant for "Where Is My Trip", an Indian travel agency website.

Current plans available (all ₹1):
- Kerala (5 Days/4 Nights): Backwater houseboat cruise, Munnar tea plantations, Ayurvedic spa, Fort Kochi heritage walk
- Goa (4 Days/3 Nights): Beach hopping, Old Goa heritage sites, Dudhsagar Falls trip, Night cruise party
- Amritsar (3 Days/2 Nights): Golden Temple visit, Wagah Border ceremony, Jallianwala Bagh memorial, Street food trail

You help customers:
- Learn about destinations and plans
- Create custom travel itineraries with detailed day-by-day schedules for both domestic and international trips
- Answer questions about travel (best time to visit, what to pack, local food, culture, visa requirements, etc.)
- Guide them to book by clicking "Book Now" on destination cards
- Create personalized trip plans based on budget, interests, and duration

Payment info: UPI ID phutaneprathamesh829@oksbi, all plans ₹1.
Contact: 9082494524, Mumbai, India.

Be enthusiastic, use emojis, keep responses concise but helpful. Format with markdown. When creating itineraries, provide detailed day-by-day schedules with timings, places, activities, and estimated costs.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Groq API error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
