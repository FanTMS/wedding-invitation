const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Конфигурация
const TELEGRAM_CONFIG = {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '8322419038:AAGYxQZYZMKyHW-BY-Ydkx-pVBqmwE8h1ys',
    chatId: process.env.TELEGRAM_CHAT_ID || '5394381166', // Ваш Chat ID
    apiUrl: 'https://api.telegram.org/bot'
};

const SUPABASE_CONFIG = {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY,
    client: null
};

// Инициализация Supabase
if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.key) {
    SUPABASE_CONFIG.client = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
    console.log('✅ Supabase подключен');
} else {
    console.log('⚠️ Supabase не настроен, используется локальное хранилище');
}

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.telegram.org", "https://*.supabase.co"],
            frameSrc: ["'self'", "https:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));

app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true
}));

// Хранилище конфигурации сайта
let siteConfig = {
    coupleNames: 'Имя & Имя',
    weddingDate: '2025-08-15',
    timeline: [
        {
            time: '15:00',
            title: 'Церемония бракосочетания',
            description: 'ул. [Адрес регистрации]<br>отдел ЗАГС [Район]',
            note: 'Торжественная регистрация брака'
        },
        {
            time: '16:30',
            title: 'Фотосессия',
            description: 'Парк [Название парка]',
            note: 'Создаем красивые воспоминания'
        },
        {
            time: '18:00',
            title: 'Праздничный банкет',
            description: 'ул. [Адрес банкета]<br>ресторан «[Название ресторана]»',
            note: 'Ужин, танцы и веселье до утра'
        }
    ],
    restaurant: {
        name: 'Название ресторана',
        address: 'г. Город, ул. Адрес',
        phone: '+7 (XXX) XXX-XX-XX'
    },
    deadline: '10 августа 2025',
    contact: {
        phone: '+7 (XXX) XXX-XX-XX',
        telegram: '@username'
    },
    quote: {
        text: 'Любовь не в том, чтобы смотреть друг на друга,<br>а в том, чтобы вместе смотреть в одном направлении',
        author: '— Антуан де Сент-Экзюпери'
    },
    images: {
        couple: null,
        restaurant: null,
        heroPhoto1: null,
        heroPhoto2: null,
        heroMainPhoto: null
    },
    virtualTour: {
        enabled: false,
        url: null
    }
};

