// Конфигурация по умолчанию
let SITE_CONFIG = {
    coupleNames: 'Имя & Имя',
    weddingDate: '2025-08-15',
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

// Загрузка конфигурации с сервера
async function loadConfigFromServer() {
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const config = await response.json();
            SITE_CONFIG = { ...SITE_CONFIG, ...config };
            updateSiteDisplay();
            console.log('✅ Конфигурация загружена с сервера');
        }
    } catch (error) {
        console.log('⚠️ Используется локальная конфигурация');
    }
}

// Обновление отображения сайта
function updateSiteDisplay() {
    // Обновляем имена
    document.querySelectorAll('.couple-names, .couple-signature').forEach(el => {
        el.textContent = SITE_CONFIG.coupleNames;
    });
    
    // Обновляем дату
    const date = new Date(SITE_CONFIG.weddingDate);
    const dateNumber = document.querySelector('.date-number');
    const dateMonth = document.querySelector('.date-month');
    const overlayDateNumber = document.querySelector('.overlay-date-number');
    const overlayDateMonth = document.querySelector('.overlay-date-month');
    
    if (dateNumber) dateNumber.textContent = date.getDate();
    if (dateMonth) dateMonth.textContent = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).toUpperCase();
    if (overlayDateNumber) overlayDateNumber.textContent = date.getDate();
    if (overlayDateMonth) overlayDateMonth.textContent = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).toUpperCase();
    
    // Обновляем ресторан
    document.querySelectorAll('[data-restaurant-name]').forEach(el => {
        el.textContent = SITE_CONFIG.restaurant.name;
    });
    document.querySelectorAll('[data-restaurant-address]').forEach(el => {
        el.textContent = SITE_CONFIG.restaurant.address;
    });
    
    // Обновляем дедлайн
    const deadlineEl = document.querySelector('.rsvp-description strong');
    if (deadlineEl) deadlineEl.textContent = SITE_CONFIG.deadline;
    
    // Обновляем контакты
    const phoneEl = document.querySelector('.contact-info a[href^="tel:"]');
    const telegramEl = document.querySelector('.contact-info a[href^="https://t.me/"]');
    if (phoneEl) {
        phoneEl.textContent = SITE_CONFIG.contact.phone;
        phoneEl.href = `tel:${SITE_CONFIG.contact.phone}`;
    }
    if (telegramEl) {
        telegramEl.textContent = SITE_CONFIG.contact.telegram;
        telegramEl.href = `https://t.me/${SITE_CONFIG.contact.telegram.replace('@', '')}`;
    }
    
    // Обновляем цитату
    const quoteText = document.querySelector('blockquote');
    const quoteAuthor = document.querySelector('cite');
    if (quoteText) quoteText.innerHTML = SITE_CONFIG.quote.text;
    if (quoteAuthor) quoteAuthor.textContent = SITE_CONFIG.quote.author;
    
    // Обновляем фотографии
    updateHeroPhotos();
    updateOtherImages();
}

// Обновление hero фотографий
function updateHeroPhotos() {
    updateHeroPhoto('hero-photo-1', SITE_CONFIG.images.heroPhoto1);
    updateHeroPhoto('hero-photo-2', SITE_CONFIG.images.heroPhoto2);
    updateHeroPhoto('hero-main-photo', SITE_CONFIG.images.heroMainPhoto);
}

function updateHeroPhoto(elementId, imageUrl) {
    const photoElement = document.getElementById(elementId);
    if (!photoElement) return;
    
    const img = photoElement.querySelector('.hero-img') || photoElement.querySelector('img');
    const placeholder = photoElement.querySelector('.photo-placeholder') || photoElement.querySelector('.main-photo-placeholder');
    
    if (imageUrl && img) {
        img.src = imageUrl;
        img.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    } else {
        if (img) img.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
    }
}

// Обновление остальных изображений
function updateOtherImages() {
    if (SITE_CONFIG.images.couple) {
        const coupleImg = document.getElementById('couple-img');
        if (coupleImg) coupleImg.src = SITE_CONFIG.images.couple;
    }
    
    if (SITE_CONFIG.images.restaurant) {
        const restaurantImg = document.getElementById('restaurant-img');
        if (restaurantImg) restaurantImg.src = SITE_CONFIG.images.restaurant;
    }
}

// Инициализация переключателя даты/фото
function initHeroToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const dateDisplay = document.getElementById('date-display');
    const photoDisplay = document.getElementById('photo-display');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mode = this.dataset.mode;
            
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            if (mode === 'date') {
                dateDisplay.style.display = 'block';
                photoDisplay.style.display = 'none';
            } else {
                dateDisplay.style.display = 'none';
                photoDisplay.style.display = 'block';
            }
        });
    });
}

