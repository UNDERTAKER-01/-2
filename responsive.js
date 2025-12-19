// Адаптивные функции для сайта мониторинга спутников

class ResponsiveManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupViewportMeta();
        this.handleResize();
        this.createStarfield();
        this.setupTouchGestures();
        this.detectDevice();
    }

    setupEventListeners() {
        // Обработчик изменения размера окна с троттлингом
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 100);
        });

        // Обработчик изменения ориентации
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleOrientationChange(), 300);
        });

        // Кнопка меню для мобильных
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Кнопка закрытия сайдбара
        const closeBtn = document.querySelector('.close-sidebar');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Закрытие модальных окон при клике вне их
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target);
            }
        });

        // Обработка клавиши Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
                this.closeSidebar();
            }
        });
    }

    setupViewportMeta() {
        // Динамическая установка viewport для iOS
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                let content = viewport.getAttribute('content');
                // Предотвращаем автоматический зум при фокусе
                content = content.replace('user-scalable=yes', 'user-scalable=no');
                content += ', maximum-scale=5.0';
                viewport.setAttribute('content', content);
            }
        }
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isMobile = width <= 767;
        const isTablet = width >= 768 && width <= 1023;
        const isDesktop = width >= 1024;

        // Обновляем классы body для CSS медиа-запросов
        document.body.classList.remove('mobile-view', 'tablet-view', 'desktop-view');
        
        if (isMobile) {
            document.body.classList.add('mobile-view');
            this.adaptForMobile();
        } else if (isTablet) {
            document.body.classList.add('tablet-view');
            this.adaptForTablet();
        } else {
            document.body.classList.add('desktop-view');
            this.adaptForDesktop();
        }

        // Обновляем высоту карты
        this.updateMapHeight();
        
        // Обновляем видимость элементов
        this.updateElementVisibility();
        
        // Логируем изменение размера (для отладки)
        console.log(`Размер окна: ${width}x${height}, Устройство: ${this.deviceType}`);
    }

    handleOrientationChange() {
        const orientation = window.orientation;
        const isPortrait = Math.abs(orientation) === 0 || Math.abs(orientation) === 180;
        
        if (isPortrait && window.innerWidth <= 767) {
            // Показываем предупреждение в портретной ориентации на мобильных
            this.showOrientationWarning();
        } else {
            this.hideOrientationWarning();
        }
        
        // Пересчитываем высоту карты
        setTimeout(() => this.updateMapHeight(), 100);
    }

    showOrientationWarning() {
        const warning = document.querySelector('.device-warning');
        if (warning) {
            warning.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideOrientationWarning() {
        const warning = document.querySelector('.device-warning');
        if (warning) {
            warning.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    adaptForMobile() {
        console.log('Адаптация для мобильных устройств');
        
        // Скрываем сайдбар по умолчанию
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.display = 'none';
        }
        
        // Показываем кнопку меню
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (menuBtn) {
            menuBtn.style.display = 'flex';
        }
        
        // Упрощаем навигацию по карте
        this.simplifyMapControls();
        
        // Оптимизируем таблицы для мобильных
        this.optimizeTablesForMobile();
        
        // Увеличиваем область клика для интерактивных элементов
        this.increaseTouchTargets();
    }

    adaptForTablet() {
        console.log('Адаптация для планшетов');
        
        // Показываем сайдбар
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.display = 'flex';
        }
        
        // Скрываем кнопку меню
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (menuBtn) {
            menuBtn.style.display = 'none';
        }
        
        // Оптимизируем расположение элементов
        this.optimizeLayoutForTablet();
        
        // Настраиваем карту для планшета
        this.setupMapForTablet();
    }

    adaptForDesktop() {
        console.log('Адаптация для десктопов');
        
        // Показываем сайдбар
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.display = 'flex';
        }
        
        // Скрываем кнопку меню
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (menuBtn) {
            menuBtn.style.display = 'none';
        }
        
        // Восстанавливаем полную функциональность
        this.restoreFullFunctionality();
    }

    updateMapHeight() {
        const mapContainer = document.querySelector('.map-container');
        if (!mapContainer) return;

        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        
        let headerHeight = header ? header.offsetHeight : 100;
        let footerHeight = footer ? footer.offsetHeight : 80;
        
        // Для мобильных устройств в портретной ориентации
        if (windowWidth <= 767 && windowWidth < windowHeight) {
            const mapHeight = Math.min(windowHeight * 0.4, 400);
            mapContainer.style.height = `${mapHeight}px`;
            mapContainer.style.minHeight = '300px';
        }
        // Для планшетов и мобильных в ландшафтной ориентации
        else if (windowWidth <= 1023) {
            const availableHeight = windowHeight - headerHeight - footerHeight - 100;
            const mapHeight = Math.min(availableHeight, 600);
            mapContainer.style.height = `${mapHeight}px`;
            mapContainer.style.minHeight = '400px';
        }
        // Для десктопов
        else {
            const availableHeight = windowHeight - headerHeight - footerHeight - 80;
            const mapHeight = Math.min(availableHeight, 800);
            mapContainer.style.height = `${mapHeight}px`;
            mapContainer.style.minHeight = '600px';
            
            // Для очень высоких экранов
            if (windowHeight > 1000) {
                mapContainer.style.height = 'calc(100vh - 250px)';
                mapContainer.style.maxHeight = '1000px';
            }
        }
    }

    updateElementVisibility() {
        const isMobile = window.innerWidth <= 767;
        const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1023;
        
        // Обновляем видимость статус-бара
        const statusBar = document.querySelector('.status-bar');
        const mobileStatus = document.querySelector('.mobile-status-bar');
        
        if (statusBar && mobileStatus) {
            if (isMobile) {
                statusBar.style.display = 'none';
                mobileStatus.style.display = 'block';
            } else {
                statusBar.style.display = 'flex';
                mobileStatus.style.display = 'none';
            }
        }
        
        // Обновляем видимость элементов в подвале
        const constructionNotice = document.querySelector('.construction-notice');
        if (constructionNotice) {
            if (isMobile) {
                constructionNotice.style.display = 'none';
            } else {
                constructionNotice.style.display = 'flex';
            }
        }
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (sidebar && menuBtn) {
            if (sidebar.style.display === 'flex' || sidebar.classList.contains('active')) {
                sidebar.style.display = 'none';
                sidebar.classList.remove('active');
                menuBtn.classList.remove('active');
            } else {
                sidebar.style.display = 'flex';
                sidebar.classList.add('active');
                menuBtn.classList.add('active');
                
                // Анимация появления
                sidebar.style.animation = 'slideUp 0.3s ease';
            }
        }
    }

    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (sidebar && menuBtn) {
            sidebar.style.display = 'none';
            sidebar.classList.remove('active');
            menuBtn.classList.remove('active');
        }
    }

    createStarfield() {
        const starfield = document.getElementById('starfield');
        if (!starfield) return;

        // Очищаем существующие звезды
        starfield.innerHTML = '';
        
        // Количество звезд в зависимости от размера экрана
        const starCount = Math.min(window.innerWidth * window.innerHeight / 1000, 500);
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Случайный размер
            const size = Math.random();
            if (size < 0.7) star.classList.add('small');
            else if (size < 0.9) star.classList.add('medium');
            else star.classList.add('large');
            
            // Случайное мерцание
            if (Math.random() > 0.5) star.classList.add('twinkling');
            
            // Случайная позиция
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            
            // Случайная скорость мерцания
            if (star.classList.contains('twinkling')) {
                star.style.animationDuration = `${Math.random() * 3 + 1}s`;
                star.style.animationDelay = `${Math.random() * 2}s`;
            }
            
            starfield.appendChild(star);
        }
    }

    setupTouchGestures() {
        const mapContainer = document.querySelector('.map-container');
        if (!mapContainer || !('ontouchstart' in window)) return;

        let startX, startY, startTime;
        let isDragging = false;
        const threshold = 10; // Порог для определения свайпа

        mapContainer.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
            isDragging = false;
            
            // Предотвращаем скролл страницы при касании карты
            e.preventDefault();
        }, { passive: false });

        mapContainer.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            
            // Если движение превышает порог - это драг
            if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
                isDragging = true;
                this.handleMapDrag(deltaX, deltaY);
                startX = touch.clientX;
                startY = touch.clientY;
                e.preventDefault();
            }
        }, { passive: false });

        mapContainer.addEventListener('touchend', (e) => {
            if (!isDragging) {
                // Это был тап, а не драг
                const touch = e.changedTouches[0];
                this.handleMapTap(touch.clientX, touch.clientY);
            }
            
            startX = null;
            startY = null;
            isDragging = false;
        });

        // Обработчик зума двумя пальцами
        let initialDistance = null;
        
        mapContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                e.preventDefault();
            }
        }, { passive: false });

        mapContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && initialDistance !== null) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                
                const zoomDelta = currentDistance / initialDistance;
                this.handlePinchZoom(zoomDelta);
                initialDistance = currentDistance;
                e.preventDefault();
            }
        }, { passive: false });

        mapContainer.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                initialDistance = null;
            }
        });
    }

    handleMapDrag(deltaX, deltaY) {
        // Реализация драга карты
        const galaxyMap = document.getElementById('galaxy-map');
        if (galaxyMap) {
            const currentTransform = galaxyMap.style.transform || 'translate(0px, 0px) scale(1)';
            const match = currentTransform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
            
            if (match) {
                const currentX = parseFloat(match[1]) || 0;
                const currentY = parseFloat(match[2]) || 0;
                
                // Чувствительность драга для мобильных
                const sensitivity = window.innerWidth <= 767 ? 0.7 : 1;
                const newX = currentX + deltaX * sensitivity;
                const newY = currentY + deltaY * sensitivity;
                
                galaxyMap.style.transform = `translate(${newX}px, ${newY}px) scale(${this.getCurrentZoom()})`;
                
                // Обновляем координаты
                this.updateCoordinates(newX, newY);
            }
        }
    }

    handleMapTap(x, y) {
        // Проверяем, был ли тап по спутнику
        const elements = document.elementsFromPoint(x, y);
        const satellite = elements.find(el => el.classList.contains('satellite-map'));
        
        if (satellite) {
            // Симулируем клик по спутнику
            satellite.click();
        } else {
            // Показываем координаты тапа
            this.showTapCoordinates(x, y);
        }
    }

    handlePinchZoom(zoomDelta) {
        const zoomSlider = document.getElementById('zoom-slider');
        if (zoomSlider) {
            let currentZoom = parseFloat(zoomSlider.value) || 2;
            const newZoom = Math.max(1, Math.min(5, currentZoom * zoomDelta));
            zoomSlider.value = newZoom;
            
            // Триггерим событие изменения
            zoomSlider.dispatchEvent(new Event('input'));
        }
    }

    simplifyMapControls() {
        // Упрощаем элементы управления для мобильных
        const complexControls = document.querySelectorAll('.complex-control');
        complexControls.forEach(control => {
            control.style.display = 'none';
        });
    }

    optimizeTablesForMobile() {
        const tables = document.querySelectorAll('.satellite-table');
        tables.forEach(table => {
            // Скрываем неважные колонки на мобильных
            const headers = table.querySelectorAll('th');
            headers.forEach((header, index) => {
                if (index > 2) { // Оставляем только первые 3 колонки
                    const cells = table.querySelectorAll(`td:nth-child(${index + 1})`);
                    cells.forEach(cell => cell.style.display = 'none');
                    header.style.display = 'none';
                }
            });
            
            // Добавляем возможность прокрутки
            table.parentElement.style.overflowX = 'auto';
            table.style.minWidth = '500px';
        });
    }

    increaseTouchTargets() {
        // Увеличиваем область клика для интерактивных элементов
        const touchElements = document.querySelectorAll('.btn, .satellite-map, .panel h3');
        touchElements.forEach(element => {
            element.style.padding = '12px 16px';
            element.style.minHeight = '44px';
            element.style.minWidth = '44px';
        });
    }

    optimizeLayoutForTablet() {
        // Оптимизация для планшетов
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.flexDirection = 'column';
        }
        
        // Увеличиваем шрифты для планшетов
        const textElements = document.querySelectorAll('p, span, div:not(.logo)');
        textElements.forEach(element => {
            const currentSize = parseFloat(getComputedStyle(element).fontSize);
            if (currentSize < 14) {
                element.style.fontSize = '15px';
            }
        });
    }

    setupMapForTablet() {
        // Настройки карты для планшетов
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.borderWidth = '2px';
        }
        
        // Увеличиваем иконки планет для планшетов
        const planets = document.querySelectorAll('.planet-icon');
        planets.forEach(planet => {
            const currentSize = parseFloat(getComputedStyle(planet).fontSize);
            planet.style.fontSize = `${currentSize * 1.2}px`;
        });
    }

    restoreFullFunctionality() {
        // Восстанавливаем полную функциональность для десктопов
        const hiddenElements = document.querySelectorAll('[style*="display: none"]');
        hiddenElements.forEach(element => {
            if (!element.classList.contains('mobile-menu-btn')) {
                element.style.display = '';
            }
        });
        
        // Восстанавливаем таблицы
        const tables = document.querySelectorAll('.satellite-table');
        tables.forEach(table => {
            const cells = table.querySelectorAll('td, th');
            cells.forEach(cell => cell.style.display = '');
            table.style.minWidth = '';
        });
        
        // Восстанавливаем размеры элементов управления
        const touchElements = document.querySelectorAll('.btn, .satellite-map, .panel h3');
        touchElements.forEach(element => {
            element.style.padding = '';
            element.style.minHeight = '';
            element.style.minWidth = '';
        });
    }

    getCurrentZoom() {
        const zoomSlider = document.getElementById('zoom-slider');
        return zoomSlider ? parseFloat(zoomSlider.value) || 2 : 2;
    }

    updateCoordinates(x, y) {
        const coordsDisplay = document.getElementById('coordinates-display');
        if (coordsDisplay) {
            const scaledX = Math.round(x / 10);
            const scaledY = Math.round(y / 10);
            coordsDisplay.textContent = `X: ${scaledX}, Y: ${scaledY}`;
        }
    }

    showTapCoordinates(x, y) {
        // Создаем временное уведомление с координатами
        const toast = document.createElement('div');
        toast.className = 'coordinate-toast';
        toast.textContent = `Координаты: ${Math.round(x)}, ${Math.round(y)}`;
        toast.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            background: rgba(0, 0, 0, 0.8);
            color: #0ff;
            padding: 8px 12px;
            border: 1px solid #0aa;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            transform: translate(-50%, -100%);
            pointer-events: none;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 1000);
    }

    detectDevice() {
        const ua = navigator.userAgent;
        
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            this.deviceType = 'tablet';
        } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            this.deviceType = 'mobile';
        } else {
            this.deviceType = 'desktop';
        }
        
        console.log(`Тип устройства: ${this.deviceType}`);
        return this.deviceType;
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalElement) {
        if (modalElement) {
            modalElement.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const responsiveManager = new ResponsiveManager();
    
    // Экспортируем для глобального доступа
    window.responsiveManager = responsiveManager;
    
    // Дополнительная оптимизация для медленных устройств
    if ('hardwareConcurrency' in navigator && navigator.hardwareConcurrency <= 4) {
        console.log('Обнаружено медленное устройство, применяем оптимизации...');
        document.body.classList.add('low-performance');
        
        // Уменьшаем количество анимаций
        const animations = document.querySelectorAll('[class*="animation"], [style*="animation"]');
        animations.forEach(el => {
            el.style.animationDuration = '0s';
        });
    }
    
    // Предотвращение контекстного меню на мобильных
    document.addEventListener('contextmenu', (e) => {
        if (window.innerWidth <= 767) {
            e.preventDefault();
        }
    }, false);
});