// Функция отправки сообщения в Telegram
async function sendTelegramMessage(chatId, message) {
    const url = `${TELEGRAM_CONFIG.apiUrl}${TELEGRAM_CONFIG.botToken}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error);
        return false;
    }
}

// Обработка команд бота
async function handleBotCommand(chatId, command, value) {
    console.log(`Команда от ${chatId}: ${command} ${value || ''}`);
    
    switch (command) {
        case '/start':
        case '/menu':
            return await sendBotMenu(chatId);
            
        case '/help':
            return await sendBotHelp(chatId);
            
        case '/status':
            return await sendSiteStatus(chatId);
            
        case '/names':
            if (!value) {
                return await sendTelegramMessage(chatId, '❌ Укажите имена: /names Анна & Михаил');
            }
            siteConfig.coupleNames = value;
            await saveSiteConfig();
            return await sendTelegramMessage(chatId, `✅ Имена обновлены: ${value}`);
            
        case '/date':
            if (!value || !isValidDate(value)) {
                return await sendTelegramMessage(chatId, '❌ Укажите дату в формате YYYY-MM-DD: /date 2025-08-15');
            }
            siteConfig.weddingDate = value;
            await saveSiteConfig();
            const formattedDate = new Date(value).toLocaleDateString('ru-RU');
            return await sendTelegramMessage(chatId, `✅ Дата свадьбы обновлена: ${formattedDate}`);
            
        case '/restaurant':
            if (!value) {
                return await sendTelegramMessage(chatId, '❌ Формат: /restaurant Название|Адрес|Телефон');
            }
            const parts = value.split('|');
            if (parts.length !== 3) {
                return await sendTelegramMessage(chatId, '❌ Нужно 3 части через |: Название|Адрес|Телефон');
            }
            siteConfig.restaurant = {
                name: parts[0].trim(),
                address: parts[1].trim(),
                phone: parts[2].trim()
            };
            await saveSiteConfig();
            return await sendTelegramMessage(chatId, `✅ Ресторан обновлен:\n${siteConfig.restaurant.name}\n${siteConfig.restaurant.address}\n${siteConfig.restaurant.phone}`);
            
        case '/deadline':
            if (!value) {
                return await sendTelegramMessage(chatId, '❌ Укажите дедлайн: /deadline 10 августа 2025');
            }
            siteConfig.deadline = value;
            await saveSiteConfig();
            return await sendTelegramMessage(chatId, `✅ Дедлайн обновлен: ${value}`);
            
        case '/contact':
            if (!value) {
                return await sendTelegramMessage(chatId, '❌ Формат: /contact +7(999)123-45-67|@username');
            }
            const contactParts = value.split('|');
            if (contactParts.length !== 2) {
                return await sendTelegramMessage(chatId, '❌ Нужно 2 части через |: Телефон|Telegram');
            }
            siteConfig.contact = {
                phone: contactParts[0].trim(),
                telegram: contactParts[1].trim()
            };
            await saveSiteConfig();
            return await sendTelegramMessage(chatId, `✅ Контакты обновлены:\n${siteConfig.contact.phone}\n${siteConfig.contact.telegram}`);
            
        case '/quote':
            if (!value) {
                return await sendTelegramMessage(chatId, '❌ Формат: /quote Текст цитаты|— Автор');
            }
            const quoteParts = value.split('|');
            if (quoteParts.length !== 2) {
                return await sendTelegramMessage(chatId, '❌ Нужно 2 части через |: Текст|Автор');
            }
            siteConfig.quote = {
                text: quoteParts[0].trim(),
                author: quoteParts[1].trim()
            };
            await saveSiteConfig();
            return await sendTelegramMessage(chatId, `✅ Цитата обновлена:\n"${siteConfig.quote.text}"\n${siteConfig.quote.author}`);
            
        case '/tour':
            if (!value) {
                return await sendTelegramMessage(chatId, '❌ Укажите URL виртуального тура: /tour https://example.com/tour');
            }
            siteConfig.virtualTour = {
                enabled: true,
                url: value
            };
            await saveSiteConfig();
            return await sendTelegramMessage(chatId, `✅ Виртуальный тур настроен: ${value}`);
            
        case '/preview':
            const siteUrl = process.env.SITE_URL || `http://localhost:${PORT}`;
            return await sendTelegramMessage(chatId, `🔗 <b>Ссылка на ваш сайт:</b>\n${siteUrl}\n\n💡 Откройте в браузере для просмотра изменений`);
            
        case '/backup':
            const backup = JSON.stringify(siteConfig, null, 2);
            return await sendTelegramMessage(chatId, `💾 <b>РЕЗЕРВНАЯ КОПИЯ НАСТРОЕК</b>\n\n<code>${backup}</code>\n\n💡 Сохраните этот текст для восстановления`);
            
        default:
            return await sendTelegramMessage(chatId, '❌ Неизвестная команда. Используйте /menu для просмотра доступных команд.');
    }
}

// Отправка главного меню
async function sendBotMenu(chatId) {
    const menuMessage = `
🎉 <b>УПРАВЛЕНИЕ СВАДЕБНЫМ САЙТОМ</b>

📝 <b>Основные команды:</b>
/names [Имя & Имя] - изменить имена молодоженов
/date [YYYY-MM-DD] - установить дату свадьбы
/restaurant [название|адрес|телефон] - обновить ресторан
/deadline [дата] - установить дедлайн ответов

📸 <b>Фотографии:</b>
Отправьте фото с подписью:
• couple - фото пары (футер)
• restaurant - фото ресторана
• hero1 - фоновое фото 1 (главная)
• hero2 - фоновое фото 2 (главная)
• heromain - главное фото (главная)

🏛️ <b>Виртуальный тур:</b>
/tour [URL] - настроить виртуальный тур ресторана

📞 <b>Контакты:</b>
/contact [телефон|telegram] - обновить контакты

💬 <b>Цитата:</b>
/quote [текст|автор] - изменить цитату

🔧 <b>Управление:</b>
/status - текущие настройки
/preview - ссылка на сайт
/backup - создать резервную копию
/help - подробная справка

<i>Пример: /names Анна & Михаил</i>
    `;
    
    return await sendTelegramMessage(chatId, menuMessage);
}

