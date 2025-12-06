import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkAnalysisResult {
  originalUrl: string;
  finalUrl: string;
  redirectChain: string[];
  pageType: string;
  safetyStatus: 'safe' | 'suspicious' | 'dangerous';
  safetyReasons: string[];
  pageTitle?: string;
  description?: string;
  warnings: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing URL:', url);

    // Follow redirects and build chain
    const redirectChain: string[] = [url];
    let currentUrl = url;
    let finalUrl = url;
    let redirectCount = 0;
    const maxRedirects = 10;

    try {
      while (redirectCount < maxRedirects) {
        const response = await fetch(currentUrl, {
          method: 'HEAD',
          redirect: 'manual',
          headers: {
            'User-Agent': 'VeriFace-LinkAnalyzer/1.0'
          }
        });

        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location');
          if (location) {
            const nextUrl = new URL(location, currentUrl).href;
            redirectChain.push(nextUrl);
            currentUrl = nextUrl;
            redirectCount++;
          } else {
            break;
          }
        } else {
          finalUrl = currentUrl;
          break;
        }
      }
    } catch (error) {
      console.log('Redirect following completed or failed:', error);
      finalUrl = currentUrl;
    }

    // Fetch the final page content
    let pageContent = '';
    let pageTitle = '';
    let description = '';
    
    try {
      const pageResponse = await fetch(finalUrl, {
        headers: {
          'User-Agent': 'VeriFace-LinkAnalyzer/1.0'
        }
      });
      pageContent = await pageResponse.text();
      
      // Extract title
      const titleMatch = pageContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        pageTitle = titleMatch[1].trim();
      }
      
      // Extract description
      const descMatch = pageContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      if (descMatch) {
        description = descMatch[1].trim();
      }
    } catch (error) {
      console.log('Could not fetch page content:', error);
    }

    // Use AI to analyze the link
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not found');
    }

    const analysisPrompt = `Analyze this URL and webpage information for security and content type:

Original URL: ${url}
Final URL: ${finalUrl}
Redirect Chain: ${redirectChain.join(' -> ')}
Page Title: ${pageTitle || 'N/A'}
Page Description: ${description || 'N/A'}
Page Content Sample: ${pageContent.substring(0, 2000)}

Provide analysis in this exact JSON format:
{
  "pageType": "one of: phishing, malware, scam, social-media, e-commerce, news, blog, corporate, government, adult, gambling, streaming, download, forum, personal, other",
  "safetyStatus": "one of: safe, suspicious, dangerous",
  "safetyReasons": ["list of specific reasons for the safety assessment"],
  "warnings": ["list of specific warnings or red flags found"]
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity expert analyzing URLs and webpages. Provide accurate, detailed security assessments. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', errorText);
      throw new Error(`AI analysis failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '{}';
    
    // Extract JSON from AI response
    let analysis;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : aiContent);
    } catch (e) {
      console.error('Failed to parse AI response:', aiContent);
      analysis = {
        pageType: 'other',
        safetyStatus: 'suspicious',
        safetyReasons: ['Unable to complete full analysis'],
        warnings: ['Analysis incomplete']
      };
    }

    const result: LinkAnalysisResult = {
      originalUrl: url,
      finalUrl,
      redirectChain,
      pageType: analysis.pageType || 'other',
      safetyStatus: analysis.safetyStatus || 'suspicious',
      safetyReasons: analysis.safetyReasons || [],
      pageTitle: pageTitle || undefined,
      description: description || undefined,
      warnings: analysis.warnings || []
    };

    console.log('Analysis complete:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in analyze-link function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze link',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
