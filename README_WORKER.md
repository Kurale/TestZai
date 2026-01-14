# Cloudflare Worker для отправки результатов тестов в Telegram

## Установка и настройка через веб-интерфейс Cloudflare

### 1. Создайте Telegram бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям и получите токен бота (например: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Получите Chat ID

1. Найдите [@userinfobot](https://t.me/userinfobot) в Telegram
2. Отправьте любое сообщение боту
3. Бот вернет ваш Chat ID (например: `123456789`)

### 3. Создайте Worker в Cloudflare Dashboard

1. Войдите в [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Перейдите в раздел **Workers & Pages**
3. Нажмите **Create application** → **Create Worker**
4. Введите имя Worker (например: `testanswerguru`)
5. Нажмите **Deploy**

### 4. Скопируйте код Worker

1. Откройте файл `worker.js` из этого проекта
2. Скопируйте весь код из файла
3. В Cloudflare Dashboard откройте ваш Worker
4. Нажмите **Quick edit** или **Edit code**
5. Удалите весь код по умолчанию и вставьте скопированный код из `worker.js`
6. Нажмите **Save and deploy**

### 5. Настройте переменные окружения (секреты)

1. В редакторе Worker найдите вкладку **Settings** (или перейдите в настройки Worker)
2. Найдите раздел **Variables** → **Environment Variables**
3. Добавьте две переменные:

   **Переменная 1:**
   - **Variable name:** `BOT_TOKEN`
   - **Value:** ваш токен бота от BotFather
   - **Type:** Secret (Encrypted)
   - Нажмите **Add variable**

   **Переменная 2:**
   - **Variable name:** `CHAT_ID`
   - **Value:** ваш Chat ID от userinfobot
   - **Type:** Secret (Encrypted)
   - Нажмите **Add variable**

4. Сохраните изменения

### 6. Получите URL вашего Worker

После развертывания вы увидите URL вида:
`https://testanswerguru.YOUR_SUBDOMAIN.workers.dev`

Скопируйте этот URL.

### 7. Обновите URL в index.html

Откройте файл `index.html` и найдите строку с URL Worker (около строки 746):

```javascript
const response = await fetch(
  "https://testanswerguru.nikolayka2011.workers.dev/",
  // ...
);
```

Замените URL на ваш собственный URL Worker.

### 8. Обновление Worker после изменений

После каждого изменения в `worker.js`:

1. Откройте Worker в Cloudflare Dashboard
2. Нажмите **Quick edit** или **Edit code**
3. Вставьте обновленный код из `worker.js`
4. Нажмите **Save and deploy**

## Структура файлов

- `worker.js` - основной код Cloudflare Worker (копируйте в Dashboard)
- `index.html` - фронтенд приложение с исправленным кодом отправки

## Особенности Worker

- ✅ Поддержка CORS для работы с фронтендом
- ✅ Валидация входящих данных
- ✅ Безопасное экранирование HTML символов
- ✅ Детальная обработка ошибок
- ✅ Использование HTML parse_mode для Telegram (более безопасно, чем Markdown)

## Тестирование развернутого Worker

После развертывания проверьте CORS и работу Worker:

```bash
# Проверка OPTIONS запроса (preflight)
curl -X OPTIONS https://testanswerguru.YOUR_SUBDOMAIN.workers.dev/ \
  -H "Origin: https://kurale.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Проверка POST запроса
curl -X POST https://testanswerguru.YOUR_SUBDOMAIN.workers.dev/ \
  -H "Content-Type: application/json" \
  -H "Origin: https://kurale.github.io" \
  -d '{
    "studentName": "Тестовый ученик",
    "testName": "Тестовый тест",
    "correct": 8,
    "total": 10,
    "percent": 80,
    "time": "05:30",
    "mistakes": 2,
    "date": "2024-01-01T12:00:00.000Z"
  }' \
  -v
```

## Тестирование Worker

### Быстрый тест через браузер

Откройте файл `test-worker.html` в браузере и используйте его для проверки работы Worker:

1. Введите URL вашего Worker
2. Нажмите "1. Тест OPTIONS (Preflight)" - проверяет CORS заголовки
3. Нажмите "2. Тест POST" - проверяет отправку данных
4. Или нажмите "3. Полный тест" - запускает оба теста

### Проверка через консоль браузера

Откройте консоль браузера (F12) и выполните:

```javascript
// Тест OPTIONS
fetch('https://testanswerguru.nikolayka2011.workers.dev/', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://kurale.github.io',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'Content-Type'
  }
}).then(r => {
  console.log('Статус:', r.status);
  console.log('CORS заголовки:', {
    origin: r.headers.get('Access-Control-Allow-Origin'),
    methods: r.headers.get('Access-Control-Allow-Methods'),
    headers: r.headers.get('Access-Control-Allow-Headers')
  });
});
```

## Устранение проблем

Если возникают ошибки CORS или "Failed to fetch":

### 1. Проверьте, что Worker обновлен

**ВАЖНО:** После каждого изменения в `worker.js`:
- Откройте Worker в Cloudflare Dashboard
- Нажмите **Quick edit** или **Edit code**
- **Полностью замените** весь код на код из `worker.js`
- Нажмите **Save and deploy**
- Подождите несколько секунд для применения изменений

### 2. Проверьте CORS заголовки

Используйте `test-worker.html` или выполните в консоли браузера:

```javascript
fetch('https://testanswerguru.nikolayka2011.workers.dev/', {
  method: 'OPTIONS'
}).then(r => {
  console.log('CORS заголовки:', {
    'Access-Control-Allow-Origin': r.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': r.headers.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': r.headers.get('Access-Control-Allow-Headers')
  });
});
```

Если заголовки отсутствуют - Worker не обновлен или код неверный.

### 3. Проверьте секреты

- В настройках Worker → **Variables** → **Environment Variables**
- Убедитесь, что `BOT_TOKEN` и `CHAT_ID` установлены как **Secret (Encrypted)**
- **НЕ** как обычные переменные!

### 4. Проверьте логи Worker

- В Dashboard откройте ваш Worker
- Перейдите во вкладку **Logs** или **Real-time Logs**
- Попробуйте отправить запрос и посмотрите логи
- Если видите ошибки - они помогут понять проблему

### 5. Проверьте URL

- Убедитесь, что URL в `index.html` точно совпадает с URL вашего Worker
- URL должен заканчиваться на `/`
- Проверьте, что нет опечаток

### 6. Проверьте формат данных

- Токен бота должен начинаться с цифр и содержать двоеточие (например: `123456789:ABC...`)
- Chat ID должен быть числом (может быть отрицательным для групп)

### 7. Очистите кэш браузера

Иногда браузер кэширует старые ответы. Попробуйте:
- Очистить кэш браузера (Ctrl+Shift+Delete)
- Открыть в режиме инкогнито
- Использовать другой браузер

## Важные замечания

- ⚠️ **Секреты (BOT_TOKEN и CHAT_ID) должны быть установлены как Secret (Encrypted)**, а не как обычные переменные окружения
- ⚠️ После каждого изменения кода Worker необходимо нажать **Save and deploy**
- ⚠️ URL Worker должен заканчиваться на `/` в `index.html`
