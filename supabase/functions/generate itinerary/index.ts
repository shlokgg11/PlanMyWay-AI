import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert travel planner for "Where Is My Trip", an Indian travel agency.

Given a destination, duration, budget, and interests, create a detailed day-by-day itinerary.

IMPORTANT: You MUST respond with ONLY valid JSON (no markdown, no code blocks, no extra text). Use this exact format:
{
  "title": "Trip to [Destination]",
  "destination": "[Destination]",
  "duration": "[X] Days / [Y] Nights",
  "budget": "₹[amount]",
  "summary": "Brief 2-line trip summary",
  "locations": [
    {"name": "Place Name", "lat": 0.0, "lng": 0.0, "description": "Brief description"}
  ],
  "days": [
    {
      "day": 1,
      "title": "Day 1 - Theme",
      "activities": [
        {"time": "9:00 AM", "activity": "Activity description", "location": "Place name", "cost": "₹0"},
        {"time": "12:00 PM", "activity": "Lunch at...", "location": "Restaurant", "cost": "₹500"}
      ]
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "totalEstimatedCost": "₹X,XXX"
}

Include real coordinates for locations. Be detailed with timings and costs. Include meals, transport, and sightseeing.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, duration, budget, interests } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const userPrompt = `Create a detailed travel itinerary for:
- Destination: ${destination}
- Duration: ${duration} days
- Budget: ₹${budget}
- Interests: ${interests || "general sightseeing, food, culture"}

Respond with ONLY valid JSON, no markdown or extra text.`;

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to parse JSON from the response
    let itinerary;
    try {
      // Remove potential markdown code blocks
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      itinerary = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse itinerary JSON:", content);
      return new Response(JSON.stringify({ error: "Failed to generate itinerary. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ itinerary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("itinerary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