// Отправка справки
async function sendBotHelp(chatId) {
    const helpMessage = `
📖 <b>ПОДРОБНАЯ СПРАВКА</b>

<b>1. Имена молодоженов:</b>
/names Анна & Михаил

<b>2. Дата свадьбы:</b>
/date 2025-08-15

<b>3. Ресторан (через |):</b>
/restaurant Золотой зал|г. Москва, ул. Тверская 1|+7 (495) 123-45-67

<b>4. Дедлайн ответов:</b>
/deadline 10 августа 2025

<b>5. Контакты (через |):</b>
/contact +7 (999) 123-45-67|@username

<b>6. Цитата (через |):</b>
/quote Любовь - это...|— Автор

<b>7. Виртуальный тур:</b>
/tour https://your-tour-url.com

<b>8. Загрузка фото:</b>
Просто отправьте фото с подписью:
- "couple" - фото пары
- "restaurant" - фото ресторана
- "hero1", "hero2", "heromain" - фото для главной страницы

<b>Полезные команды:</b>
/status - посмотреть все настройки
/preview - получить ссылку на сайт
/backup - скачать настройки
    `;
    
    return await sendTelegramMessage(chatId, helpMessage);
}

// Отправка статуса сайта
async function sendSiteStatus(chatId) {
    const statusMessage = `
📊 <b>ТЕКУЩИЕ НАСТРОЙКИ САЙТА</b>

👥 <b>Молодожены:</b> ${siteConfig.coupleNames}
📅 <b>Дата свадьбы:</b> ${siteConfig.weddingDate}
🏛️ <b>Ресторан:</b> ${siteConfig.restaurant.name}
📍 <b>Адрес:</b> ${siteConfig.restaurant.address}
📞 <b>Телефон ресторана:</b> ${siteConfig.restaurant.phone}
⏰ <b>Дедлайн ответов:</b> ${siteConfig.deadline}

📱 <b>Контакты:</b>
Телефон: ${siteConfig.contact.phone}
Telegram: ${siteConfig.contact.telegram}

💬 <b>Цитата:</b> ${siteConfig.quote.author}

🖼️ <b>Изображения:</b>
Фото пары: ${siteConfig.images.couple ? '✅ Загружено' : '❌ Не загружено'}
Фото ресторана: ${siteConfig.images.restaurant ? '✅ Загружено' : '❌ Не загружено'}
Hero фото 1: ${siteConfig.images.heroPhoto1 ? '✅ Загружено' : '❌ Не загружено'}
Hero фото 2: ${siteConfig.images.heroPhoto2 ? '✅ Загружено' : '❌ Не загружено'}
Главное фото: ${siteConfig.images.heroMainPhoto ? '✅ Загружено' : '❌ Не загружено'}

🏛️ <b>Виртуальный тур:</b> ${siteConfig.virtualTour.enabled ? '✅ Настроен' : '❌ Не настроен'}
    `;
    
    return await sendTelegramMessage(chatId, statusMessage);
}

// Обработка загрузки фотографий
async function handlePhotoUpload(chatId, photos, caption) {
    const photoType = caption.toLowerCase().trim();
    const validTypes = ['couple', 'restaurant', 'hero1', 'hero2', 'heromain'];
    
    if (!validTypes.includes(photoType)) {
        return await sendTelegramMessage(chatId, `❌ Неизвестный тип фото. Используйте:\n- couple (фото пары)\n- restaurant (фото ресторана)\n- hero1 (фоновое фото 1)\n- hero2 (фоновое фото 2)\n- heromain (главное фото)`);
    }
    
    // Получаем самое большое фото
    const largestPhoto = photos[photos.length - 1];
    const fileUrl = `${TELEGRAM_CONFIG.apiUrl}${TELEGRAM_CONFIG.botToken}/getFile?file_id=${largestPhoto.file_id}`;
    
    try {
        const response = await fetch(fileUrl);
        const fileData = await response.json();
        
        if (fileData.ok) {
            const imageUrl = `https://api.telegram.org/file/bot${TELEGRAM_CONFIG.botToken}/${fileData.result.file_path}`;
            
            // Маппинг типов фотографий
            const photoMapping = {
                'couple': 'couple',
                'restaurant': 'restaurant',
                'hero1': 'heroPhoto1',
                'hero2': 'heroPhoto2',
                'heromain': 'heroMainPhoto'
            };
            
            siteConfig.images[photoMapping[photoType]] = imageUrl;
            await saveSiteConfig();
            
            const photoNames = {
                'couple': 'пары',
                'restaurant': 'ресторана',
                'hero1': 'фоновое 1',
                'hero2': 'фоновое 2',
                'heromain': 'главное фото'
            };
            
            return await sendTelegramMessage(chatId, `✅ Фото ${photoNames[photoType]} обновлено!`);
        }
    } catch (error) {
        console.error('Ошибка загрузки фото:', error);
        return await sendTelegramMessage(chatId, '❌ Ошибка загрузки фото. Попробуйте еще раз.');
    }
}

