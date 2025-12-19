// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // ================== ИНИЦИАЛИЗАЦИЯ ПЕРЕМЕННЫХ ==================
    let satellites = [];
    let currentSector = 'alpha';
    let zoomLevel = 2;
    let warpSpeed = 1;
    let mapOffsetX = 0;
    let mapOffsetY = 0;
    let trackedSatellite = null;
    let animationId = null;
    
    // ================== СОЗДАНИЕ ЗВЕЗДНОГО ПОЛЯ ==================
    function createStarfield() {
        const starfield = document.getElementById('starfield');
        const starCount = 200;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Случайный размер звезды
            const size = Math.random();
            if (size < 0.7) star.classList.add('small');
            else if (size < 0.9) star.classList.add('medium');
            else star.classList.add('large');
            
            // Случайное мерцание
            if (Math.random() > 0.7) star.classList.add('twinkling');
            
            // Случайная позиция
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            
            // Случайная скорость мерцания
            if (star.classList.contains('twinkling')) {
                star.style.animationDuration = `${Math.random() * 2 + 1}s`;
            }
            
            starfield.appendChild(star);
        }
    }
    
    // ================== ГЕНЕРАЦИЯ ДАННЫХ СПУТНИКОВ ==================
    function generateSatellites() {
        const satelliteNames = [
            'SPUTNIK-7', 'GLOB-32', 'ORB-11', 'COSMOS-5', 'NAV-21', 'GPS-45',
            'GALILEO-12', 'GLONASS-8', 'METEOR-3', 'ISS-MOD', 'HST-1', 'VOYAGER-2',
            'CASSINI', 'MARS-R', 'JUNO-P', 'NEW-HORIZONS', 'VIKING-1', 'PIONEER-10',
            'CHANDRA', 'SPITZER', 'KEPLER', 'HUBBLE-2', 'JWST-1', 'PLANCK',
            'GAIA', 'TESS', 'CHEOPS', 'EXPRESS', 'CLUSTER', 'DOUBLE-STAR',
            'SWARM', 'CRYOSAT', 'GOCE', 'SMART', 'PROBA', 'METOP',
            'MSG', 'METEOSAT', 'GOES', 'INSAT', 'COMS', 'COCONUTS',
            'KOMPSAT', 'ALOS', 'RADARSAT', 'TERRASAR', 'TANDEM'
        ];
        
        const satelliteTypes = [
            'Навигационный', 'Коммуникационный', 'Научный', 'Метеорологический',
            'Военный', 'Исследовательский', 'Астрономический', 'Геодезический'
        ];
        
        const operators = [
            'NASA', 'Роскосмос', 'ESA', 'КНР', 'JAXA', 'ISRO',
            'Космические войска РФ', 'Космическое командование США'
        ];
        
        const sensors = [
            'Камера высокого разрешения', 'Спектрометр', 'Радар', 'Лазерный альтиметр',
            'Магнитометр', 'Детектор частиц', 'Тепловизор', 'Радиометр'
        ];
        
        satellites = [];
        
        for (let i = 0; i < 47; i++) {
            const id = (i + 1).toString().padStart(3, '0');
            const name = satelliteNames[i % satelliteNames.length];
            const type = satelliteTypes[Math.floor(Math.random() * satelliteTypes.length)];
            const operator = operators[Math.floor(Math.random() * operators.length)];
            
            // Определяем сектор
            const sectors = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
            const sector = sectors[Math.floor(Math.random() * sectors.length)];
            
            // Определяем статус
            let status, statusClass;
            const statusRand = Math.random();
            if (statusRand < 0.7) {
                status = 'НОРМА';
                statusClass = 'normal';
            } else if (statusRand < 0.9) {
                status = 'ПРЕДУПРЕЖДЕНИЕ';
                statusClass = 'warning';
            } else {
                status = 'КРИТИЧЕСКИЙ';
                statusClass = 'critical';
            }
            
            // Генерация технических параметров
            const altitude = Math.floor(Math.random() * 40000) + 200;
            const speed = (Math.random() * 4 + 3).toFixed(1);
            const inclination = Math.floor(Math.random() * 180);
            const period = (Math.random() * 120 + 60).toFixed(1);
            
            // Дата запуска
            const launchYear = Math.floor(Math.random() * 30) + 1970;
            const launchMonth = Math.floor(Math.random() * 12) + 1;
            const launchDay = Math.floor(Math.random() * 28) + 1;
            const launchDate = `${launchDay.toString().padStart(2, '0')}.${launchMonth.toString().padStart(2, '0')}.${launchYear}`;
            
            // Случайные датчики
            const satelliteSensors = [];
            const sensorCount = Math.floor(Math.random() * 4) + 1;
            for (let j = 0; j < sensorCount; j++) {
                satelliteSensors.push(sensors[Math.floor(Math.random() * sensors.length)]);
            }
            
            // Позиция на карте
            let posX, posY;
            switch(sector) {
                case 'alpha': // Земная орбита
                    posX = 40 + Math.random() * 20;
                    posY = 40 + Math.random() * 20;
                    break;
                case 'beta': // Луна
                    posX = 60 + Math.random() * 10;
                    posY = 30 + Math.random() * 10;
                    break;
                case 'gamma': // Марс
                    posX = 20 + Math.random() * 10;
                    posY = 20 + Math.random() * 10;
                    break;
                case 'delta': // Юпитер
                    posX = 70 + Math.random() * 10;
                    posY = 70 + Math.random() * 10;
                    break;
                case 'epsilon': // Пояс астероидов
                    posX = 80 + Math.random() * 15;
                    posY = 10 + Math.random() * 15;
                    break;
            }
            
            satellites.push({
                id,
                name,
                type,
                operator,
                sector,
                status,
                statusClass,
                altitude,
                speed,
                inclination,
                period,
                launchDate,
                sensors: satelliteSensors,
                posX,
                posY,
                lifetime: Math.floor(Math.random() * 20) + 5
            });
        }
    }
    
    // ================== ОТОБРАЖЕНИЕ СПУТНИКОВ НА КАРТЕ ==================
    function displaySatellitesOnMap() {
        const galaxyMap = document.getElementById('galaxy-map');
        
        // Очищаем предыдущие спутники
        const oldSatellites = document.querySelectorAll('.satellite-map');
        oldSatellites.forEach(sat => sat.remove());
        
        // Отображаем спутники текущего сектора
        satellites
            .filter(sat => sat.sector === currentSector)
            .forEach(satellite => {
                const satElement = document.createElement('div');
                satElement.className = `satellite-map ${satellite.statusClass}`;
                satElement.dataset.id = satellite.id;
                satElement.style.left = `${satellite.posX}%`;
                satElement.style.top = `${satellite.posY}%`;
                
                satElement.innerHTML = `
                    <div class="satellite-icon ${satellite.statusClass}">
                        <i class="fas fa-satellite"></i>
                    </div>
                    <div class="satellite-tooltip">${satellite.name}</div>
                `;
                
                // Клик по спутнику
                satElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showSatelliteInfo(satellite);
                });
                
                galaxyMap.appendChild(satElement);
            });
        
        // Обновляем счетчик в табах
        updateTabCounts();
    }
    
    // ================== ОТОБРАЖЕНИЕ СПУТНИКОВ В СЕТКЕ ==================
    function displaySatellitesInGrid(filter = 'all') {
        const grid = document.getElementById('satellite-grid');
        grid.innerHTML = '';
        
        let filteredSatellites = satellites;
        
        // Применяем фильтр
        switch(filter) {
            case 'active':
                filteredSatellites = satellites.filter(s => s.status === 'НОРМА');
                break;
            case 'warning':
                filteredSatellites = satellites.filter(s => s.status === 'ПРЕДУПРЕЖДЕНИЕ' || s.status === 'КРИТИЧЕСКИЙ');
                break;
            case 'distant':
                filteredSatellites = satellites.filter(s => s.altitude > 10000);
                break;
        }
        
        // Отображаем спутники
        filteredSatellites.forEach(satellite => {
            const card = document.createElement('div');
            card.className = 'satellite-card';
            card.dataset.id = satellite.id;
            
            card.innerHTML = `
                <div class="satellite-card-header">
                    <span class="satellite-id">${satellite.id}</span>
                    <span class="satellite-status status-${satellite.statusClass}">${satellite.status}</span>
                </div>
                <div class="satellite-name">${satellite.name}</div>
                <div class="satellite-meta">
                    <div>Тип: ${satellite.type}</div>
                    <div>Высота: ${satellite.altitude} км</div>
                    <div>Сектор: ${satellite.sector.toUpperCase()}</div>
                </div>
            `;
            
            card.addEventListener('click', () => {
                showSatelliteInfo(satellite);
            });
            
            grid.appendChild(card);
        });
    }
    
    // ================== ОБНОВЛЕНИЕ СЧЕТЧИКОВ В ТАБАХ ==================
    function updateTabCounts() {
        const allCount = satellites.length;
        const activeCount = satellites.filter(s => s.status === 'НОРМА').length;
        const warningCount = satellites.filter(s => s.status === 'ПРЕДУПРЕЖДЕНИЕ' || s.status === 'КРИТИЧЕСКИЙ').length;
        const distantCount = satellites.filter(s => s.altitude > 10000).length;
        
        document.querySelector('[data-tab="all"]').textContent = `ВСЕ (${allCount})`;
        document.querySelector('[data-tab="active"]').textContent = `АКТИВНЫЕ (${activeCount})`;
        document.querySelector('[data-tab="warning"]').textContent = `ПРЕДУПРЕЖДЕНИЯ (${warningCount})`;
        document.querySelector('[data-tab="distant"]').textContent = `ДАЛЬНИЕ (${distantCount})`;
    }
    
    // ================== ОТОБРАЖЕНИЕ ИНФОРМАЦИИ О СПУТНИКЕ ==================
    function showSatelliteInfo(satellite) {
        document.getElementById('popup-title').textContent = `ИНФОРМАЦИЯ: ${satellite.name}`;
        document.getElementById('satellite-id').textContent = satellite.id;
        document.getElementById('satellite-name').textContent = satellite.name;
        document.getElementById('satellite-type').textContent = satellite.type;
        document.getElementById('satellite-status').textContent = satellite.status;
        document.getElementById('satellite-altitude').textContent = `${satellite.altitude} км`;
        document.getElementById('satellite-speed').textContent = `${satellite.speed} км/с`;
        document.getElementById('satellite-inclination').textContent = `${satellite.inclination}°`;
        document.getElementById('satellite-period').textContent = `${satellite.period} мин`;
        document.getElementById('satellite-launch').textContent = satellite.launchDate;
        document.getElementById('satellite-operator').textContent = satellite.operator;
        document.getElementById('satellite-lifetime').textContent = `${satellite.lifetime} лет`;
        
        // Отображаем датчики
        const sensorsContainer = document.getElementById('satellite-sensors');
        sensorsContainer.innerHTML = '<h4><i class="fas fa-satellite-dish"></i> ДАТЧИКИ И ПРИБОРЫ</h4>';
        
        satellite.sensors.forEach(sensor => {
            const p = document.createElement('p');
            p.innerHTML = `<i class="fas fa-microchip"></i> ${sensor}`;
            sensorsContainer.appendChild(p);
        });
        
        // Показываем попап
        document.getElementById('satellite-info').style.display = 'flex';
        
        // Отслеживание спутника
        document.getElementById('btn-track-satellite').onclick = () => {
            trackedSatellite = satellite.id;
            highlightTrackedSatellite();
            alert(`Спутник ${satellite.name} теперь отслеживается!`);
        };
    }
    
    // ================== ПОДСВЕТКА ОТСЛЕЖИВАЕМОГО СПУТНИКА ==================
    function highlightTrackedSatellite() {
        // Снимаем подсветку со всех спутников
        document.querySelectorAll('.satellite-map, .satellite-card').forEach(el => {
            el.classList.remove('active');
        });
        
        // Подсвечиваем отслеживаемый спутник
        if (trackedSatellite) {
            document.querySelectorAll(`[data-id="${trackedSatellite}"]`).forEach(el => {
                el.classList.add('active');
            });
        }
    }
    
    // ================== СИСТЕМА РАДАРА ==================
    function initRadar() {
        const radarScreen = document.querySelector('.radar-screen');
        
        // Создаем точки на радаре
        function createRadarContacts() {
            // Очищаем старые точки
            document.querySelectorAll('.radar-contact').forEach(el => el.remove());
            
            // Создаем новые точки
            const contactCount = 8 + Math.floor(Math.random() * 12);
            document.getElementById('radar-detected').textContent = contactCount;
            
            for (let i = 0; i < contactCount; i++) {
                const contact = document.createElement('div');
                contact.className = 'radar-contact';
                
                // Случайная позиция в полярных координатах
                const angle = Math.random() * 360;
                const distance = Math.random() * 40 + 10; // 10-50% от радиуса
                
                // Конвертируем в декартовы координаты
                const x = 50 + distance * Math.cos(angle * Math.PI / 180);
                const y = 50 + distance * Math.sin(angle * Math.PI / 180);
                
                contact.style.left = `${x}%`;
                contact.style.top = `${y}%`;
                
                // Случайный размер
                const size = Math.random() * 6 + 4;
                contact.style.width = `${size}px`;
                contact.style.height = `${size}px`;
                
                // Случайная яркость
                const brightness = Math.random() * 0.5 + 0.5;
                contact.style.opacity = brightness;
                
                radarScreen.appendChild(contact);
            }
        }
        
        // Обновляем контакты каждые 3 секунды
        createRadarContacts();
        setInterval(createRadarContacts, 3000);
    }
    
    // ================== ТЕЛЕМЕТРИЯ В РЕАЛЬНОМ ВРЕМЕНИ ==================
    function initTelemetry() {
        const canvas = document.getElementById('signal-canvas');
        const ctx = canvas.getContext('2d');
        
        // Устанавливаем размер canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        let time = 0;
        
        function drawSignalWave() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Рисуем сетку
            ctx.strokeStyle = '#0a0';
            ctx.lineWidth = 1;
            
            // Горизонтальные линии
            for (let i = 0; i < canvas.height; i += 20) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
            
            // Вертикальные линии
            for (let i = 0; i < canvas.width; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            
            // Рисуем сигнал
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let x = 0; x < canvas.width; x++) {
                // Создаем сложный сигнал с несколькими частотами
                const y = canvas.height / 2 + 
                    Math.sin(x * 0.05 + time) * 20 +
                    Math.sin(x * 0.1 + time * 1.5) * 15 +
                    Math.sin(x * 0.02 + time * 0.5) * 10;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            // Добавляем шум
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            
            for (let x = 0; x < canvas.width; x += 2) {
                const noiseY = canvas.height / 2 + (Math.random() - 0.5) * 30;
                if (x === 0) {
                    ctx.moveTo(x, noiseY);
                } else {
                    ctx.lineTo(x, noiseY);
                }
            }
            
            ctx.stroke();
            
            time += 0.1;
            
            // Анимируем
            requestAnimationFrame(drawSignalWave);
        }
        
        // Обновление телеметрических полос
        function updateTelemetryBars() {
            // Температура (-100°C до +100°C)
            const temp = Math.random() * 200 - 100;
            document.getElementById('temp-value').textContent = `${Math.round(temp)}°C`;
            document.getElementById('temp-bar').style.width = `${((temp + 100) / 200) * 100}%`;
            
            // Мощность (0-100%)
            const power = Math.random() * 30 + 70;
            document.getElementById('power-value').textContent = `${Math.round(power)}%`;
            document.getElementById('power-bar').style.width = `${power}%`;
            
            // Данные (0-2 Гб/с)
            const data = Math.random() * 2;
            document.getElementById('data-value').textContent = `${data.toFixed(1)} Гб/с`;
            document.getElementById('data-bar').style.width = `${(data / 2) * 100}%`;
            
            // Стабильность (80-100%)
            const stability = Math.random() * 20 + 80;
            document.getElementById('stability-value').textContent = `${Math.round(stability)}%`;
            document.getElementById('stability-bar').style.width = `${stability}%`;
        }
        
        // Запускаем анимации
        drawSignalWave();
        setInterval(updateTelemetryBars, 2000);
        updateTelemetryBars(); // Первый вызов
    }
    
    // ================== УПРАВЛЕНИЕ КАРТОЙ ==================
    function initMapControls() {
        const galaxyMap = document.getElementById('galaxy-map');
        const zoomSlider = document.getElementById('zoom-slider');
        const zoomValue = document.getElementById('zoom-value');
        
        // Управление зумом
        zoomSlider.addEventListener('input', function() {
            zoomLevel = parseInt(this.value);
            zoomValue.textContent = `${zoomLevel}x`;
            updateMapTransform();
        });
        
        // Управление перемещением
        document.getElementById('btn-pan-left').addEventListener('click', () => {
            mapOffsetX += 50;
            updateMapTransform();
        });
        
        document.getElementById('btn-pan-right').addEventListener('click', () => {
            mapOffsetX -= 50;
            updateMapTransform();
        });
        
        document.getElementById('btn-pan-up').addEventListener('click', () => {
            mapOffsetY += 50;
            updateMapTransform();
        });
        
        document.getElementById('btn-pan-down').addEventListener('click', () => {
            mapOffsetY -= 50;
            updateMapTransform();
        });
        
        document.getElementById('btn-center').addEventListener('click', () => {
            mapOffsetX = 0;
            mapOffsetY = 0;
            updateMapTransform();
        });
        
        // Переключение секторов
        document.getElementById('sector-select').addEventListener('change', function() {
            currentSector = this.value;
            displaySatellitesOnMap();
            
            // Обновляем координаты
            updateCoordinates();
        });
        
        // Управление скоростью варпа
        document.querySelectorAll('.warp-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.warp-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                warpSpeed = parseInt(this.dataset.speed);
            });
        });
        
        function updateMapTransform() {
            const scale = zoomLevel;
            galaxyMap.style.transform = `translate(${mapOffsetX}px, ${mapOffsetY}px) scale(${scale})`;
        }
        
        // Обновление координат
        function updateCoordinates() {
            const x = Math.round(mapOffsetX / 10);
            const y = Math.round(mapOffsetY / 10);
            document.getElementById('coordinates').textContent = `X: ${x}, Y: ${y}`;
        }
        
        // Обновление координат при перемещении
        setInterval(updateCoordinates, 100);
    }
    
    // ================== АНИМАЦИЯ СПУТНИКОВ ==================
    function animateSatellites() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        function animate() {
            // Анимируем спутники на карте
            document.querySelectorAll('.satellite-map').forEach(sat => {
                const currentX = parseFloat(sat.style.left) || 50;
                const currentY = parseFloat(sat.style.top) || 50;
                
                // Движение по орбите (упрощенное)
                const speed = warpSpeed * 0.02;
                const newX = (currentX + Math.sin(Date.now() / 1000) * speed) % 100;
                const newY = (currentY + Math.cos(Date.now() / 1000) * speed) % 100;
                
                sat.style.left = `${newX}%`;
                sat.style.top = `${newY}%`;
            });
            
            animationId = requestAnimationFrame(animate);
        }
        
        animate();
    }
    
    // ================== СИСТЕМНЫЕ МЕТРИКИ ==================
    function initSystemMetrics() {
        // Обновление метрик системы
        function updateMetrics() {
            // CPU нагрузка (30-70%)
            const cpuLoad = Math.floor(Math.random() * 40) + 30;
            document.getElementById('cpu-load').textContent = `${cpuLoad}%`;
            
            // Использование RAM (1.0-1.8 ГБ из 4)
            const ramUsed = (Math.random() * 0.8 + 1.0).toFixed(1);
            document.getElementById('ram-usage').textContent = `${ramUsed}/4 ГБ`;
            
            // Использование хранилища (70-95%)
            const storage = Math.floor(Math.random() * 25) + 70;
            document.getElementById('storage').textContent = `${storage}%`;
            
            // Онлайн операторы (1-5)
            const operators = Math.floor(Math.random() * 5) + 1;
            document.getElementById('operators-online').textContent = operators;
            
            // Счетчик посещений (увеличивается)
            const counter = document.getElementById('visitor-counter');
            let count = parseInt(counter.textContent.replace(',', ''));
            count += Math.floor(Math.random() * 3);
            counter.textContent = count.toString().padStart(7, '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        
        setInterval(updateMetrics, 5000);
        updateMetrics(); // Первый вызов
    }
    
    // ================== ПОИСК СПУТНИКОВ ==================
    function initSearch() {
        const searchInput = document.getElementById('satellite-search');
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm.length === 0) {
                displaySatellitesInGrid('all');
                return;
            }
            
            const filteredSatellites = satellites.filter(sat => 
                sat.name.toLowerCase().includes(searchTerm) ||
                sat.id.includes(searchTerm) ||
                sat.type.toLowerCase().includes(searchTerm)
            );
            
            const grid = document.getElementById('satellite-grid');
            grid.innerHTML = '';
            
            filteredSatellites.forEach(satellite => {
                const card = document.createElement('div');
                card.className = 'satellite-card';
                card.dataset.id = satellite.id;
                
                card.innerHTML = `
                    <div class="satellite-card-header">
                        <span class="satellite-id">${satellite.id}</span>
                        <span class="satellite-status status-${satellite.statusClass}">${satellite.status}</span>
                    </div>
                    <div class="satellite-name">${satellite.name}</div>
                    <div class="satellite-meta">
                        <div>Тип: ${satellite.type}</div>
                        <div>Высота: ${satellite.altitude} км</div>
                        <div>Сектор: ${satellite.sector.toUpperCase()}</div>
                    </div>
                `;
                
                card.addEventListener('click', () => {
                    showSatelliteInfo(satellite);
                });
                
                grid.appendChild(card);
            });
        });
    }
    
    // ================== ТАБЫ ДАННЫХ ==================
    function initDataTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                // Убираем активный класс у всех табов
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                // Добавляем активный класс текущему табу
                this.classList.add('active');
                // Отображаем соответствующие спутники
                displaySatellitesInGrid(this.dataset.tab);
            });
        });
    }
    
    // ================== ИНИЦИАЛИЗАЦИЯ СЕТИ ==================
    function initNetworkStats() {
        function updateNetworkStats() {
            // Обновляем задержку (100-300 мс)
            const latency = Math.floor(Math.random() * 200) + 100;
            document.getElementById('network-latency').textContent = `${latency} мс`;
            
            // Обновляем пропускную способность (1.5-3.0 Гб/с)
            const bandwidth = (Math.random() * 1.5 + 1.5).toFixed(1);
            document.getElementById('bandwidth').textContent = `${bandwidth} Гб/с`;
            
            // Обновляем количество связанных узлов (20-30)
            const nodes = Math.floor(Math.random() * 10) + 20;
            document.getElementById('connected-nodes').textContent = nodes;
        }
        
        setInterval(updateNetworkStats, 3000);
        updateNetworkStats(); // Первый вызов
    }
    
    // ================== ОБРАБОТЧИК ЗАКРЫТИЯ ПОПАПА ==================
    function initPopupClose() {
        document.querySelector('.close-btn').addEventListener('click', function() {
            document.getElementById('satellite-info').style.display = 'none';
        });
        
        document.getElementById('satellite-info').addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    }
    
    // ================== ОБНОВЛЕНИЕ ВРЕМЕНИ ==================
    function initClock() {
        function updateClock() {
            const now = new Date();
            const utcHours = now.getUTCHours().toString().padStart(2, '0');
            const utcMinutes = now.getUTCMinutes().toString().padStart(2, '0');
            const utcSeconds = now.getUTCSeconds().toString().padStart(2, '0');
            
            // Ищем элемент для времени
            const timeElement = document.querySelector('.status-bar span:last-child');
            if (timeElement) {
                timeElement.innerHTML = `ВРЕМЯ: <span id="clock">${utcHours}:${utcMinutes}:${utcSeconds} UTC</span>`;
            }
        }
        
        setInterval(updateClock, 1000);
        updateClock(); // Первый вызов
    }
    
    // ================== ИНИЦИАЛИЗАЦИЯ ВСЕГО ==================
    function init() {
        createStarfield();
        generateSatellites();
        displaySatellitesOnMap();
        displaySatellitesInGrid('all');
        initRadar();
        initTelemetry();
        initMapControls();
        initSystemMetrics();
        initSearch();
        initDataTabs();
        initNetworkStats();
        initPopupClose();
        initClock();
        
        // Запускаем анимацию через 1 секунду
        setTimeout(() => {
            animateSatellites();
        }, 1000);
        
        // Обновляем диапазон радара
        setInterval(() => {
            const range = Math.floor(Math.random() * 50000) + 10000;
            document.getElementById('radar-range').textContent = `${range.toLocaleString()} км`;
            
            const freq = (Math.random() * 5 + 5).toFixed(1);
            document.getElementById('radar-freq').textContent = `${freq} ГГц`;
        }, 5000);
    }
    
    // Запускаем инициализацию
    init();
});
