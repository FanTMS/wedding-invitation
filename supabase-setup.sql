-- Удаление существующих политик (если есть)
DROP POLICY IF EXISTS "Allow public read access to responses" ON wedding_responses;
DROP POLICY IF EXISTS "Allow public insert access to responses" ON wedding_responses;
DROP POLICY IF EXISTS "Allow public read access to config" ON site_config;

-- Создание таблицы для RSVP ответов (правильное название)
CREATE TABLE IF NOT EXISTS rsvp_responses (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    attendance TEXT NOT NULL CHECK (attendance IN ('yes', 'with-guest', 'no')),
    guest_name TEXT,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы для конфигурации сайта
CREATE TABLE IF NOT EXISTS site_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_rsvp_responses_created_at ON rsvp_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rsvp_responses_attendance ON rsvp_responses(attendance);

-- Включение Row Level Security (RLS)
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для rsvp_responses
CREATE POLICY "Allow public read access to rsvp" ON rsvp_responses
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to rsvp" ON rsvp_responses
    FOR INSERT WITH CHECK (true);

-- Политики безопасности для site_config
CREATE POLICY "Allow public read access to site_config" ON site_config
    FOR SELECT USING (true);

CREATE POLICY "Allow public update to site_config" ON site_config
    FOR UPDATE USING (true);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_rsvp_responses_updated_at ON rsvp_responses;
CREATE TRIGGER update_rsvp_responses_updated_at 
    BEFORE UPDATE ON rsvp_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_config_updated_at ON site_config;
CREATE TRIGGER update_site_config_updated_at 
    BEFORE UPDATE ON site_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка базовой конфигурации (если не существует)
INSERT INTO site_config (config_key, config_value) 
SELECT 'wedding_info', '{
    "coupleNames": "Имя & Имя",
    "weddingDate": "2025-08-15",
    "timeline": [
        {
            "time": "15:00",
            "title": "Церемония бракосочетания",
            "description": "ул. [Адрес регистрации]<br>отдел ЗАГС [Район]",
            "note": "Торжественная регистрация брака"
        },
        {
            "time": "16:30",
            "title": "Фотосессия",
            "description": "Парк [Название парка]",
            "note": "Создаем красивые воспоминания"
        },
        {
            "time": "18:00",
            "title": "Праздничный банкет",
            "description": "ул. [Адрес банкета]<br>ресторан «[Название ресторана]»",
            "note": "Ужин, танцы и веселье до утра"
        }
    ],
    "restaurant": {
        "name": "Название ресторана",
        "address": "г. Город, ул. Адрес"
    },
    "deadline": "10 августа 2025",
    "contact": {
        "phone": "+7 (XXX) XXX-XX-XX",
        "telegram": "@username"
    },
    "quote": {
        "text": "Любовь не в том, чтобы смотреть друг на друга,<br>а в том, чтобы вместе смотреть в одном направлении",
        "author": "— Антуан де Сент-Экзюпери"
    },
    "images": {
        "couple": null,
        "restaurant": null,
        "heroPhoto1": null,
        "heroPhoto2": null,
        "heroMainPhoto": null
    },
    "virtualTour": {
        "enabled": false,
        "url": null
    }
}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM site_config WHERE config_key = 'wedding_info'
);

-- Миграция данных из старой таблицы (если существует)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'wedding_responses') THEN
        INSERT INTO rsvp_responses (full_name, phone, attendance, guest_name, message, created_at, updated_at)
        SELECT full_name, phone, attendance, guest_name, message, created_at, updated_at
        FROM wedding_responses
        WHERE NOT EXISTS (
            SELECT 1 FROM rsvp_responses 
            WHERE rsvp_responses.full_name = wedding_responses.full_name 
            AND rsvp_responses.created_at = wedding_responses.created_at
        );
    END IF;
END $$;