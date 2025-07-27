# ⚡ Быстрый старт

## 🚀 За 15 минут до готового сайта

### 1. Подготовка (2 минуты)
1. Создайте GitHub репозиторий
2. Загрузите все файлы проекта

### 2. Render деплой (5 минут)
1. Зайдите на [render.com](https://render.com)
2. Подключите GitHub репозиторий
3. Настройки:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `NODE_ENV=production`

### 3. Supabase (5 минут)
1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL из файла `supabase-setup.sql`
3. Скопируйте URL и API ключи

### 4. Telegram бот (2 минуты)
1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите Bot Token и Chat ID

### 5. Финальная настройка (1 минута)
Добавьте в Render переменные окружения:
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## ✅ Готово!
Ваш сайт работает! Теперь можете:
- Настроить контент в Supabase
- Загрузить фотографии
- Отправить ссылку гостям

**Подробная инструкция**: см. `DEPLOY_MANUAL.md`