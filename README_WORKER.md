# Cloudflare Worker для отправки результатов тестов в Telegram

## Установка и настройка

### 1. Установите Wrangler CLI

```bash
npm install -g wrangler
```

Или используйте:
```bash
npm install wrangler --save-dev
```

### 2. Войдите в Cloudflare

```bash
wrangler login
```

### 3. Создайте Telegram бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Следуйте инструкциям и получите токен бота (например: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 4. Получите Chat ID

1. Найдите [@userinfobot](https://t.me/userinfobot) в Telegram
2. Отправьте любое сообщение боту
3. Бот вернет ваш Chat ID (например: `123456789`)

### 5. Установите секреты в Cloudflare Worker

```bash
wrangler secret put BOT_TOKEN
# Введите токен бота, когда появится запрос

wrangler secret put CHAT_ID
# Введите Chat ID, когда появится запрос
```

### 6. Разверните Worker

```bash
wrangler publish
```

После успешного развертывания вы получите URL вида:
`https://testanswerguru.YOUR_SUBDOMAIN.workers.dev`

### 7. Обновите URL в index.html

Замените URL в файле `index.html` на ваш новый URL Worker:

```javascript
const response = await fetch(
  "https://testanswerguru.YOUR_SUBDOMAIN.workers.dev/",
  // ...
);
```

## Структура файлов

- `worker.js` - основной код Cloudflare Worker
- `wrangler.toml` - конфигурация для развертывания
- `index.html` - фронтенд приложение с исправленным кодом отправки

## Особенности Worker

- ✅ Поддержка CORS для работы с фронтендом
- ✅ Валидация входящих данных
- ✅ Безопасное экранирование HTML символов
- ✅ Детальная обработка ошибок
- ✅ Использование HTML parse_mode для Telegram (более безопасно, чем Markdown)

## Тестирование

Вы можете протестировать Worker локально:

```bash
wrangler dev
```

Затем отправьте тестовый запрос:

```bash
curl -X POST http://localhost:8787/ \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Тестовый ученик",
    "testName": "Тестовый тест",
    "correct": 8,
    "total": 10,
    "percent": 80,
    "time": "05:30",
    "mistakes": 2,
    "date": "2024-01-01T12:00:00.000Z"
  }'
```