// Виртуальный тур
function showVirtualTour() {
    const modal = document.getElementById('virtual-tour-modal');
    const iframe = document.getElementById('tour-iframe');
    const placeholder = document.getElementById('tour-placeholder');
    
    if (SITE_CONFIG.virtualTour.enabled && SITE_CONFIG.virtualTour.url) {
        iframe.src = SITE_CONFIG.virtualTour.url;
        iframe.style.display = 'block';
        placeholder.style.display = 'none';
    } else {
        iframe.style.display = 'none';
        placeholder.style.display = 'flex';
    }
    
    modal.classList.add('show');
}

function closeVirtualTour() {
    const modal = document.getElementById('virtual-tour-modal');
    const iframe = document.getElementById('tour-iframe');
    
    modal.classList.remove('show');
    iframe.src = '';
}

// Обработка формы RSVP
function initRSVPForm() {
    const form = document.getElementById('rsvp-form-modern');
    const guestDetails = document.getElementById('guest-details');
    const attendanceRadios = document.querySelectorAll('input[name="attendance"]');
    
    // Показ/скрытие поля для имени гостя
    attendanceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'with-guest') {
                guestDetails.style.display = 'block';
                guestDetails.querySelector('input').required = true;
            } else {
                guestDetails.style.display = 'none';
                guestDetails.querySelector('input').required = false;
                guestDetails.querySelector('input').value = '';
            }
        });
    });
    
    // Обработка отправки формы
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = form.querySelector('.btn-submit');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправляем...';
        submitButton.disabled = true;
        
        const formData = new FormData(form);
        const data = {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            attendance: formData.get('attendance'),
            guestName: formData.get('guestName'),
            message: formData.get('message')
        };
        
        try {
            const response = await fetch('/api/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            if (response.ok && result.success) {
                showSuccessModal();
                form.reset();
                guestDetails.style.display = 'none';
            } else {
                throw new Error(result.error || 'Ошибка отправки');
            }
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            showErrorMessage(error.message);
        }
    });
}

// Модальные окна
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('show');
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <i class="fas fa-exclamation-triangle"></i>
            ${message || 'Произошла ошибка при отправке. Попробуйте еще раз.'}
        </div>
    `;
    
    const form = document.getElementById('rsvp-form-modern');
    form.parentNode.insertBefore(errorDiv, form);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Навигация и карты
function openMap() {
    const address = SITE_CONFIG.restaurant.address;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://yandex.ru/maps/?text=${encodedAddress}`, '_blank');
}

function openNavigator() {
    const address = SITE_CONFIG.restaurant.address;
    const encodedAddress = encodeURIComponent(address);
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.open(`maps://maps.apple.com/?q=${encodedAddress}`);
        } else {
            window.open(`geo:0,0?q=${encodedAddress}`);
        }
    } else {
        window.open(`https://yandex.ru/maps/?rtext=~${encodedAddress}&rtt=auto`, '_blank');
    }
}

// Анимации при прокрутке (оптимизированы для мобильных)
function initScrollAnimations() {
    // Отключаем анимации на слабых устройствах
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                          navigator.deviceMemory <= 2 ||
                          window.innerWidth <= 480;
    
    if (isLowEndDevice) {
        console.log('🔧 Анимации отключены для оптимизации производительности');
        return;
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const sections = document.querySelectorAll('section:not(.hero)');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        observer.observe(section);
    });
}

// Плавная прокрутка
function initSmoothScroll() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const nextSection = document.querySelector('.quote-section');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Настройка webhook для Telegram бота
async function setupTelegramWebhook() {
    try {
        const response = await fetch('/api/setup-webhook', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Telegram webhook настроен:', result.webhookUrl);
        } else {
            console.log('⚠️ Ошибка настройки webhook:', result.error);
        }
    } catch (error) {
        console.log('⚠️ Не удалось настроить webhook:', error.message);
    }
}

// Определение мобильного устройства
function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

// Оптимизация для мобильных устройств
function initMobileOptimizations() {
    if (!isMobileDevice()) return;
    
    // Предотвращение зума при фокусе на input
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (this.style.fontSize !== '16px') {
                this.style.fontSize = '16px';
            }
        });
        
        input.addEventListener('blur', function() {
            this.style.fontSize = '';
        });
    });
    
    // Оптимизация touch событий
    let touchStartY = 0;
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        const touchY = e.touches[0].clientY;
        const touchDiff = touchStartY - touchY;
        
        // Предотвращение bounce эффекта на iOS
        if (document.body.scrollTop === 0 && touchDiff < 0) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Улучшение производительности прокрутки
    let ticking = false;
    function updateScrollPosition() {
        // Оптимизированная обработка прокрутки
        ticking = false;
    }
    
    document.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollPosition);
            ticking = true;
        }
    }, { passive: true });
    
    console.log('📱 Мобильные оптимизации активированы');
}

// Ленивая загрузка изображений
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback для старых браузеров
        images.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
        });
    }
}

