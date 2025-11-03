Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { panicActivated, timestamp, userId } = requestData;

    // Log the panic alert (this could be enhanced to send to external services)
    console.log('PANIC ALERT ACTIVATED:', {
      userId,
      timestamp,
      panicActivated
    });

    // Optionally send a notification message to the chat
    // This could be enhanced to send notifications to administrators or log services
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert a panic alert message (visible to other users)
    const { error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          text: '🚨 PANIC BUTTON ACTIVATED 🚨',
          user_id: userId
        }
      ]);

    if (messageError) {
      console.error('Failed to insert panic message:', messageError);
    }

    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Panic alert received and processed',
      data: { timestamp, userId }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Panic alert error:', error);
    
    const errorResponse = {
      error: {
        code: 'PANIC_ALERT_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});