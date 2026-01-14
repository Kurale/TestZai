export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: false, error: "Only POST method allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Проверка наличия переменных окружения
    if (!env.BOT_TOKEN || !env.CHAT_ID) {
      console.error("Missing environment variables: BOT_TOKEN or CHAT_ID");
      return new Response(
        JSON.stringify({ ok: false, error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    try {
      const data = await request.json();

      // Валидация данных
      if (!data.studentName || !data.testName) {
        return new Response(
          JSON.stringify({ ok: false, error: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      // Функция для экранирования HTML символов
      const escapeHtml = (text) => {
        if (!text) return "";
        return String(text)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };

      // Форматирование даты
      const formatDate = (dateString) => {
        try {
          const date = new Date(dateString);
          return date.toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
        } catch (e) {
          return dateString;
        }
      };

      // Формирование сообщения с использованием HTML (более безопасно)
      const text = `
📊 <b>Результаты теста</b>

👤 <b>Ученик:</b> ${escapeHtml(data.studentName)}
📝 <b>Тест:</b> ${escapeHtml(data.testName)}

✅ <b>Результат:</b> ${data.correct || 0}/${data.total || 0} (${data.percent || 0}%)
⏱ <b>Время:</b> ${escapeHtml(data.time || "00:00")}

❌ <b>Ошибки:</b> ${data.mistakes || 0}

📅 ${formatDate(data.date)}
      `.trim();

      // Отправка в Telegram
      const tgResponse = await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.CHAT_ID,
            text: text,
            parse_mode: "HTML"
          })
        }
      );

      const tgData = await tgResponse.json();

      if (!tgResponse.ok || !tgData.ok) {
        console.error("Telegram API error:", tgData);
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Telegram API error",
            details: tgData.description || "Unknown error"
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      return new Response(
        JSON.stringify({ ok: true, message: "Results sent successfully" }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );

    } catch (err) {
      console.error("Worker error:", err);
      return new Response(
        JSON.stringify({
          ok: false,
          error: err.message || "Internal server error"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  }
};
