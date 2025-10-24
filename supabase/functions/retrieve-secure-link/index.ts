import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const accessToken = url.searchParams.get('token');

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'Access token is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Fetch the link
    const { data: linkData, error: fetchError } = await supabaseClient
      .from('secure_links')
      .select('*')
      .eq('access_token', accessToken)
      .single();

    if (fetchError || !linkData) {
      console.error('Link not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Link not found or has been deleted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if already accessed
    if (linkData.accessed) {
      return new Response(
        JSON.stringify({ error: 'This link has already been accessed and is no longer available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 410 }
      );
    }

    // Check if expired
    if (new Date(linkData.expires_at) < new Date()) {
      // Delete expired link
      await supabaseClient
        .from('secure_links')
        .delete()
        .eq('id', linkData.id);

      return new Response(
        JSON.stringify({ error: 'This link has expired and is no longer available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 410 }
      );
    }

    // Decrypt the content
    try {
      const encryptedBytes = Uint8Array.from(atob(linkData.encrypted_content), c => c.charCodeAt(0));
      
      // Extract key, IV, and encrypted data
      const keyBytes = encryptedBytes.slice(0, 32);
      const iv = encryptedBytes.slice(32, 44);
      const encryptedData = encryptedBytes.slice(44);
      
      // Import the key
      const key = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      
      // Decrypt
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
      );
      
      const decoder = new TextDecoder();
      const content = decoder.decode(decryptedData);

      // Mark as accessed
      await supabaseClient
        .from('secure_links')
        .update({
          accessed: true,
          accessed_at: new Date().toISOString(),
        })
        .eq('id', linkData.id);

      console.log('Link accessed and marked as used:', linkData.id);

      return new Response(
        JSON.stringify({
          success: true,
          content,
          createdAt: linkData.created_at,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );

    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      return new Response(
        JSON.stringify({ error: 'Failed to decrypt content' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

  } catch (error) {
    console.error('Error retrieving secure link:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
