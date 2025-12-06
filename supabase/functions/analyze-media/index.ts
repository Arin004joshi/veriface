import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisResult {
  score: number;
  status: "authentic" | "suspicious" | "deepfake";
  anomalies: string[];
  confidence: number;
  reasoning: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mediaData, mediaType } = await req.json();
    
    if (!mediaData || !mediaType) {
      return new Response(
        JSON.stringify({ error: "Missing mediaData or mediaType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing ${mediaType} media for deepfake detection`);

    // Construct detailed analysis prompt
    const systemPrompt = `You are an expert deepfake detection AI. Analyze the provided media for signs of manipulation, synthetic generation, or deepfake characteristics.

For IMAGES, look for:
- Facial inconsistencies (asymmetry, unnatural features, eye artifacts)
- Lighting and shadow anomalies
- Skin texture irregularities
- Edge artifacts around face/hair boundaries
- Color gradients that don't match natural photography
- Signs of GAN artifacts or AI-generated patterns
- Metadata inconsistencies

For VIDEO, additionally check:
- Frame-to-frame inconsistencies
- Temporal artifacts
- Unnatural facial movements
- Audio-visual synchronization issues
- Motion blur artifacts

For AUDIO, analyze:
- Voice synthesis artifacts
- Unnatural prosody or intonation
- Spectral anomalies
- Clipping or distortion patterns typical of TTS systems
- Breathing pattern irregularities

Respond with a JSON object containing:
{
  "deepfakeProbability": <number 0-100>,
  "status": "authentic" | "suspicious" | "deepfake",
  "anomalies": [<array of specific issues found>],
  "confidence": <number 0-100>,
  "reasoning": "<detailed technical explanation>"
}

Use this scoring:
- 0-30: authentic (real media)
- 31-65: suspicious (possible manipulation)
- 66-100: deepfake (high confidence synthetic/manipulated)`;

    const userPrompt = `Analyze this ${mediaType} file for deepfake or manipulation. Provide detailed technical analysis.`;

    // Prepare the API request with media
    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: {
              url: mediaData, // base64 data URL
            },
          },
        ],
      },
    ];

    // Call Lovable AI Gateway with vision model
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // Use most powerful vision model
        messages,
        temperature: 0.3, // Lower temperature for more consistent analysis
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI model");
    }

    console.log("AI Analysis response:", content);

    // Parse the AI response
    let analysisData;
    try {
      // Extract JSON from the response (AI might wrap it in markdown)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse JSON from AI response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: generate structured response from text
      analysisData = {
        deepfakeProbability: content.toLowerCase().includes("deepfake") ? 75 : 
                           content.toLowerCase().includes("suspicious") ? 50 : 25,
        status: content.toLowerCase().includes("deepfake") ? "deepfake" :
                content.toLowerCase().includes("suspicious") ? "suspicious" : "authentic",
        anomalies: extractAnomalies(content),
        confidence: 70,
        reasoning: content,
      };
    }

    // Convert to our API format
    const result: AnalysisResult = {
      score: Math.round(100 - analysisData.deepfakeProbability), // Invert: 100 = authentic, 0 = deepfake
      status: analysisData.status,
      anomalies: analysisData.anomalies || [],
      confidence: analysisData.confidence || 0,
      reasoning: analysisData.reasoning || "",
    };

    console.log("Final analysis result:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Analysis failed",
        details: "Failed to analyze media. Please try again."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

// Helper function to extract anomalies from text
function extractAnomalies(text: string): string[] {
  const anomalies: string[] = [];
  const keywords = [
    "artifact", "inconsisten", "unnatural", "synthetic", "manipulated",
    "anomal", "irregular", "distortion", "blur", "edge", "lighting"
  ];

  const sentences = text.split(/[.!?]+/);
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if (keywords.some(keyword => lowerSentence.includes(keyword))) {
      const cleaned = sentence.trim();
      if (cleaned.length > 10 && cleaned.length < 150) {
        anomalies.push(cleaned);
      }
    }
  }

  return anomalies.slice(0, 5); // Limit to top 5 anomalies
}
