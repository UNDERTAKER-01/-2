// Основной файл с адаптивными улучшениями

class SatelliteMonitor {
    constructor() {
        this.responsiveManager = null;
        this.satellites = [];
        this.currentZoom = 2;
        this.mapOffset = { x: 0, y: 0 };
        this.isMobile = false;
        this.isTablet = false;
        
        this.init();
    }

    init() {
        this.detectDeviceType();
        this.setupEventListeners();
        this.generateSatellites();
        this.renderGalaxyMap();
        this.setupRealTimeUpdates();
        this.initClock();
        this.setupInteractiveElements();
        
        // Инициализация адаптивного менеджера
        if (typeof ResponsiveManager !== 'undefined') {
            this.responsiveManager = new ResponsiveManager();
        }
    }

    detectDeviceType() {
        this.isMobile = window.innerWidth <= 767;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth <= 1023;
    }

    setupEventListeners() {
        // Адаптивные обработчики событий
        if (this.isMobile) {
            this.setupMobileEvents();
        } else {
            this.setupDesktopEvents();
        }

        // Общие обработчики
        window.addEventListener('resize', () => this.handleResize());
        
        // Обработчики для элементов управления
        this.setupControlHandlers();
    }

    setupMobileEvents() {
        console.log('Настройка событий для мобильных');
        
        // Свайпы для навигации
        let startX, startY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Определяем направление свайпа
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Горизонтальный свайп
                if (diffX > 50) {
                    this.swipeLeft();
                } else if (diffX < -50) {
                    this.swipeRight();
                }
            } else {
                // Вертикальный свайп
                if (diffY > 50) {
                    this.swipeUp();
                } else if (diffY < -50) {
                    this.swipeDown();
                }
            }
            
