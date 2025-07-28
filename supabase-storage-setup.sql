-- Настройка Supabase Storage для свадебного сайта
-- Выполните этот скрипт в SQL Editor вашего Supabase проекта

-- ВАЖНО: Если получаете ошибку прав доступа, создайте bucket через интерфейс Supabase!

-- 1. Создание bucket для изображений свадебного сайта
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'wedding-images',
    'wedding-images', 
    true,
    10485760, -- 10MB лимит на файл
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. Проверка создания bucket
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'wedding-images';

-- АЛЬТЕРНАТИВНЫЙ СПОСОБ СОЗДАНИЯ BUCKET:
-- Если SQL не работает, создайте bucket через интерфейс:
-- 1. Перейдите в Storage в левом меню Supabase
-- 2. Нажмите "New bucket"
-- 3. Введите название: wedding-images
-- 4. Включите "Public bucket"
-- 5. Нажмите "Save"

-- Готово! 
-- Bucket 'wedding-images' создан для:
-- - Публичного доступа к изображениям
-- - Загрузки файлов до 10MB
-- - Поддержки всех форматов изображений