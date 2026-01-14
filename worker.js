export default {
  async fetch(request, env) {
    // Получаем Origin из запроса
    const origin = request.headers.get("Origin") || "*";
    
    // CORS headers - явно указываем все заголовки
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept",
      "Access-Control-Max-Age": "86400"
    };

    // Handle preflight requests (OPTIONS) - ОБРАБАТЫВАЕМ ПЕРВЫМ!
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Только POST запросы разрешены
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: false, error: "Only POST method allowed" }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
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
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    try {
      // Парсинг JSON
      let data;
      try {
        data = await request.json();
      } catch (parseError) {
        return new Response(
          JSON.stringify({ ok: false, error: "Invalid JSON in request body" }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );
      }

      // Валидация данных
      if (!data.studentName || !data.testName) {
        return new Response(
          JSON.stringify({ ok: false, error: "Missing required fields" }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
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

      // Формирование сообщения с использованием HTML
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
      // Cloudflare Workers имеет встроенные таймауты для fetch запросов
      let tgResponse;
      let tgData;
      
      try {
        // Запрос к Telegram API
        // Workers автоматически ограничивает время выполнения запросов
        tgResponse = await fetch(
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

        // Парсинг ответа
        try {
          tgData = await tgResponse.json();
        } catch (jsonError) {
          // Если не удалось распарсить JSON, но запрос прошел
          console.warn("Failed to parse Telegram response:", jsonError);
          tgData = { ok: false, description: "Invalid response from Telegram" };
        }

        if (!tgResponse.ok || !tgData.ok) {
          console.error("Telegram API error:", tgData);
          // Возвращаем частичный успех - данные приняты, но Telegram не ответил
          return new Response(
            JSON.stringify({
              ok: true,
              message: "Results accepted, but Telegram notification may have failed",
              warning: tgData.description || "Telegram API error"
            }),
            {
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
              }
            }
          );
        }

        // Успешный ответ
        return new Response(
          JSON.stringify({ ok: true, message: "Results sent successfully" }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );

      } catch (telegramError) {
        // Если таймаут или другая ошибка Telegram API
        console.error("Telegram API error or timeout:", telegramError);
        
        // Возвращаем успех клиенту, даже если Telegram не ответил
        // Это важно, чтобы не блокировать пользователя
        return new Response(
          JSON.stringify({
            ok: true,
            message: "Results accepted",
            warning: "Telegram notification may be delayed"
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json"
            }
          }
        );
      }

    } catch (err) {
      console.error("Worker error:", err);
      return new Response(
        JSON.stringify({
          ok: false,
          error: err.message || "Internal server error"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }
  }
};
