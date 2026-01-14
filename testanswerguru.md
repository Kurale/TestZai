export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    try {
      const data = await request.json();

      const text = `
📊 *Результаты теста*

👤 *Ученик:* ${data.studentName}
📝 *Тест:* ${data.testName}

✅ *Результат:* ${data.correct}/${data.total} (${data.percent}%)
⏱ *Время:* ${data.time}

❌ *Ошибки:* ${data.mistakes}

📅 ${new Date(data.date).toLocaleString("ru-RU")}
      `;

      const tgResponse = await fetch(
        `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.CHAT_ID,
            text,
            parse_mode: "Markdown"
          })
        }
      );

      const tgData = await tgResponse.json();

      if (!tgResponse.ok || !tgData.ok) {
        console.error("Telegram API error:", tgData);
        return new Response(
          JSON.stringify({ ok: false, error: "Telegram API error", details: tgData }),
          { status: 500 }
        );
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      console.error("Worker error:", err);
      return new Response(
        JSON.stringify({ ok: false, error: err.message }),
        { status: 500 }
      );
    }
  }
};