            startX = null;
            startY = null;
        }, { passive: true });

        // Двойной тап для зума
        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                // Двойной тап
                this.handleDoubleTap(e);
            }
            
            lastTap = currentTime;
        }, { passive: true });
    }

    setupDesktopEvents() {
        console.log('Настройка событий для десктопа');
        
        // Колесико мыши для зума
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.2 : 0.2;
                this.zoomMap(delta);
            }, { passive: false });
        }

        // Drag карты мышью
        let isDragging = false;
        let startX, startY;
        
        if (mapContainer) {
            mapContainer.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                mapContainer.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                this.panMap(deltaX, deltaY);
                
                startX = e.clientX;
                startY = e.clientY;
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
                if (mapContainer) {
                    mapContainer.style.cursor = 'grab';
                }
            });
        }
    }

    setupControlHandlers() {
        // Обработчики для кнопок управления
        const controls = {
            'zoom-in': () => this.zoomMap(0.2),
            'zoom-out': () => this.zoomMap(-0.2),
            'center': () => this.centerMap(),
            'pan-left': () => this.panMap(-50, 0),
            'pan-right': () => this.panMap(50, 0),
            'pan-up': () => this.panMap(0, -50),
            'pan-down': () => this.panMap(0, 50)
        };

        Object.entries(controls).forEach(([id, handler]) => {
            const element = document.getElementById(`btn-${id}`);
            if (element) {
                element.addEventListener('click', handler);
                
                // Для мобильных добавляем обработку touch
                if (this.isMobile) {
                    element.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        handler();
                    }, { passive: false });
                }
            }
        });

        // Слайдер зума
        const zoomSlider = document.getElementById('zoom-slider');
        if (zoomSlider) {
            zoomSlider.addEventListener('input', (e) => {
                this.currentZoom = parseFloat(e.target.value);
                this.updateMapTransform();
                this.updateZoomDisplay();
            });
        }

        // Кнопки варп-скорости
        document.querySelectorAll('.warp-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const speed = parseInt(e.target.dataset.speed);
                this.setWarpSpeed(speed);
                
                // Обновляем активную кнопку
                document.querySelectorAll('.warp-btn').forEach(b => 
                    b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    handleResize() {
        this.detectDeviceType();
        
        // Перерисовываем карту при изменении размера
        this.renderGalaxyMap();
        
        // Обновляем позиции спутников
        this.updateSatellitePositions();
        
        // Обновляем интерфейс в зависимости от устройства
        this.updateUIForDevice();
    }

    updateUIForDevice() {
        const elementsToHide = this.isMobile ? 
            document.querySelectorAll('.desktop-only') :
            document.querySelectorAll('.mobile-only');
        
        elementsToHide.forEach(el => {
            el.style.display = this.isMobile ? 'none' : 'block';
        });

        // Адаптируем размер текста
        const baseSize = this.isMobile ? 14 : 16;
        document.documentElement.style.fontSize = `${baseSize}px`;

        // Оптимизируем анимации для мобильных
        if (this.isMobile) {
            this.optimizeAnimations();
        }
    }

    optimizeAnimations() {
        // Уменьшаем количество анимаций для производительности
        const animations = document.querySelectorAll('.satellite-icon, .planet-icon');
        animations.forEach((el, index) => {
            if (index > 10) { // Ограничиваем количество анимированных элементов
                el.style.animation = 'none';
            }
        });
    }

    // ... остальные методы из предыдущего скрипта ...

    generateSatellites() {
        // Генерация данных о спутниках
        const satelliteTypes = ['Навигационный', 'Коммуникационный', 'Научный', 'Метеорологический'];
        const statuses = ['НОРМА', 'ПРЕДУПРЕЖДЕНИЕ', 'КРИТИЧЕСКИЙ'];
        
        this.satellites = Array.from({ length: 47 }, (_, i) => ({
            id: (i + 1).toString().padStart(3, '0'),
            name: `SAT-${String.fromCharCode(65 + (i % 26))}${i + 1}`,
            type: satelliteTypes[i % satelliteTypes.length],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            altitude: Math.floor(Math.random() * 40000) + 200,
            speed: (Math.random() * 4 + 3).toFixed(1),
            x: Math.random() * 1800 + 100,
            y: Math.random() * 1800 + 100
        }));
    }

    renderGalaxyMap() {
        const galaxyMap = document.getElementById('galaxy-map');
        if (!galaxyMap) return;

        // Очищаем карту
        galaxyMap.innerHTML = '';

        // Создаем сетку координат
        this.createCoordinateGrid(galaxyMap);

        // Добавляем планеты
        this.createPlanets(galaxyMap);

        // Добавляем спутники
        this.createSatellites(galaxyMap);

        // Обновляем трансформацию
        this.updateMapTransform();
    }

    createCoordinateGrid(container) {
        // Создаем сетку для ориентации
        const grid = document.createElement('div');
        grid.className = 'map-grid';
        grid.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px);
            background-size: 100px 100px;
            pointer-events: none;
        `;
        container.appendChild(grid);
    }

    createPlanets(container) {
        const planets = [
            { name: 'earth', icon: 'fa-globe-americas', x: 1000, y: 1000, size: 80, ring: true },
            { name: 'moon', icon: 'fa-moon', x: 1300, y: 700, size: 30 },
            { name: 'mars', icon: 'fa-globe-americas', x: 400, y: 400, size: 50 },
            { name: 'jupiter', icon: 'fa-globe-americas', x: 1600, y: 1600, size: 120, ring: true }
        ];

        planets.forEach(planet => {
            const planetEl = document.createElement('div');
            planetEl.className = `planet ${planet.name}`;
            planetEl.style.cssText = `
                position: absolute;
                left: ${planet.x}px;
                top: ${planet.y}px;
                width: ${planet.size}px;
                height: ${planet.size}px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 10;
            `;

            const icon = document.createElement('i');
            icon.className = `fas ${planet.icon} planet-icon`;
            icon.style.cssText = `
                font-size: ${planet.size * 0.5}px;
                color: #00ffff;
                text-shadow: 0 0 20px #00ffff;
                animation: float 5s infinite ease-in-out;
            `;

            planetEl.appendChild(icon);

            if (planet.ring) {
                const ring = document.createElement('div');
                ring.className = 'planet-ring';
                ring.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    border: 2px dashed #00aa00;
                    border-radius: 50%;
                    width: ${planet.size * 1.5}px;
                    height: ${planet.size * 1.5}px;
                    animation: spin 30s linear infinite;
                `;
                
                if (planet.name === 'jupiter') {
                    ring.style.borderColor = '#ffff00';
                    ring.style.width = `${planet.size * 2}px`;
                    ring.style.height = `${planet.size * 2}px`;
                }
                
                planetEl.appendChild(ring);
            }

            container.appendChild(planetEl);
        });
    }

    createSatellites(container) {
        const satellitesContainer = document.createElement('div');
        satellitesContainer.className = 'satellites-container';
        satellitesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;

        this.satellites.forEach(satellite => {
            const satEl = document.createElement('div');
            satEl.className = 'satellite-map';
            satEl.dataset.id = satellite.id;
            satEl.style.cssText = `
                position: absolute;
                left: ${satellite.x}px;
                top: ${satellite.y}px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 5;
            `;

            const icon = document.createElement('i');
            icon.className = `fas fa-satellite satellite-icon ${satellite.status.toLowerCase()}`;
            icon.style.cssText = `
                font-size: 1.2rem;
                color: ${this.getStatusColor(satellite.status)};
                text-shadow: 0 0 10px ${this.getStatusColor(satellite.status)};
                animation: float 3s infinite ease-in-out;
            `;

            // Тултип с информацией
            const tooltip = document.createElement('div');
            tooltip.className = 'satellite-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: #00ff00;
                padding: 5px 10px;
                border: 1px solid #00aa00;
                border-radius: 3px;
                font-size: 0.8rem;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
                z-index: 100;
            `;
            tooltip.textContent = `${satellite.name} - ${satellite.type}`;

            satEl.appendChild(icon);
            satEl.appendChild(tooltip);
            satellitesContainer.appendChild(satEl);

            // Обработчики событий
            satEl.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
            });

            satEl.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });

            satEl.addEventListener('click', () => {
                this.showSatelliteInfo(satellite);
            });
        });

        container.appendChild(satellitesContainer);
    }

    getStatusColor(status) {
        switch(status) {
            case 'НОРМА': return '#00ff00';
            case 'ПРЕДУПРЕЖДЕНИЕ': return '#ffff00';
            case 'КРИТИЧЕСКИЙ': return '#ff0000';
            default: return '#00ffff';
        }
    }

    updateMapTransform() {
        const galaxyMap = document.getElementById('galaxy-map');
        if (galaxyMap) {
            galaxyMap.style.transform = `
                translate(${this.mapOffset.x}px, ${this.mapOffset.y}px)
                scale(${this.currentZoom})
            `;
        }
    }

    updateZoomDisplay() {
        const zoomValue = document.getElementById('zoom-value');
        if (zoomValue) {
            zoomValue.textContent = `${this.currentZoom.toFixed(1)}x`;
        }
    }

    zoomMap(delta) {
        this.currentZoom = Math.max(1, Math.min(5, this.currentZoom + delta));
        
        const zoomSlider = document.getElementById('zoom-slider');
        if (zoomSlider) {
            zoomSlider.value = this.currentZoom;
        }
        
        this.updateMapTransform();
        this.updateZoomDisplay();
    }

    panMap(deltaX, deltaY) {
        this.mapOffset.x += deltaX;
        this.mapOffset.y += deltaY;
        
        // Ограничиваем перемещение
        const maxOffset = 500;
        this.mapOffset.x = Math.max(-maxOffset, Math.min(maxOffset, this.mapOffset.x));
        this.mapOffset.y = Math.max(-maxOffset, Math.min(maxOffset, this.mapOffset.y));
        
        this.updateMapTransform();
        this.updateCoordinates();
    }

    centerMap() {
        this.mapOffset.x = 0;
        this.mapOffset.y = 0;
        this.currentZoom = 2;
        
        const zoomSlider = document.getElementById('zoom-slider');
        if (zoomSlider) {
            zoomSlider.value = this.currentZoom;
        }
        
        this.updateMapTransform();
        this.updateZoomDisplay();
        this.updateCoordinates();
    }

    updateCoordinates() {
        const coordsElement = document.getElementById('coordinates-display');
        if (coordsElement) {
            const scaledX = Math.round(this.mapOffset.x / 10);
            const scaledY = Math.round(this.mapOffset.y / 10);
            coordsElement.textContent = `X: ${scaledX}, Y: ${scaledY}`;
        }
    }

    setWarpSpeed(speed) {
        console.log(`Установлена варп-скорость: ${speed}`);
        // Здесь можно добавить логику изменения скорости анимации
    }

    showSatelliteInfo(satellite) {
        // Создаем модальное окно с информацией
        const modal = document.getElementById('satellite-modal');
        const modalBody = document.getElementById('modal-body');
        
        if (modal && modalBody) {
            modalBody.innerHTML = `
                <div class="satellite-info">
                    <div class="info-row">
                        <span class="label">ID:</span>
                        <span class="value">${satellite.id}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Название:</span>
                        <span class="value">${satellite.name}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Тип:</span>
                        <span class="value">${satellite.type}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Статус:</span>
                        <span class="value status-${satellite.status.toLowerCase()}">${satellite.status}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Высота:</span>
                        <span class="value">${satellite.altitude} км</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Скорость:</span>
                        <span class="value">${satellite.speed} км/с</span>
                    </div>
                </div>
            `;
            
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Методы для свайпов на мобильных
    swipeLeft() {
        console.log('Свайп влево');
        this.panMap(100, 0);
    }

    swipeRight() {
        console.log('Свайп вправо');
        this.panMap(-100, 0);
    }

    swipeUp() {
        console.log('Свайп вверх');
        this.panMap(0, 100);
    }

    swipeDown() {
        console.log('Свайп вниз');
        this.panMap(0, -100);
    }

    handleDoubleTap(e) {
        const touch = e.changedTouches[0];
        const mapContainer = document.querySelector('.map-container');
        
        if (mapContainer && mapContainer.contains(e.target)) {
            // Двойной тап по карте - зум
            this.zoomMap(0.5);
        }
    }

    setupRealTimeUpdates() {
        // Обновление времени
        setInterval(() => this.updateClock(), 1000);
        
        // Обновление телеметрии
        setInterval(() => this.updateTelemetry(), 3000);
        
        // Анимация спутников
        setInterval(() => this.animateSatellites(), 100);
        
        // Обновление системных метрик
        setInterval(() => this.updateSystemMetrics(), 5000);
    }

    initClock() {
        this.updateClock();
    }

    updateClock() {
        const now = new Date();
        const utcHours = now.getUTCHours().toString().padStart(2, '0');
        const utcMinutes = now.getUTCMinutes().toString().padStart(2, '0');
        const utcSeconds = now.getUTCSeconds().toString().padStart(2, '0');
        
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            clockElement.textContent = `${utcHours}:${utcMinutes}:${utcSeconds} UTC`;
        }
    }

    updateTelemetry() {
        // Обновление значений телеметрии
        const elements = {
            'active-sats': () => Math.floor(Math.random() * 10) + 28,
            'warning-sats': () => Math.floor(Math.random() * 5) + 5,
            'avg-signal': () => Math.floor(Math.random() * 10) + 85,
            'network-latency': () => Math.floor(Math.random() * 100) + 100,
            'cpu-load': () => Math.floor(Math.random() * 30) + 30,
            'ram-usage': () => (Math.random() * 0.8 + 1.0).toFixed(1),
            'operators-online': () => Math.floor(Math.random() * 3) + 2
        };

        Object.entries(elements).forEach(([id, generator]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = generator();
                
                // Добавляем единицы измерения
                if (id === 'avg-signal') element.textContent += '%';
                if (id === 'network-latency') element.textContent += ' мс';
                if (id === 'cpu-load') element.textContent += '%';
                if (id === 'ram-usage') element.textContent += ' ГБ';
            }
        });

        // Обновление счетчика посещений
        const visitorCounter = document.getElementById('visitor-counter');
        if (visitorCounter) {
            let count = parseInt(visitorCounter.textContent.replace(/,/g, ''));
            count += Math.floor(Math.random() * 3);
            visitorCounter.textContent = count.toString().padStart(7, '0')
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    }

    animateSatellites() {
        // Анимация движения спутников
        document.querySelectorAll('.satellite-map').forEach(satellite => {
            const currentLeft = parseFloat(satellite.style.left) || 1000;
            const currentTop = parseFloat(satellite.style.top) || 1000;
            
            // Небольшое случайное движение
            const deltaX = (Math.random() - 0.5) * 2;
            const deltaY = (Math.random() - 0.5) * 2;
            
            const newLeft = Math.max(100, Math.min(1900, currentLeft + deltaX));
            const newTop = Math.max(100, Math.min(1900, currentTop + deltaY));
            
            satellite.style.left = `${newLeft}px`;
            satellite.style.top = `${newTop}px`;
        });
    }

    updateSatellitePositions() {
        // Корректировка позиций спутников при изменении размера окна
        const mapContainer = document.querySelector('.map-container');
        if (!mapContainer) return;
        
        const containerWidth = mapContainer.offsetWidth;
        const containerHeight = mapContainer.offsetHeight;
        
        document.querySelectorAll('.satellite-map').forEach(satellite => {
            const currentLeft = parseFloat(satellite.style.left) || 1000;
            const currentTop = parseFloat(satellite.style.top) || 1000;
            
            // Масштабируем позиции относительно размера контейнера
            const scaleX = containerWidth / 2000;
            const scaleY = containerHeight / 2000;
            
            satellite.style.left = `${currentLeft * scaleX}px`;
            satellite.style.top = `${currentTop * scaleY}px`;
        });
    }

    updateSystemMetrics() {
        // Обновление системных метрик
        const metrics = document.querySelectorAll('.metric-value');
        metrics.forEach(metric => {
            const currentValue = parseFloat(metric.textContent);
            if (!isNaN(currentValue)) {
                const change = (Math.random() - 0.5) * 10;
                const newValue = Math.max(0, Math.min(100, currentValue + change));
                metric.textContent = `${newValue.toFixed(1)}%`;
            }
        });
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const monitor = new SatelliteMonitor();
    window.satelliteMonitor = monitor;
    
    // Инициализация адаптивного менеджера
    if (typeof ResponsiveManager !== 'undefined') {
        const responsiveManager = new ResponsiveManager();
        window.responsiveManager = responsiveManager;
    }
    
    // Предзагрузка критичных ресурсов
    this.preloadCriticalResources();
});

// Функция предзагрузки ресурсов
function preloadCriticalResources() {
    const criticalResources = [
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
        'https://fonts.googleapis.com/css?family=Press+Start+2P|Orbitron:400,700&display=swap'
    ];
    
    criticalResources.forEach(resource => {
        if (resource.endsWith('.css')) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = resource;
            document.head.appendChild(link);
        }
    });
}
