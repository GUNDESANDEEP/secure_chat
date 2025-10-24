import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateLinkRequest {
  content: string;
  expiresInMinutes: number;
}

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

    const { content, expiresInMinutes }: CreateLinkRequest = await req.json();

    if (!content || !expiresInMinutes) {
      return new Response(
        JSON.stringify({ error: 'Content and expiration time are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Generate a random access token
    const accessToken = crypto.randomUUID();

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

    // Use Web Crypto API for encryption
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    
    // Generate a random key for encryption
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the content
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Export the key to store it
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    
    // Combine key, IV, and encrypted data
    const keyArray = new Uint8Array(exportedKey);
    const encryptedArray = new Uint8Array(encryptedData);
    const combined = new Uint8Array(keyArray.length + iv.length + encryptedArray.length);
    combined.set(keyArray, 0);
    combined.set(iv, keyArray.length);
    combined.set(encryptedArray, keyArray.length + iv.length);
    
    // Convert to base64 for storage
    const encryptedContent = btoa(String.fromCharCode(...combined));

    // Store in database
    const { data: linkData, error } = await supabaseClient
      .from('secure_links')
      .insert({
        encrypted_content: encryptedContent,
        access_token: accessToken,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create secure link' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Secure link created:', linkData.id);

    return new Response(
      JSON.stringify({
        success: true,
        accessToken,
        expiresAt,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error creating secure link:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
