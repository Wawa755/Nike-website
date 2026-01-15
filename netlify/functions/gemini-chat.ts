import type { Handler } from "@netlify/functions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: corsHeaders, body: "" };

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { statusCode: 500, headers: corsHeaders, body: "Missing API Key" };

    const body = JSON.parse(event.body || "{}");
    
    // We combine instructions into one prompt to avoid "system_instruction" 400 errors
const fullPrompt = `
      Instructions: You are the Lead Systems Engineer at the Nike Performance Lab. 
      Analyze the Athlete's Scenario and provide a custom gear configuration.
      
      YOUR CATALOG:
      - TINTS: Road-Peak Crimson (Asphalt), Trail-Depth Bronze (Terrain), Low-Light Volt (Fog/Gloom), Field-Scan Teal (High-Glare).
      - FRAME TECH: TR-90 Aero-Frame (Ultralight), Ventilated Rubber Bridge (Anti-Fog Flow), 8-Base Sport Wrap (Peripheral Shield).
      - COATINGS: Max Extreme Shield (All-weather), Vaporwave Mirror (Heat/IR).

      RESPONSE FORMAT RULES:
      1. Headline: A punchy Nike-style slogan (max 5 words).
      2. Config: Exactly like this: "[LENS TINT NAME] + [FRAME TECH NAME] + [COATING NAME]".
      3. Technical_Analysis: 2 sentences explaining the technical "why" for this environment.
      4. Performance_Mantra: One short, motivating Nike closing statement.
      
      Respond ONLY in valid JSON: 
      {
        "headline": "string", 
        "config": "string", 
        "analysis": "string", 
        "mantra": "string"
      }
      
      Athlete Scenario: "${body.message}"
    `.trim();

    // UPDATED: Using the Gemini 2.5 Flash model URL
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.7
        }
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Gemini 2.5 Error:", data);
      return {
        statusCode: resp.status,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Gemini 2.5 failure", details: data }),
      };
    }

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanedText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: cleanedText,
    };

  } catch (err: any) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Internal Server Error", message: err.message }),
    };
  }
};