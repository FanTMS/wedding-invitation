-- Создание таблицы для ответов гостей
CREATE TABLE IF NOT EXISTS wedding_responses (
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
    id INTEGER PRIMARY KEY DEFAULT 1,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_config CHECK (id = 1)
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_wedding_responses_created_at ON wedding_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wedding_responses_attendance ON wedding_responses(attendance);

-- Включение Row Level Security (RLS)
ALTER TABLE wedding_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для публичного доступа (только для чтения ответов)
CREATE POLICY "Allow public read access to responses" ON wedding_responses
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to responses" ON wedding_responses
    FOR INSERT WITH CHECK (true);

-- Политики для конфигурации сайта (только чтение для публики)
CREATE POLICY "Allow public read access to config" ON site_config
    FOR SELECT USING (true);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_wedding_responses_updated_at 
    BEFORE UPDATE ON wedding_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at 
    BEFORE UPDATE ON site_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Вставка начальной конфигурации
INSERT INTO site_config (id, config) VALUES (1, '{
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
        "address": "г. Город, ул. Адрес",
        "phone": "+7 (XXX) XXX-XX-XX"
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
}') ON CONFLICT (id) DO NOTHING;