// Карусель дельфинов
let currentSlide = 0;
let autoSlideInterval;
const slides = document.querySelectorAll('.dolphin-card');
const dots = document.querySelectorAll('.dot');
const carousel = document.querySelector('.carousel');

// Инициализация карусели
function initCarousel() {
    updateCarousel();
    startAutoSlide();
    
    // Слушатели для паузы при наведении
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopAutoSlide);
        carouselContainer.addEventListener('mouseleave', startAutoSlide);
    }
}

// Обновление карусели
function updateCarousel() {
    // Обновляем слайды
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlide);
    });
    
    // Обновляем точки
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
    
    // Сдвигаем карусель
    if (carousel && slides.length > 0) {
        const slideWidth = slides[0].offsetWidth + 20; // + gap
        carousel.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
    }
}

// Функции навигации
function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
}

// Автопрокрутка
function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(nextSlide, 5000);
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
}

// Воспроизведение звука
function playSound(soundFile) {
    const audio = document.getElementById('audio-player');
    if (!audio) {
        console.error('Аудио элемент не найден');
        showMessage('Ошибка: аудио элемент не найден', 'error');
        return;
    }
    
    // Загружаем звук
    audio.src = 'sounds/' + soundFile;
    
    // Пытаемся воспроизвести
    audio.play().then(() => {
        console.log('Воспроизводится:', soundFile);
        showMessage('🔊 Слушаем голос дельфина...', 'success');
    }).catch(error => {
        console.error('Ошибка воспроизведения:', error);
        
        // Проверяем тип ошибки
        let message = 'Не удалось воспроизвести звук';
        if (error.name === 'NotAllowedError') {
            message = 'Разрешите звук в настройках браузера';
        } else if (error.name === 'NotFoundError') {
            message = 'Звуковой файл не найден';
        }
        
        showMessage(message, 'error');
        
        // Предлагаем пользователю разрешить звук
        if (error.name === 'NotAllowedError') {
            setTimeout(() => {
                if (confirm('Хотите разрешить звук на этом сайте?')) {
                    audio.play().catch(e => {
                        console.log('Пользователь отказал в разрешении');
                    });
                }
            }, 1000);
        }
    });
}

// Показ сообщений
function showMessage(text, type = 'info') {
    // Удаляем старое сообщение
    const oldMessage = document.querySelector('.message-popup');
    if (oldMessage) {
        oldMessage.remove();
    }
    
    // Определяем цвет в зависимости от типа
    let bgColor = '#64ccff';
    if (type === 'error') bgColor = '#ff6b6b';
    if (type === 'success') bgColor = '#4ecdc4';
    
    // Создаём новое сообщение
    const message = document.createElement('div');
    message.className = 'message-popup';
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: #0a192f;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
        font-weight: bold;
        text-align: center;
        min-width: 250px;
        max-width: 400px;
        backdrop-filter: blur(10px);
    `;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 300);
    }, 3000);
}

// Добавляем CSS анимации
function addAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { 
                transform: translate(-50%, -100%); 
                opacity: 0; 
            }
            to { 
                transform: translate(-50%, 0); 
                opacity: 1; 
            }
        }
        
        @keyframes slideOut {
            from { 
                transform: translate(-50%, 0); 
                opacity: 1; 
            }
            to { 
                transform: translate(-50%, -100%); 
                opacity: 0; 
            }
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// Обработчики событий
function setupEventListeners() {
    // Клавиатура
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        }
        if (e.key === 'ArrowRight') {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        }
    });
    
    // Свайп для мобильных
    let startX = 0;
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        stopAutoSlide();
    });
    
    carousel.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        const swipeThreshold = 50;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
        startAutoSlide();
    });
    
    // Эффекты при наведении на карточки
    slides.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('active')) return;
            card.style.animation = 'pulse 0.5s ease';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.animation = '';
        });
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Сайт "Мир дельфинов" загружен!');
    
    // Добавляем анимации
    addAnimations();
    
    // Инициализируем карусель
    initCarousel();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Информация в консоль
    console.log(`Загружено ${slides.length} карточек дельфинов`);
    console.log('Управление: ← → стрелки или кнопки навигации');
});