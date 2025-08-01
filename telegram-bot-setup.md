# 🤖 Настройка Telegram бота для управления свадебным сайтом

## 📋 Что умеет бот:

✅ **Управление контентом:**
- Изменение имен молодоженов
- Установка даты свадьбы
- Обновление информации о ресторане
- Настройка расписания мероприятий
- Изменение дедлайна ответов
- Обновление контактов и цитаты

✅ **Загрузка изображений:**
- Фото молодоженов
- Фото ресторана

✅ **Мониторинг:**
- Получение ответов гостей
- Статистика и аналитика
- Резервное копирование настроек

## 🚀 Быстрый старт:

### 1. Первый запуск
1. Откройте сайт в браузере
2. Найдите вашего бота в Telegram (токен уже настроен)
3. Напишите боту `/start`
4. Бот автоматически настроится и отправит приветственное сообщение

### 2. Основные команды

#### 👥 Имена молодоженов:
```
/names Анна & Михаил
```

#### 📅 Дата свадьбы:
```
/date 2025-08-15
```

#### 🏛️ Ресторан (название|адрес|телефон):
```
/restaurant Золотой зал|г. Москва, ул. Тверская 1|+7 (495) 123-45-67
```

#### ⏰ Дедлайн ответов:
```
/deadline 10 августа 2025
```

#### 📞 Контакты (телефон|telegram):
```
/contact +7 (999) 123-45-67|@username
```

#### 💬 Цитата (текст|автор):
```
/quote Любовь - это когда счастье другого важнее собственного|— Неизвестный автор
```

### 3. Загрузка фотографий

#### Фото молодоженов:
1. Отправьте фото боту
2. В подписи к фото напишите: `couple`

#### Фото ресторана:
1. Отправьте фото боту
2. В подписи к фото напишите: `restaurant`

### 4. Полезные команды

```
/menu - главное меню
/status - текущие настройки
/help - подробная справка
/preview - ссылка на сайт
/backup - создать резервную копию
```

## 📊 Мониторинг ответов гостей

Когда гость заполняет форму на сайте, вы получите уведомление в формате:

```
🎉 НОВЫЙ ОТВЕТ НА СВАДЕБНОЕ ПРИГЛАШЕНИЕ

👤 Имя: Иван Петров
📱 Телефон: +7 (999) 123-45-67
📋 Присутствие: ✅ Буду присутствовать
💬 Комментарий: Поздравляю! Обязательно приду
⏰ Время: 25.07.2025, 14:30
```

## 🎨 Дизайн сайта

Сайт выполнен в нежных голубых тонах:
- 🔵 Основной цвет: #87ceeb (небесно-голубой)
- 🔷 Дополнительный: #4682b4 (стальной синий)
- ☁️ Фон: #f0f8ff (алисово-голубой)
- ✨ Градиенты для красивых переходов

## 🔧 Расширенные возможности

### Расписание мероприятий (JSON формат):
```
/timeline [{"time":"15:00","title":"ЗАГС","description":"Регистрация брака","note":"Торжественно"},{"time":"18:00","title":"Банкет","description":"Ресторан Золотой зал","note":"Празднование"}]
```

### Резервное копирование:
- `/backup` - создает JSON с настройками
- `/restore [JSON]` - восстанавливает из резервной копии

## 🛠️ Техническая информация

- **Токен бота:** `8322419038:AAGYxQZYZMKyHW-BY-Ydkx-pVBqmwE8h1ys`
- **Автоматическое определение Chat ID**
- **Локальное хранение настроек** (localStorage)
- **Адаптивный дизайн** для всех устройств
- **Современные веб-технологии** (HTML5, CSS3, ES6+)

## 🎯 Примеры использования

### Полная настройка сайта:
```
/names Анна & Михаил
/date 2025-08-15
/restaurant Золотой зал|г. Москва, ул. Тверская 1|+7 (495) 123-45-67
/deadline 10 августа 2025
/contact +7 (999) 123-45-67|@anna_mikhail
/quote Любовь - это когда два сердца бьются в унисон|— Народная мудрость
```

### Загрузка фотографий:
1. Отправьте фото пары с подписью `couple`
2. Отправьте фото ресторана с подписью `restaurant`

### Проверка результата:
```
/status - посмотреть все настройки
/preview - получить ссылку на сайт
```

## 🎉 Готово!

Ваш персональный свадебный сайт с управлением через Telegram бота готов к использованию!

Все изменения применяются мгновенно, и гости сразу увидят обновленную информацию.