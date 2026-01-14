// МИНИМАЛЬНАЯ ТЕСТОВАЯ ВЕРСИЯ ДЛЯ ПРОВЕРКИ CORS
// Используйте эту версию для проверки, что Worker обновляется правильно

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    };

    // OPTIONS запрос
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Любой другой запрос
    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: "CORS работает!",
        method: request.method,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
};
