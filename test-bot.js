const BOT_TOKEN = '8322419038:AAGYxQZYZMKyHW-BY-Ydkx-pVBqmwE8h1ys';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Функция для отправки сообщения
async function sendMessage(chatId, text) {
    try {
        const response = await fetch(`${API_URL}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });

        const result = await response.json();
        console.log('Сообщение отправлено:', result);
        return result.ok;
    } catch (error) {
        console.error('Ошибка отправки:', error);
        return false;
    }
}

// Функция для получения обновлений
async function getUpdates() {
    try {
        const response = await fetch(`${API_URL}/getUpdates`);
        const result = await response.json();

        if (result.ok && result.result.length > 0) {
            console.log('Найдены сообщения:');
            result.result.forEach(update => {
                if (update.message) {
                    const msg = update.message;
                    console.log(`Chat ID: ${msg.chat.id}`);
                    console.log(`От: ${msg.from.first_name} ${msg.from.last_name || ''}`);
                    console.log(`Текст: ${msg.text}`);
                    console.log('---');
                }
            });

            // Получаем последний chat_id
            const lastMessage = result.result[result.result.length - 1];
            if (lastMessage.message) {
                const chatId = lastMessage.message.chat.id;
                console.log(`\n🎯 Ваш Chat ID: ${chatId}`);

                // Отправляем тестовое сообщение
                console.log('\n📤 Отправляем тестовое сообщение...');
                await sendMessage(chatId, '🤖 <b>Бот работает!</b>\n\nВаш Chat ID: ' + chatId + '\n\nТеперь можете использовать команды:\n/start - главное меню\n/help - справка');

                return chatId;
            }
        } else {
            console.log('❌ Сообщений не найдено. Напишите боту любое сообщение и запустите скрипт снова.');
        }
    } catch (error) {
        console.error('Ошибка получения обновлений:', error);
    }

    return null;
}

// Функция для проверки бота
async function checkBot() {
    try {
        const response = await fetch(`${API_URL}/getMe`);
        const result = await response.json();

        if (result.ok) {
            console.log('✅ Бот активен:');
            console.log(`Имя: ${result.result.first_name}`);
            console.log(`Username: @${result.result.username}`);
            console.log(`ID: ${result.result.id}`);
            return true;
        } else {
            console.log('❌ Ошибка проверки бота:', result);
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка подключения к боту:', error);
        return false;
    }
}

// Основная функция
async function main() {
    console.log('🤖 Тестирование Telegram бота...\n');

    // Проверяем бота
    const botActive = await checkBot();
    if (!botActive) {
        console.log('❌ Бот недоступен. Проверьте токен.');
        return;
    }

    console.log('\n📨 Получение сообщений...');
    const chatId = await getUpdates();

    if (chatId) {
        console.log(`\n✅ Готово! Ваш Chat ID: ${chatId}`);
        console.log('\n🚀 Теперь можете запустить основной сервер:');
        console.log('node server.js');
    }
}

// Запускаем
main().catch(console.error);