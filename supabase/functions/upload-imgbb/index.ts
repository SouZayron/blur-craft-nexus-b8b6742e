import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ success: false, error: 'Image is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('IMGBB_API_KEY');
    if (!apiKey) {
      console.error('IMGBB_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'ImgBB API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove the data:image/png;base64, prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    console.log('Uploading image to ImgBB...');

    // Create form data for ImgBB API
    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('image', base64Image);
    formData.append('name', `bingo-${Date.now()}`);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('ImgBB API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error?.message || 'Failed to upload image' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Image uploaded successfully:', data.data.url);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: data.data.url,
        display_url: data.data.display_url,
        delete_url: data.data.delete_url
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error uploading to ImgBB:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
