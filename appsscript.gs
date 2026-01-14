const BOT_TOKEN = "7582799425:AAFIxUksUPW4zGz2EnhmlYsRFWqePtor8YM";
const CHAT_ID = "451229467";

// Обработка GET запросов (для нашего проекта)
function doGet(e) {
  try {
    const data = e.parameter;
    
    // Логирование для отладки
    Logger.log('📤 Получен GET запрос:');
    Logger.log('👤 Ученик: ' + data.student);
    Logger.log('✅ Верно: ' + data.correct + ' / ' + data.total);
    Logger.log('📈 Процент: ' + data.percent + '%');
    Logger.log('⏱ Время: ' + data.time);
    Logger.log('📚 Тема: ' + data.topic);

    const text = `
📊 *Результаты теста*
👤 *${escape(data.student)}*

✅ Верно: *${data.correct} / ${data.total}*
📈 Процент: *${data.percent}%*
⏱ Время: *${data.time}*

📚 Тема: ${escape(data.topic || "—")}
    `;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    Logger.log('🔗 Отправка в Telegram...');

    const response = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: "Markdown"
      })
    });
    
    Logger.log('✅ Ответ Telegram API: ' + response.getResponseCode());

    return ok();
  } catch (err) {
    Logger.log('❌ Ошибка: ' + err.toString());
    return ContentService
      .createTextOutput("error")
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

// Обработка POST запросов (для совместимости)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const text = `
📊 *Результаты тренажёра*
👤 *${escape(data.student)}*

✅ Верно: *${data.correct} / ${data.total}*
📈 Процент: *${data.percent}%*
⏱ Время: *${data.time}*

📚 Тема: ${escape(data.topic || "—")}
    `;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: "Markdown"
      })
    });

    return ok();
  } catch (err) {
    return ContentService
      .createTextOutput("error")
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function ok() {
  return ContentService
    .createTextOutput("ok")
    .setMimeType(ContentService.MimeType.TEXT);
}

// защита от кривого Markdown
function escape(text = "") {
  return text.replace(/[*_`]/g, "");
}