// Сохранение конфигурации
async function saveSiteConfig() {
    if (SUPABASE_CONFIG.client) {
        try {
            const { error } = await SUPABASE_CONFIG.client
                .from('site_config')
                .upsert([{
                    id: 1,
                    config: siteConfig,
                    updated_at: new Date().toISOString()
                }]);
            
            if (error) throw error;
            console.log('✅ Конфигурация сохранена в Supabase');
        } catch (error) {
            console.error('❌ Ошибка сохранения в Supabase:', error);
        }
    }
}

// Загрузка конфигурации при старте
async function loadSiteConfig() {
    if (SUPABASE_CONFIG.client) {
        try {
            const { data, error } = await SUPABASE_CONFIG.client
                .from('site_config')
                .select('*')
                .single();
            
            if (data && data.config) {
                siteConfig = { ...siteConfig, ...data.config };
                console.log('✅ Конфигурация загружена из Supabase');
            }
        } catch (error) {
            console.log('⚠️ Конфигурация не найдена в Supabase, используется по умолчанию');
        }
    }
}

// Вспомогательные функции
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

// Webhook для Telegram
app.post('/webhook/telegram', async (req, res) => {
    console.log('Telegram webhook received:', JSON.stringify(req.body, null, 2));
    
    try {
        const update = req.body;
        
        if (update.message) {
            const message = update.message;
            const chatId = message.chat.id;
            const text = message.text;
            
            // Обработка команд
            if (text && text.startsWith('/')) {
                const parts = text.split(' ');
                const command = parts[0];
                const value = parts.slice(1).join(' ');
                
                await handleBotCommand(chatId, command, value);
            }
            
            // Обработка фотографий
            if (message.photo && message.caption) {
                await handlePhotoUpload(chatId, message.photo, message.caption);
            }
            
            // Обработка ответов гостей (если отправлены в бот)
            if (text && !text.startsWith('/')) {
                // Можно добавить обработку текстовых сообщений
                await sendTelegramMessage(chatId, 'Используйте команды для управления сайтом. Напишите /menu для просмотра доступных команд.');
            }
        }
        
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Ошибка обработки webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API маршрут для получения конфигурации сайта
app.get('/api/config', (req, res) => {
    res.json(siteConfig);
});

// API маршрут для сохранения ответа гостя
app.post('/api/rsvp', async (req, res) => {
    try {
        const { fullName, phone, attendance, guestName, message } = req.body;
        
        // Валидация данных
        if (!fullName || !attendance) {
            return res.status(400).json({ error: 'Имя и подтверждение присутствия обязательны' });
        }
        
        const responseData = {
            full_name: fullName,
            phone: phone || null,
            attendance: attendance,
            guest_name: guestName || null,
            message: message || null,
            created_at: new Date().toISOString()
        };
        
        // Сохраняем в Supabase если настроен
        if (SUPABASE_CONFIG.client) {
            const { error } = await SUPABASE_CONFIG.client
                .from('wedding_responses')
                .insert([responseData]);
            
            if (error) {
                console.error('Ошибка сохранения в Supabase:', error);
                return res.status(500).json({ error: 'Ошибка сохранения ответа' });
            }
        }
        
        // Отправляем уведомление в Telegram
        const telegramMessage = formatGuestResponse(responseData);
        await sendTelegramMessage(TELEGRAM_CONFIG.chatId, telegramMessage);
        
        res.json({ success: true, message: 'Ответ сохранен успешно' });
    } catch (error) {
        console.error('Ошибка обработки RSVP:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// API маршрут для получения статистики ответов
app.get('/api/responses', async (req, res) => {
    try {
        if (!SUPABASE_CONFIG.client) {
            return res.json({ total: 0, responses: [] });
        }
        
        const { data, error } = await SUPABASE_CONFIG.client
            .from('wedding_responses')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
            total: data.length,
            responses: data,
            stats: {
                coming: data.filter(r => r.attendance === 'yes').length,
                withGuest: data.filter(r => r.attendance === 'with-guest').length,
                notComing: data.filter(r => r.attendance === 'no').length
            }
        });
    } catch (error) {
        console.error('Ошибка получения ответов:', error);
        res.status(500).json({ error: 'Ошибка получения данных' });
    }
});

// Функция форматирования ответа гостя для Telegram
function formatGuestResponse(data) {
    const attendanceText = {
        'yes': '✅ Буду присутствовать',
        'with-guest': '👥 Приду с гостем (+1)',
        'no': '❌ Не смогу прийти'
    };
    
    let message = `🎉 <b>НОВЫЙ ОТВЕТ НА СВАДЕБНОЕ ПРИГЛАШЕНИЕ</b>\n\n`;
    message += `👤 <b>Имя:</b> ${data.full_name}\n`;
    
    if (data.phone) {
        message += `📱 <b>Телефон:</b> ${data.phone}\n`;
    }
    
    message += `📋 <b>Присутствие:</b> ${attendanceText[data.attendance]}\n`;
    
    if (data.guest_name && data.attendance === 'with-guest') {
        message += `👥 <b>Имя гостя:</b> ${data.guest_name}\n`;
    }
    
    if (data.message) {
        message += `💬 <b>Комментарий:</b> ${data.message}\n`;
    }
    
    message += `\n⏰ <b>Время:</b> ${new Date(data.created_at).toLocaleString('ru-RU')}`;
    
    return message;
}

// Маршрут для настройки webhook Telegram
app.post('/api/setup-webhook', async (req, res) => {
    try {
        const webhookUrl = `${req.protocol}://${req.get('host')}/webhook/telegram`;
        const url = `${TELEGRAM_CONFIG.apiUrl}${TELEGRAM_CONFIG.botToken}/setWebhook`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: webhookUrl
            })
        });
        
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Webhook настроен:', webhookUrl);
            res.json({ success: true, webhookUrl, result });
        } else {
            console.error('❌ Ошибка настройки webhook:', result);
            res.status(400).json({ success: false, error: result });
        }
    } catch (error) {
        console.error('Ошибка настройки webhook:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Маршрут для проверки здоровья сервиса
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        telegram: {
            configured: !!TELEGRAM_CONFIG.botToken,
            botToken: TELEGRAM_CONFIG.botToken ? 'Configured' : 'Not configured'
        },
        supabase: {
            configured: !!SUPABASE_CONFIG.client,
            url: SUPABASE_CONFIG.url ? 'Configured' : 'Not configured'
        }
    });
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Обработка всех остальных маршрутов (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Polling для Telegram бота (для локальной разработки)
let lastUpdateId = 0;

async function startTelegramPolling() {
    console.log('🤖 Запуск Telegram polling...');
    
    setInterval(async () => {
        try {
            const response = await fetch(`${TELEGRAM_CONFIG.apiUrl}${TELEGRAM_CONFIG.botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=10`);
            const result = await response.json();
            
            if (result.ok && result.result.length > 0) {
                for (const update of result.result) {
                    lastUpdateId = update.update_id;
                    
                    if (update.message) {
                        const message = update.message;
                        const chatId = message.chat.id;
                        const text = message.text;
                        
                        console.log(`📨 Получено сообщение от ${chatId}: ${text}`);
                        
                        // Обработка команд
                        if (text && text.startsWith('/')) {
                            const parts = text.split(' ');
                            const command = parts[0];
                            const value = parts.slice(1).join(' ');
                            
                            await handleBotCommand(chatId, command, value);
                        }
                        
                        // Обработка фотографий
                        if (message.photo && message.caption) {
                            await handlePhotoUpload(chatId, message.photo, message.caption);
                        }
                        
                        // Обработка текстовых сообщений
                        if (text && !text.startsWith('/')) {
                            await sendTelegramMessage(chatId, 'Используйте команды для управления сайтом. Напишите /menu для просмотра доступных команд.');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка polling:', error);
        }
    }, 2000); // Проверяем каждые 2 секунды
}

// Запуск сервера
app.listen(PORT, async () => {
    console.log(`🎉 Wedding invitation site is running on port ${PORT}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    console.log(`📱 Telegram bot: ${TELEGRAM_CONFIG.botToken ? 'Configured' : 'Not configured'}`);
    console.log(`🗄️ Supabase: ${SUPABASE_CONFIG.url ? 'Configured' : 'Not configured'}`);
    
    // Загружаем конфигурацию при старте
    await loadSiteConfig();
    
    // Запускаем polling для бота
    if (TELEGRAM_CONFIG.botToken) {
        await startTelegramPolling();
        
        // Отправляем приветственное сообщение
        setTimeout(async () => {
            await sendTelegramMessage(TELEGRAM_CONFIG.chatId, '🤖 <b>Бот запущен и готов к работе!</b>\n\nИспользуйте /menu для просмотра команд управления сайтом.');
        }, 3000);
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});