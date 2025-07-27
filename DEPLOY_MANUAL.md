# 🚀 Мануал по деплою свадебного сайта

## 📋 Содержание
1. [Подготовка к деплою](#подготовка-к-деплою)
2. [Деплой на Render](#деплой-на-render)
3. [Настройка Supabase](#настройка-supabase)
4. [Настройка Telegram бота](#настройка-telegram-бота)
5. [Финальная настройка](#финальная-настройка)
6. [Использование сайта](#использование-сайта)

---

## 🔧 Подготовка к деплою

### 1. Создайте GitHub репозиторий
1. Зайдите на [GitHub.com](https://github.com)
2. Создайте новый репозиторий (например, `wedding-invitation`)
3. Загрузите все файлы проекта в репозиторий

### 2. Убедитесь, что у вас есть все файлы:
```
wedding-invitation/
├── index.html
├── styles.css
├── script.js
├── server.js
├── start.js
├── package.json
├── package-lock.json
├── supabase-setup.sql
├── telegram-bot-setup.md
└── DEPLOY_MANUAL.md
```

---

## 🌐 Деплой на Render

### 1. Создание аккаунта на Render
1. Перейдите на [render.com](https://render.com)
2. Зарегистрируйтесь через GitHub аккаунт
3. Подтвердите email

### 2. Создание Web Service
1. На главной странице Render нажмите **"New +"**
2. Выберите **"Web Service"**
3. Подключите ваш GitHub репозиторий
4. Выберите репозиторий с свадебным сайтом

### 3. Настройка деплоя
Заполните следующие поля:

**Основные настройки:**
- **Name**: `wedding-invitation` (или любое другое имя)
- **Region**: `Frankfurt (EU Central)` (ближе к России)
- **Branch**: `main` (или `master`)
- **Root Directory**: оставьте пустым
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**План:**
- Выберите **Free Plan** (бесплатный)

### 4. Переменные окружения (Environment Variables)
Добавьте следующие переменные:

```
NODE_ENV=production
PORT=3000
```

Пока оставьте остальные переменные пустыми - мы их добавим после настройки Supabase.

### 5. Деплой
1. Нажмите **"Create Web Service"**
2. Дождитесь завершения деплоя (5-10 минут)
3. Получите URL вашего сайта (например: `https://wedding-invitation-abc123.onrender.com`)

---

## 🗄️ Настройка Supabase

### 1. Создание проекта Supabase
1. Перейдите на [supabase.com](https://supabase.com)
2. Зарегистрируйтесь через GitHub
3. Нажмите **"New project"**
4. Выберите организацию
5. Заполните данные проекта:
   - **Name**: `wedding-invitation`
   - **Database Password**: создайте надежный пароль (сохраните его!)
   - **Region**: `Central EU (Frankfurt)`
6. Нажмите **"Create new project"**

### 2. Настройка базы данных
1. Дождитесь создания проекта (2-3 минуты)
2. Перейдите в **SQL Editor**
3. Скопируйте содержимое файла `supabase-setup.sql` и выполните его
4. Или создайте таблицу вручную:

```sql
-- Создание таблицы для RSVP ответов
CREATE TABLE rsvp_responses (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    attendance VARCHAR(20) NOT NULL CHECK (attendance IN ('yes', 'with-guest', 'no')),
    guest_name VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы для конфигурации сайта
CREATE TABLE site_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Вставка базовой конфигурации
INSERT INTO site_config (config_key, config_value) VALUES 
('wedding_info', '{
    "coupleNames": "Имя & Имя",
    "weddingDate": "2025-08-15",
    "restaurant": {
        "name": "Название ресторана",
        "address": "г. Город, ул. Адрес"
    },
    "deadline": "10 августа 2025",
    "contact": {
        "phone": "+7 (XXX) XXX-XX-XX",
        "telegram": "@username"
    }
}');
```

### 3. Получение API ключей
1. Перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например: `https://abc123.supabase.co`)
   - **anon public** ключ
   - **service_role** ключ (для сервера)

### 4. Настройка Row Level Security (RLS)
1. Перейдите в **Authentication** → **Policies**
2. Для таблицы `rsvp_responses` создайте политику:
   - **Policy name**: `Allow insert for everyone`
   - **Command**: `INSERT`
   - **Target roles**: `public`
   - **USING expression**: `true`

---

## 🤖 Настройка Telegram бота

### 1. Создание бота
1. Найдите [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте `/newbot`
3. Введите имя бота (например: `Wedding RSVP Bot`)
4. Введите username бота (например: `wedding_rsvp_bot`)
5. Сохраните **Bot Token** (например: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Получение Chat ID
1. Создайте группу или используйте личный чат
2. Добавьте бота в группу (если используете группу)
3. Отправьте любое сообщение боту
4. Перейдите по ссылке: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
5. Найдите `chat.id` в ответе (например: `-123456789`)

---

## ⚙️ Финальная настройка

### 1. Добавление переменных окружения в Render
Вернитесь в Render и добавьте переменные:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-123456789
```

### 2. Перезапуск сервиса
1. В Render перейдите в **Settings**
2. Нажмите **"Manual Deploy"** → **"Deploy latest commit"**
3. Дождитесь завершения деплоя

### 3. Проверка работы
1. Откройте ваш сайт по URL от Render
2. Заполните форму RSVP
3. Проверьте, что данные попали в Supabase
4. Проверьте, что уведомление пришло в Telegram

---

## 🎯 Использование сайта

### 1. Настройка контента
Отредактируйте данные в Supabase:
1. Перейдите в **Table Editor** → **site_config**
2. Измените запись с `config_key = 'wedding_info'`
3. Обновите JSON с вашими данными:

```json
{
    "coupleNames": "Анна & Иван",
    "weddingDate": "2025-09-15",
    "restaurant": {
        "name": "Ресторан Романтика",
        "address": "г. Москва, ул. Тверская, 1"
    },
    "deadline": "1 сентября 2025",
    "contact": {
        "phone": "+7 (999) 123-45-67",
        "telegram": "@your_username"
    },
    "quote": {
        "text": "Ваша любимая цитата о любви",
        "author": "— Автор цитаты"
    }
}
```

### 2. Загрузка фотографий
Для загрузки фотографий:
1. Используйте сервисы типа [Imgur](https://imgur.com) или [Cloudinary](https://cloudinary.com)
2. Загрузите фотографии и получите прямые ссылки
3. Добавьте ссылки в конфигурацию:

```json
{
    "images": {
        "couple": "https://i.imgur.com/your-couple-photo.jpg",
        "restaurant": "https://i.imgur.com/restaurant-photo.jpg",
        "heroPhoto1": "https://i.imgur.com/hero-photo-1.jpg",
        "heroPhoto2": "https://i.imgur.com/hero-photo-2.jpg",
        "heroMainPhoto": "https://i.imgur.com/main-photo.jpg"
    }
}
```

### 3. Мониторинг ответов
1. **В Supabase**: Table Editor → rsvp_responses
2. **В Telegram**: все ответы будут приходить в чат
3. **Экспорт данных**: в Supabase можно экспортировать таблицу в CSV

---

## 🔧 Полезные команды

### Локальная разработка:
```bash
npm install
npm start
# Сайт будет доступен на http://localhost:3000
```

### Проверка логов в Render:
1. Перейдите в ваш сервис на Render
2. Откройте вкладку **"Logs"**
3. Смотрите ошибки и статус работы

### Обновление сайта:
1. Внесите изменения в код
2. Загрузите в GitHub
3. Render автоматически перезапустит сайт

---

## 🆘 Решение проблем

### Сайт не загружается:
- Проверьте логи в Render
- Убедитесь, что все переменные окружения заданы
- Проверьте, что порт 3000 используется в start.js

### Форма не отправляется:
- Проверьте подключение к Supabase
- Убедитесь, что RLS политики настроены
- Проверьте правильность API ключей

### Telegram уведомления не приходят:
- Проверьте Bot Token
- Убедитесь, что Chat ID правильный
- Проверьте, что бот добавлен в группу (если используется)

### Стили не применяются:
- Очистите кэш браузера (Ctrl+F5)
- Проверьте, что styles.css загружается
- Убедитесь, что inline стили в HTML работают

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Render
2. Проверьте данные в Supabase
3. Убедитесь, что все переменные окружения заданы правильно

**Готово!** 🎉 Ваш свадебный сайт готов к использованию!

URL вашего сайта: `https://your-service-name.onrender.com`