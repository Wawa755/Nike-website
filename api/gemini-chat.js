export default async function handler(request, response) {
  // 1. Define allowed origins for CORS
  const allowedOrigins = [
    "http://localhost:8888",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://nike-website-tawny-kappa.vercel.app"
  ];

  const origin = request.headers.origin;
  
  // 2. Set CORS Headers using setHeader
  if (allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    response.setHeader("Access-Control-Allow-Origin", allowedOrigins[0]);
  }
  
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  // 3. Handle Pre-flight request
  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return response.status(500).json({ error: "Missing API Key" });
    }

    const { message } = request.body || {};
    
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
      
      Athlete Scenario: "${message || 'Standard conditions'}"
    `.trim();

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
      return response.status(resp.status).json({ error: "Gemini API failure", details: data });
    }

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanedText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Send back the final calibrated data
    return response.status(200).json(JSON.parse(cleanedText));

  } catch (err) {
    console.error("Internal Server Error:", err.message);
    return response.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}