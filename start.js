#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🎉 Запуск свадебного сайта...\n');

// Проверяем наличие Node.js модулей
if (!fs.existsSync('node_modules')) {
    console.log('📦 Установка зависимостей...');
    
    const install = spawn('npm', ['install'], {
        stdio: 'inherit',
        shell: true
    });
    
    install.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Зависимости установлены успешно!\n');
            startServer();
        } else {
            console.error('❌ Ошибка установки зависимостей');
            process.exit(1);
        }
    });
} else {
    startServer();
}

function startServer() {
    console.log('🚀 Запуск сервера...\n');
    
    // Устанавливаем переменные окружения по умолчанию
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.PORT = process.env.PORT || '3000';
    
    // Запускаем сервер
    const server = spawn('node', ['server.js'], {
        stdio: 'inherit',
        shell: true,
        env: process.env
    });
    
    server.on('close', (code) => {
        console.log(`\n🛑 Сервер остановлен с кодом ${code}`);
    });
    
    // Обработка сигналов для корректного завершения
    process.on('SIGINT', () => {
        console.log('\n🛑 Получен сигнал остановки...');
        server.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Получен сигнал завершения...');
        server.kill('SIGTERM');
    });
    
    // Показываем информацию о запуске
    setTimeout(() => {
        console.log('\n' + '='.repeat(60));
        console.log('🎉 СВАДЕБНЫЙ САЙТ ЗАПУЩЕН УСПЕШНО!');
        console.log('='.repeat(60));
        console.log(`🌐 Сайт доступен по адресу: http://localhost:${process.env.PORT}`);
        console.log(`🤖 Telegram бот: ${process.env.TELEGRAM_BOT_TOKEN ? 'Настроен' : 'Требует настройки'}`);
        console.log(`🗄️ Supabase: ${process.env.SUPABASE_URL ? 'Настроен' : 'Требует настройки'}`);
        console.log('\n📋 Что делать дальше:');
        console.log('1. Откройте сайт в браузере');
        console.log('2. Найдите вашего Telegram бота');
        console.log('3. Напишите боту /start');
        console.log('4. Настройте сайт командами бота');
        console.log('\n💡 Для остановки нажмите Ctrl+C');
        console.log('='.repeat(60) + '\n');
    }, 2000);
}