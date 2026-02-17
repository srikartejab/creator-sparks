import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  postId?: string;
  processAll?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { postId, processAll }: AnalyzeRequest = await req.json();

    let postsQuery = supabase
      .from('posts')
      .select('id, video_url, title');

    if (postId) {
      postsQuery = postsQuery.eq('id', postId);
    } else if (processAll) {
      // Get posts that don't have recent originality assessments
      const { data: recentAssessments } = await supabase
        .from('quality_assessments')
        .select('post_id')
        .gte('assessed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      const recentPostIds = recentAssessments?.map(a => a.post_id) || [];
      if (recentPostIds.length > 0) {
        postsQuery = postsQuery.not('id', 'in', `(${recentPostIds.join(',')})`);
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Must specify postId or processAll' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: posts, error: postsError } = await postsQuery.limit(10);

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch posts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No posts to analyze', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];
    const originality_analyzer_url = Deno.env.get('ORIGINALITY_ANALYZER_URL');

    if (!originality_analyzer_url) {
      console.error('ORIGINALITY_ANALYZER_URL environment variable not set');
      return new Response(
        JSON.stringify({ error: 'Video analysis service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    for (const post of posts) {
      try {
        console.log(`Analyzing post ${post.id}: ${post.video_url}`);

        // First, index the video in the analyzer
        const indexResponse = await fetch(`${originality_analyzer_url}/index`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: post.video_url }),
          signal: AbortSignal.timeout(30000) // 30 second timeout for video processing
        });
        
        if (!indexResponse.ok) {
          const errorText = await indexResponse.text();
          console.warn(`Failed to index video ${post.id}: ${indexResponse.status} - ${errorText}`);
          // Continue to analysis even if indexing fails
        } else {
          console.log(`Successfully indexed video ${post.id}`);
        }

        // Then analyze for originality
        const analyzeResponse = await fetch(`${originality_analyzer_url}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: post.video_url }),
          signal: AbortSignal.timeout(45000) // 45 second timeout for analysis
        });

        if (!analyzeResponse.ok) {
          const errorText = await analyzeResponse.text();
          console.error(`Analysis failed for post ${post.id}: ${analyzeResponse.status} - ${errorText}`);
          results.push({
            post_id: post.id,
            success: false,
            error: `Analysis service error: ${analyzeResponse.status}`
          });
          continue;
        }

        const analysisResult = await analyzeResponse.json();
        const isOriginal = analysisResult.original === true;
        
        console.log(`Analysis completed for post ${post.id}: ${isOriginal ? 'Original' : 'Not Original'}`);

        // Store quality assessment using service role (bypasses RLS)
        const { error: insertError } = await supabase
          .from('quality_assessments')
          .insert({
            post_id: post.id,
            originality_score: isOriginal,
            overall_grade: isOriginal ? 'original' : 'not_original',
            assessed_at: new Date().toISOString(),
            is_final: true
          });

        if (insertError) {
          console.error(`Error inserting assessment for post ${post.id}:`, insertError);
          results.push({
            post_id: post.id,
            success: false,
            error: insertError.message
          });
        } else {
          console.log(`Successfully analyzed post ${post.id}: ${isOriginal ? 'Original' : 'Not Original'}`);
          results.push({
            post_id: post.id,
            success: true,
            original: isOriginal
          });
        }

      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
        results.push({
          post_id: post.id,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Analysis completed',
        processed: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});