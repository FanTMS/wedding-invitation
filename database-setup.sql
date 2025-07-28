-- Полная настройка базы данных для свадебного сайта
-- Выполните этот скрипт в SQL Editor вашей Supabase

-- 1. Создание таблицы для конфигурации сайта
CREATE TABLE IF NOT EXISTS site_config (
    id SERIAL PRIMARY KEY,
    couple_names VARCHAR(255) DEFAULT 'Имя & Имя',
    wedding_date DATE DEFAULT '2025-08-15',
    restaurant_name VARCHAR(255) DEFAULT 'Название ресторана',
    restaurant_address TEXT DEFAULT 'г. Город, ул. Адрес',
    restaurant_phone VARCHAR(50) DEFAULT '+7 (XXX) XXX-XX-XX',
    deadline VARCHAR(100) DEFAULT '10 августа 2025',
    contact_phone VARCHAR(50) DEFAULT '+7 (XXX) XXX-XX-XX',
    contact_telegram VARCHAR(100) DEFAULT '@username',
    quote_text TEXT DEFAULT 'Любовь не в том, чтобы смотреть друг на друга,<br>а в том, чтобы вместе смотреть в одном направлении',
    quote_author VARCHAR(255) DEFAULT '— Антуан де Сент-Экзюпери',
    virtual_tour_enabled BOOLEAN DEFAULT FALSE,
    virtual_tour_url TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Создание таблицы для изображений
CREATE TABLE IF NOT EXISTS site_images (
    id SERIAL PRIMARY KEY,
    image_type VARCHAR(50) NOT NULL, -- 'couple', 'restaurant', 'hero1', 'hero2', 'heromain'
    image_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    telegram_file_id VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Создание таблицы для программы торжества
CREATE TABLE IF NOT EXISTS wedding_timeline (
    id SERIAL PRIMARY KEY,
    time_slot VARCHAR(10) NOT NULL, -- '15:00'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    note TEXT,
    icon VARCHAR(50) DEFAULT 'fas fa-heart',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создание таблицы для ответов гостей (RSVP)
CREATE TABLE IF NOT EXISTS wedding_responses (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    attendance VARCHAR(20) NOT NULL CHECK (attendance IN ('yes', 'with-guest', 'no')),
    guest_name VARCHAR(255),
    message TEXT,
    telegram_user_id VARCHAR(50),
    telegram_username VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Создание таблицы для цветовой палитры дресс-кода
CREATE TABLE IF NOT EXISTS dress_code_colors (
    id SERIAL PRIMARY KEY,
    color_name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(7) NOT NULL, -- #90EE90
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 6. Вставка начальных данных для конфигурации
INSERT INTO site_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 7. Вставка начальной программы торжества
INSERT INTO wedding_timeline (time_slot, title, description, note, icon, order_index) VALUES
('15:00', 'Церемония бракосочетания', 'ул. [Адрес регистрации]<br>отдел ЗАГС [Район]', 'Торжественная регистрация брака', 'fas fa-rings-wedding', 1),
('16:30', 'Фотосессия', 'Парк [Название парка]', 'Создаем красивые воспоминания', 'fas fa-camera', 2),
('18:00', 'Праздничный банкет', 'ул. [Адрес банкета]<br>ресторан «[Название ресторана]»', 'Ужин, танцы и веселье до утра', 'fas fa-utensils', 3)
ON CONFLICT DO NOTHING;

-- 8. Вставка цветов дресс-кода
INSERT INTO dress_code_colors (color_name, color_hex, order_index) VALUES
('Чёрный', '#000000', 1),
('Белый', '#FFFFFF', 2),
('Бежевый', '#F5F5DC', 3),
('Коричневый', '#8B4513', 4),
('Светло-зелёный', '#90EE90', 5),
('Мятно-зелёный', '#66CDAA', 6),
('Лесной зелёный', '#228B22', 7)
ON CONFLICT DO NOTHING;

-- 9. Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_site_config_updated_at 
    BEFORE UPDATE ON site_config 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_site_images_type ON site_images(image_type);
CREATE INDEX IF NOT EXISTS idx_site_images_active ON site_images(is_active);
CREATE INDEX IF NOT EXISTS idx_wedding_responses_created_at ON wedding_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_wedding_timeline_order ON wedding_timeline(order_index);
CREATE INDEX IF NOT EXISTS idx_dress_code_colors_order ON dress_code_colors(order_index);

-- 12. Настройка RLS (Row Level Security) - опционально
-- ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wedding_timeline ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE wedding_responses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dress_code_colors ENABLE ROW LEVEL SECURITY;

-- 13. Создание политик безопасности (если нужно)
-- CREATE POLICY "Allow all operations for authenticated users" ON site_config FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for authenticated users" ON site_images FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for authenticated users" ON wedding_timeline FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for authenticated users" ON wedding_responses FOR ALL USING (true);
-- CREATE POLICY "Allow all operations for authenticated users" ON dress_code_colors FOR ALL USING (true);

-- 14. Создание представления для полной конфигурации сайта
CREATE OR REPLACE VIEW site_full_config AS
SELECT 
    sc.*,
    COALESCE(
        json_object_agg(
            si.image_type, 
            json_build_object(
                'url', si.image_url,
                'file_name', si.file_name,
                'uploaded_at', si.uploaded_at
            )
        ) FILTER (WHERE si.image_type IS NOT NULL), 
        '{}'::json
    ) as images,
    COALESCE(
        json_agg(
            json_build_object(
                'time', wt.time_slot,
                'title', wt.title,
                'description', wt.description,
                'note', wt.note,
                'icon', wt.icon
            ) ORDER BY wt.order_index
        ) FILTER (WHERE wt.id IS NOT NULL),
        '[]'::json
    ) as timeline,
    COALESCE(
        json_agg(
            json_build_object(
                'name', dcc.color_name,
                'hex', dcc.color_hex
            ) ORDER BY dcc.order_index
        ) FILTER (WHERE dcc.id IS NOT NULL),
        '[]'::json
    ) as dress_colors
FROM site_config sc
LEFT JOIN site_images si ON si.is_active = true
LEFT JOIN wedding_timeline wt ON wt.is_active = true
LEFT JOIN dress_code_colors dcc ON dcc.is_active = true
WHERE sc.id = 1
GROUP BY sc.id;

-- 15. Создание функции для получения статистики ответов
CREATE OR REPLACE FUNCTION get_rsvp_stats()
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'coming', COUNT(*) FILTER (WHERE attendance = 'yes'),
        'with_guest', COUNT(*) FILTER (WHERE attendance = 'with-guest'),
        'not_coming', COUNT(*) FILTER (WHERE attendance = 'no'),
        'total_guests', 
            COUNT(*) FILTER (WHERE attendance = 'yes') + 
            COUNT(*) FILTER (WHERE attendance = 'with-guest') * 2,
        'latest_responses', (
            SELECT json_agg(
                json_build_object(
                    'name', full_name,
                    'attendance', attendance,
                    'guest_name', guest_name,
                    'created_at', created_at
                ) ORDER BY created_at DESC
            )
            FROM (
                SELECT * FROM wedding_responses 
                ORDER BY created_at DESC 
                LIMIT 10
            ) latest
        )
    ) INTO result
    FROM wedding_responses;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 16. Создание bucket для изображений в Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'wedding-images',
    'wedding-images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 17. Настройка политик для Storage bucket
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'wedding-images');

CREATE POLICY "Allow authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'wedding-images');

CREATE POLICY "Allow authenticated update" ON storage.objects
FOR UPDATE USING (bucket_id = 'wedding-images');

CREATE POLICY "Allow authenticated delete" ON storage.objects
FOR DELETE USING (bucket_id = 'wedding-images');

-- Готово! Теперь ваша база данных настроена для полноценной работы свадебного сайта.
-- 
-- Основные таблицы:
-- - site_config: основная конфигурация сайта
-- - site_images: все изображения с метаданными
-- - wedding_timeline: программа торжества
-- - wedding_responses: ответы гостей
-- - dress_code_colors: цвета дресс-кода
--
-- Дополнительные возможности:
-- - Автоматическое обновление времени изменения
-- - Индексы для быстрого поиска
-- - Представление для получения полной конфигурации
-- - Функция для статистики ответов
-- - Готовность к настройке безопасности (RLS)