// Управление экраном загрузки
let loadingProgress = 0;
let loadingTexts = [
    'Загружаем данные о торжестве...',
    'Подготавливаем фотографии...',
    'Настраиваем уведомления...',
    'Финальные штрихи...',
    'Готово! Добро пожаловать!'
];

function updateLoadingText() {
    const loadingTextElement = document.querySelector('.loading-text');
    if (loadingTextElement && loadingProgress < loadingTexts.length) {
        loadingTextElement.textContent = loadingTexts[loadingProgress];
        loadingProgress++;
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const body = document.body;
    
    if (loadingScreen) {
        // Финальное обновление текста
        const loadingTextElement = document.querySelector('.loading-text');
        if (loadingTextElement) {
            loadingTextElement.textContent = 'Готово! Добро пожаловать!';
        }
        
        // Задержка перед скрытием
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            body.classList.remove('loading');
            
            // Удаляем экран загрузки из DOM через 500мс
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 500);
        }, 500);
    }
}

// Симуляция загрузки с реалистичными этапами
async function simulateLoading() {
    const steps = [
        { delay: 300, text: 0 },   // Загружаем данные о торжестве
        { delay: 600, text: 1 },   // Подготавливаем фотографии
        { delay: 400, text: 2 },   // Настраиваем уведомления
        { delay: 500, text: 3 },   // Финальные штрихи
        { delay: 300, text: 4 }    // Готово!
    ];
    
    for (let step of steps) {
        await new Promise(resolve => {
            setTimeout(() => {
                loadingProgress = step.text;
                updateLoadingText();
                resolve();
            }, step.delay);
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎉 Инициализация свадебного сайта v5.0...');
    console.log('📱 Проверка отображения по умолчанию...');
    
    // Проверяем, что фото отображается по умолчанию
    const photoDisplay = document.getElementById('photo-display');
    const dateDisplay = document.getElementById('date-display');
    const overlayElements = document.querySelectorAll('.photo-date-overlay');
    
    console.log('📸 Фото отображение:', photoDisplay ? photoDisplay.style.display : 'не найдено');
    console.log('📅 Дата отображение:', dateDisplay ? dateDisplay.style.display : 'не найдено');
    console.log('🎭 Оверлей элементов найдено:', overlayElements.length);
    
    // Принудительно устанавливаем правильное отображение
    if (photoDisplay && dateDisplay) {
        photoDisplay.style.display = 'block';
        dateDisplay.style.display = 'none';
        
        // Также обновляем кнопки
        const photoBtn = document.querySelector('[data-mode="photo"]');
        const dateBtn = document.querySelector('[data-mode="date"]');
        
        if (photoBtn && dateBtn) {
            photoBtn.classList.add('active');
            dateBtn.classList.remove('active');
        }
        
        console.log('✅ Принудительно установлено отображение фото');
    }
    
    // Проверяем активные кнопки
    const activeButton = document.querySelector('.toggle-btn.active');
    console.log('🔘 Активная кнопка:', activeButton ? activeButton.dataset.mode : 'не найдена');
    
    // Запускаем симуляцию загрузки параллельно с реальной инициализацией
    const loadingSimulation = simulateLoading();
    
    // Реальная инициализация
    const initializationTasks = async () => {
        // Загружаем конфигурацию с сервера
        await loadConfigFromServer();
        
        // Инициализируем компоненты
        initHeroToggle();
        initRSVPForm();
        initScrollAnimations();
        initSmoothScroll();
        initMobileOptimizations();
        initLazyLoading();
        
        // Настраиваем webhook для бота
        await setupTelegramWebhook();
        
        // Предзагрузка критических ресурсов
        const criticalImages = [
            SITE_CONFIG.images.heroMainPhoto,
            SITE_CONFIG.images.couple,
            SITE_CONFIG.images.restaurant
        ].filter(Boolean);
        
        // Предзагружаем изображения
        const imagePromises = criticalImages.map(src => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve; // Продолжаем даже если изображение не загрузилось
                img.src = src;
            });
        });
        
        await Promise.all(imagePromises);
    };
    
    // Ждем завершения и симуляции, и реальной инициализации
    await Promise.all([loadingSimulation, initializationTasks()]);
    
    // Скрываем экран загрузки
    hideLoadingScreen();
    
    // Инициализируем обработчики после скрытия загрузки
    setTimeout(() => {
        // Закрытие модальных окон при клике вне их
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }
        
        const tourModal = document.getElementById('virtual-tour-modal');
        if (tourModal) {
            tourModal.addEventListener('click', function(e) {
                if (e.target === tourModal) {
                    closeVirtualTour();
                }
            });
        }
        
        // Обработка изменения ориентации экрана
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        });
        
        console.log('✅ Сайт инициализирован успешно!');
    }, 600);
});

// Экспорт функций для глобального использования
window.showVirtualTour = showVirtualTour;
window.closeVirtualTour = closeVirtualTour;
window.openMap = openMap;
window.openNavigator = openNavigator;
window.closeModal = closeModal;