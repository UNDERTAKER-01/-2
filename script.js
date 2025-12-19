class SatelliteTrackingSystem {
    constructor() {
        this.satellites = [];
        this.trackedSatellites = new Set();
        this.selectedSatellite = null;
        this.radarTargets = [];
        this.destructionActive = false;
        this.destructionTimer = null;
        this.timeLeft = 300; // 5 минут в секундах
        
        this.init();
    }

    init() {
        this.generateSatellites();
        this.setupEventListeners();
        this.renderGalaxyMap();
        this.setupRadar();
        this.startTrackingUpdates();
        this.updateSystemStatus();
        this.startDestructionTimer();
        
        // Инициализация часов
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    generateSatellites() {
        const names = [
            'COSMOS', 'SPUTNIK', 'GALILEO', 'GPS', 'GLONASS', 'METEOR',
            'NAVSTAR', 'INTELSAT', 'HUBBLE', 'ISS', 'VOYAGER', 'CASSINI',
            'MARS', 'JUNO', 'NEW_HORIZONS', 'KEPLER', 'PLANCK', 'GAIA'
        ];
        
        const types = ['Навигационный', 'Коммуникационный', 'Научный', 'Военный', 'Метеорологический'];
        const statuses = ['НОРМАЛЬНЫЙ', 'ПРЕДУПРЕЖДЕНИЕ', 'КРИТИЧЕСКИЙ'];
        
        this.satellites = Array.from({ length: 47 }, (_, i) => {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const isImportant = Math.random() > 0.7;
            
            return {
                id: `SAT-${(i + 1).toString().padStart(3, '0')}`,
                name: `${names[i % names.length]}-${Math.floor(Math.random() * 100)}`,
                type: types[i % types.length],
                status: status,
                altitude: Math.floor(Math.random() * 40000) + 200,
                speed: (Math.random() * 4 + 3).toFixed(1),
                signal: Math.floor(Math.random() * 30) + 70,
                x: Math.random() * 1800 + 100,
                y: Math.random() * 1800 + 100,
                isImportant: isImportant,
                isDestroyed: false,
                lastContact: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                orbitPeriod: Math.floor(Math.random() * 120) + 60,
                temperature: Math.floor(Math.random() * 200) - 100,
                power: Math.floor(Math.random() * 30) + 70
            };
        });
    }

    setupEventListeners() {
        // Отслеживание всех спутников
        document.getElementById('track-all').addEventListener('click', () => {
            this.trackAllSatellites();
        });

        // Отмена отслеживания всех
        document.getElementById('untrack-all').addEventListener('click', () => {
            this.untrackAllSatellites();
        });

        // Отслеживание важных спутников
        document.getElementById('track-important').addEventListener('click', () => {
            this.trackImportantSatellites();
        });

        // Очистка списка отслеживания
        document.getElementById('clear-tracked').addEventListener('click', () => {
            this.clearTrackedSatellites();
        });

        // Показать/скрыть линии слежения
        document.getElementById('show-tracking-lines').addEventListener('click', (e) => {
            e.target.classList.toggle('active');
            this.toggleTrackingLines();
        });

        // Показать/скрыть орбиты
        document.getElementById('show-orbits').addEventListener('click', (e) => {
            e.target.classList.toggle('active');
            this.toggleOrbits();
        });

        // Автоцентрирование
        document.getElementById('auto-center').addEventListener('click', () => {
            this.autoCenterTrackedSatellites();
        });

        // Управление радаром
        document.querySelectorAll('.radar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.radar-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setRadarMode(e.target.dataset.mode);
            });
        });

        // Кнопка самоуничтожения
        document.getElementById('destruction-btn').addEventListener('click', () => {
            this.showDestructionWarning();
        });

        // Подтверждение самоуничтожения
        document.getElementById('confirm-destruction-btn').addEventListener('click', () => {
            this.activateDestructionProtocol();
        });

        // Отмена самоуничтожения
        document.getElementById('cancel-destruction').addEventListener('click', () => {
            this.hideDestructionWarning();
        });

        // Подтверждение понимания последствий
        document.getElementById('confirm-destruction').addEventListener('change', (e) => {
            document.getElementById('confirm-destruction-btn').disabled = !e.target.checked;
        });

        // Аварийная остановка
        document.getElementById('emergency-stop').addEventListener('click', () => {
            this.emergencyStop();
        });

        // Быстрые действия
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.action-btn').dataset.action;
                this.performQuickAction(action);
            });
        });
    }

    renderGalaxyMap() {
        const galaxyMap = document.getElementById('galaxy-map');
        galaxyMap.innerHTML = '';

        // Создаем сетку координат
        this.createCoordinateGrid(galaxyMap);

        // Добавляем спутники
        this.satellites.forEach(satellite => {
            if (!satellite.isDestroyed) {
                this.createSatelliteElement(galaxyMap, satellite);
            }
        });

        // Добавляем центр отслеживания
        this.createTrackingCenter(galaxyMap);

        // Обновляем список отслеживания
        this.updateTrackingList();
    }

    createSatelliteElement(container, satellite) {
        const satEl = document.createElement('div');
        satEl.className = `satellite-map ${satellite.status.toLowerCase()} ${this.trackedSatellites.has(satellite.id) ? 'tracked' : ''}`;
        satEl.dataset.id = satellite.id;
        satEl.style.left = `${satellite.x}px`;
        satEl.style.top = `${satellite.y}px`;

        const icon = document.createElement('i');
        icon.className = 'fas fa-satellite satellite-icon';
        icon.style.color = this.getStatusColor(satellite.status);
        icon.style.textShadow = `0 0 10px ${this.getStatusColor(satellite.status)}`;

        // Индикатор важности
        if (satellite.isImportant) {
            const star = document.createElement('i');
            star.className = 'fas fa-star importance-marker';
            star.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                font-size: 10px;
                color: var(--yellow);
                text-shadow: 0 0 5px var(--yellow);
            `;
            satEl.appendChild(star);
        }

        satEl.appendChild(icon);

        // Тултип с информацией
        const tooltip = document.createElement('div');
        tooltip.className = 'satellite-tooltip';
        tooltip.innerHTML = `
            <strong>${satellite.name}</strong><br>
            Тип: ${satellite.type}<br>
            Статус: ${satellite.status}<br>
            Высота: ${satellite.altitude} км
        `;
        satEl.appendChild(tooltip);

        // Обработчики событий
        satEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectSatellite(satellite);
        });

        satEl.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
            if (this.trackedSatellites.has(satellite.id)) {
                this.highlightTrackingLine(satellite.id);
            }
        });

        satEl.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
            this.clearHighlightedLines();
        });

        // Контекстное меню для отслеживания
        satEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.toggleTrackSatellite(satellite.id);
        });

        container.appendChild(satEl);
    }

    createTrackingCenter(container) {
        const center = document.createElement('div');
        center.className = 'tracking-center';
        center.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            background: rgba(0, 255, 255, 0.1);
            border: 2px solid var(--cyan);
            border-radius: 50%;
            z-index: 5;
        `;
        container.appendChild(center);
    }

    createCoordinateGrid(container) {
        const grid = document.createElement('div');
        grid.className = 'coordinate-grid';
        grid.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                linear-gradient(rgba(0, 255, 0, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 0, 0.05) 1px, transparent 1px);
            background-size: 100px 100px;
            pointer-events: none;
        `;
        container.appendChild(grid);
    }

    selectSatellite(satellite) {
        this.selectedSatellite = satellite;
        this.updateSelectedSatelliteDisplay();
        this.highlightSatelliteOnMap(satellite.id);
        this.addToRadarTargets(satellite);
    }

    updateSelectedSatelliteDisplay() {
        const container = document.getElementById('selected-satellite');
        
        if (!this.selectedSatellite) {
            container.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-satellite"></i>
                    <p>Выберите спутник для просмотра информации</p>
                </div>
            `;
            return;
        }

        const sat = this.selectedSatellite;
        const isTracked = this.trackedSatellites.has(sat.id);
        
        container.innerHTML = `
            <div class="satellite-details">
                <div class="satellite-header">
                    <div class="sat-icon" style="border-color: ${this.getStatusColor(sat.status)};">
                        <i class="fas fa-satellite" style="color: ${this.getStatusColor(sat.status)};"></i>
                    </div>
                    <div class="sat-title">
                        <h3>${sat.name}</h3>
                        <div class="sat-id">${sat.id}</div>
                    </div>
                    <button class="track-toggle-btn ${isTracked ? 'tracked' : ''}" 
                            onclick="satelliteSystem.toggleTrackSatellite('${sat.id}')">
                        <i class="fas ${isTracked ? 'fa-eye-slash' : 'fa-eye'}"></i>
                        ${isTracked ? 'ПРЕКРАТИТЬ СЛЕЖЕНИЕ' : 'ОТСЛЕЖИВАТЬ'}
                    </button>
                </div>
                
                <div class="satellite-data">
                    <div class="data-item">
                        <div class="data-label">ТИП</div>
                        <div class="data-value">${sat.type}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">СТАТУС</div>
                        <div class="data-value" style="color: ${this.getStatusColor(sat.status)}">${sat.status}</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">ВЫСОТА</div>
                        <div class="data-value">${sat.altitude} км</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">СКОРОСТЬ</div>
                        <div class="data-value">${sat.speed} км/с</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">СИГНАЛ</div>
                        <div class="data-value">${sat.signal}%</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">ТЕМПЕРАТУРА</div>
                        <div class="data-value">${sat.temperature}°C</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">МОЩНОСТЬ</div>
                        <div class="data-value">${sat.power}%</div>
                    </div>
                    <div class="data-item">
                        <div class="data-label">ПЕРИОД ОРБИТЫ</div>
                        <div class="data-value">${sat.orbitPeriod} мин</div>
                    </div>
                </div>
                
                <div class="satellite-actions">
                    <button class="sat-action-btn" onclick="satelliteSystem.performDiagnostics('${sat.id}')">
                        <i class="fas fa-stethoscope"></i> ДИАГНОСТИКА
                    </button>
                    <button class="sat-action-btn" onclick="satelliteSystem.rebootSatellite('${sat.id}')">
                        <i class="fas fa-redo"></i> ПЕРЕЗАГРУЗИТЬ
                    </button>
                    <button class="sat-action-btn warning" onclick="satelliteSystem.emergencyProtocol('${sat.id}')">
                        <i class="fas fa-exclamation-triangle"></i> АВАРИЙНЫЙ ПРОТОКОЛ
                    </button>
                </div>
            </div>
        `;
    }

    toggleTrackSatellite(satelliteId) {
        if (this.trackedSatellites.has(satelliteId)) {
            this.trackedSatellites.delete(satelliteId);
        } else {
            this.trackedSatellites.add(satelliteId);
            
            // Автоматически выбираем спутник при начале отслеживания
            if (!this.selectedSatellite || this.selectedSatellite.id !== satelliteId) {
                const sat = this.satellites.find(s => s.id === satelliteId);
                if (sat) this.selectSatellite(sat);
            }
        }
        
        this.updateSatelliteOnMap(satelliteId);
        this.updateTrackingList();
        this.updateTrackingStats();
        this.drawTrackingLines();
    }

    trackAllSatellites() {
        this.satellites.forEach(sat => {
            if (!sat.isDestroyed) {
                this.trackedSatellites.add(sat.id);
            }
        });
        this.updateAllSatellitesOnMap();
        this.updateTrackingList();
        this.updateTrackingStats();
        this.drawTrackingLines();
    }

    untrackAllSatellites() {
        this.trackedSatellites.clear();
        this.updateAllSatellitesOnMap();
        this.updateTrackingList();
        this.updateTrackingStats();
        this.clearTrackingLines();
    }

    trackImportantSatellites() {
        this.satellites.forEach(sat => {
            if (sat.isImportant && !sat.isDestroyed) {
                this.trackedSatellites.add(sat.id);
            }
        });
        this.updateAllSatellitesOnMap();
        this.updateTrackingList();
        this.updateTrackingStats();
        this.drawTrackingLines();
    }

    clearTrackedSatellites() {
        this.trackedSatellites.clear();
        this.updateAllSatellitesOnMap();
        this.updateTrackingList();
        this.updateTrackingStats();
        this.clearTrackingLines();
    }

    updateSatelliteOnMap(satelliteId) {
        const element = document.querySelector(`.satellite-map[data-id="${satelliteId}"]`);
        if (element) {
            const isTracked = this.trackedSatellites.has(satelliteId);
            element.classList.toggle('tracked', isTracked);
        }
    }

    updateAllSatellitesOnMap() {
        document.querySelectorAll('.satellite-map').forEach(element => {
            const satelliteId = element.dataset.id;
            const isTracked = this.trackedSatellites.has(satelliteId);
            element.classList.toggle('tracked', isTracked);
        });
    }

    highlightSatelliteOnMap(satelliteId) {
        // Снимаем выделение со всех
        document.querySelectorAll('.satellite-map').forEach(el => {
            el.classList.remove('highlighted');
        });
        
        // Выделяем выбранный
        const element = document.querySelector(`.satellite-map[data-id="${satelliteId}"]`);
        if (element) {
            element.classList.add('highlighted');
        }
    }

    updateTrackingList() {
        const list = document.getElementById('tracking-list');
        const trackedCount = document.getElementById('tracked-count');
        const trackingCount = document.getElementById('tracking-count');
        
        trackedCount.textContent = this.trackedSatellites.size;
        trackingCount.textContent = this.trackedSatellites.size;
        
        list.innerHTML = '';
        
        this.trackedSatellites.forEach(satelliteId => {
            const satellite = this.satellites.find(s => s.id === satelliteId);
            if (satellite && !satellite.isDestroyed) {
                const item = document.createElement('div');
                item.className = `tracking-item ${this.selectedSatellite && this.selectedSatellite.id === satelliteId ? 'active' : ''}`;
                item.dataset.id = satelliteId;
                
                item.innerHTML = `
                    <div class="sat-info">
                        <div class="sat-icon" style="background: ${this.getStatusColor(satellite.status)}20; border-color: ${this.getStatusColor(satellite.status)};">
                            <i class="fas fa-satellite" style="color: ${this.getStatusColor(satellite.status)};"></i>
                        </div>
                        <div class="sat-details">
                            <div class="sat-name">${satellite.name}</div>
                            <div class="sat-status">${satellite.type} • ${satellite.altitude} км</div>
                        </div>
                    </div>
                    <div class="sat-actions">
                        <button class="action-btn" onclick="satelliteSystem.selectSatelliteById('${satelliteId}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn" onclick="satelliteSystem.toggleTrackSatellite('${satelliteId}')">
                            <i class="fas fa-ban"></i>
                        </button>
                    </div>
                `;
                
                item.addEventListener('click', () => {
                    this.selectSatellite(satellite);
                });
                
                list.appendChild(item);
            }
        });
    }

    selectSatelliteById(satelliteId) {
        const satellite = this.satellites.find(s => s.id === satelliteId);
        if (satellite) {
            this.selectSatellite(satellite);
        }
    }

    updateTrackingStats() {
        if (this.trackedSatellites.size === 0) {
            document.getElementById('avg-altitude').textContent = '0 км';
            document.getElementById('avg-speed').textContent = '0 км/с';
            document.getElementById('avg-signal-quality').textContent = '0%';
            return;
        }
        
        let totalAltitude = 0;
        let totalSpeed = 0;
        let totalSignal = 0;
        let count = 0;
        
        this.trackedSatellites.forEach(satelliteId => {
            const satellite = this.satellites.find(s => s.id === satelliteId);
            if (satellite && !satellite.isDestroyed) {
                totalAltitude += satellite.altitude;
                totalSpeed += parseFloat(satellite.speed);
                totalSignal += satellite.signal;
                count++;
            }
        });
        
        if (count > 0) {
            document.getElementById('avg-altitude').textContent = `${Math.round(totalAltitude / count)} км`;
            document.getElementById('avg-speed').textContent = `${(totalSpeed / count).toFixed(1)} км/с`;
            document.getElementById('avg-signal-quality').textContent = `${Math.round(totalSignal / count)}%`;
        }
    }

    drawTrackingLines() {
        const overlay = document.getElementById('tracking-overlay');
        overlay.innerHTML = '';
        
        if (this.trackedSatellites.size === 0) return;
        
        const centerX = 1000; // Центр карты
        const centerY = 1000;
        
        this.trackedSatellites.forEach(satelliteId => {
            const satellite = this.satellites.find(s => s.id === satelliteId);
            if (satellite && !satellite.isDestroyed) {
                const dx = satellite.x - centerX;
                const dy = satellite.y - centerY;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                
                const line = document.createElement('div');
                line.className = 'tracking-line';
                line.dataset.target = satelliteId;
                line.style.cssText = `
                    position: absolute;
                    top: ${centerY}px;
                    left: ${centerX}px;
                    width: ${length}px;
                    height: 2px;
                    background: linear-gradient(90deg, 
                        transparent 0%, 
                        ${this.getStatusColor(satellite.status)} 50%, 
                        transparent 100%);
                    transform: rotate(${angle}deg);
                    transform-origin: 0 0;
                    opacity: 0.5;
                    pointer-events: none;
                    z-index: 1;
                `;
                
                // Анимированная точка на конце линии
                const dot = document.createElement('div');
                dot.style.cssText = `
                    position: absolute;
                    top: -3px;
                    right: -3px;
                    width: 8px;
                    height: 8px;
                    background: ${this.getStatusColor(satellite.status)};
                    border-radius: 50%;
                    box-shadow: 0 0 10px ${this.getStatusColor(satellite.status)};
                    animation: pulse 1s infinite;
                `;
                line.appendChild(dot);
                
                overlay.appendChild(line);
            }
        });
    }

    highlightTrackingLine(satelliteId) {
        const line = document.querySelector(`.tracking-line[data-target="${satelliteId}"]`);
        if (line) {
            line.style.opacity = '1';
            line.style.filter = 'drop-shadow(0 0 5px var(--cyan))';
        }
    }

    clearHighlightedLines() {
        document.querySelectorAll('.tracking-line').forEach(line => {
            line.style.opacity = '0.5';
            line.style.filter = 'none';
        });
    }

    clearTrackingLines() {
        const overlay = document.getElementById('tracking-overlay');
        overlay.innerHTML = '';
    }

    toggleTrackingLines() {
        const overlay = document.getElementById('tracking-overlay');
        overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
    }

    toggleOrbits() {
        // Реализация показа орбит
        console.log('Переключение показа орбит');
    }

    autoCenterTrackedSatellites() {
        if (this.trackedSatellites.size === 0) return;
        
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        
        this.trackedSatellites.forEach(satelliteId => {
            const satellite = this.satellites.find(s => s.id === satelliteId);
            if (satellite) {
                minX = Math.min(minX, satellite.x);
                maxX = Math.max(maxX, satellite.x);
                minY = Math.min(minY, satellite.y);
                maxY = Math.max(maxY, satellite.y);
            }
        });
        
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        // Здесь можно добавить логику центрирования карты
        console.log('Центрирование на координаты:', centerX, centerY);
    }

    setupRadar() {
        const canvas = document.getElementById('radar-canvas');
        const ctx = canvas.getContext('2d');
        
        // Установка размеров canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        let animationId = null;
        
        const drawRadar = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 20;
            
            // Рисуем сетку радара
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.lineWidth = 1;
            
            // Концентрические круги
            for (let i = 1; i <= 4; i++) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * i / 4, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Линии углов
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + radius * Math.cos(angle),
                    centerY + radius * Math.sin(angle)
                );
                ctx.stroke();
            }
            
            // Рисуем цели радара
            this.radarTargets.forEach(target => {
                if (target.satellite.isDestroyed) return;
                
                const distance = Math.sqrt(
                    Math.pow(target.satellite.x - 1000, 2) + 
                    Math.pow(target.satellite.y - 1000, 2)
                );
                
                const maxDistance = 1414; // Максимальное расстояние от центра
                const normalizedDistance = Math.min(distance / maxDistance, 1);
                
                const angle = Math.atan2(
                    target.satellite.y - 1000,
                    target.satellite.x - 1000
                );
                
                const radarX = centerX + radius * normalizedDistance * Math.cos(angle);
                const radarY = centerY + radius * normalizedDistance * Math.sin(angle);
                
                // Цвет цели в зависимости от статуса
                ctx.fillStyle = this.getStatusColor(target.satellite.status);
                ctx.beginPath();
                ctx.arc(radarX, radarY, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // Свечение цели
                ctx.shadowColor = this.getStatusColor(target.satellite.status);
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(radarX, radarY, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Если цель отслеживается - добавляем круговую анимацию
                if (this.trackedSatellites.has(target.satellite.id)) {
                    ctx.strokeStyle = this.getStatusColor(target.satellite.status);
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(radarX, radarY, 15, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });
            
            // Обновляем информацию о целях
            this.updateRadarTargetsList();
            
            animationId = requestAnimationFrame(drawRadar);
        };
        
        drawRadar();
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        });
    }

    addToRadarTargets(satellite) {
        // Удаляем дубликаты
        this.radarTargets = this.radarTargets.filter(t => t.satellite.id !== satellite.id);
        
        // Добавляем новую цель
        this.radarTargets.push({
            satellite: satellite,
            distance: Math.sqrt(Math.pow(satellite.x - 1000, 2) + Math.pow(satellite.y - 1000, 2)),
            lastDetected: Date.now(),
            signalStrength: satellite.signal
        });
        
        // Ограничиваем количество целей
        if (this.radarTargets.length > 10) {
            this.radarTargets.shift();
        }
        
        // Обновляем отображение
        this.updateRadarInfo();
    }

    updateRadarInfo() {
        document.getElementById('radar-detected').textContent = this.radarTargets.length;
        
        // Обновляем телеметрию радара
        if (this.radarTargets.length > 0) {
            const avgSignal = this.radarTargets.reduce((sum, target) => sum + target.signalStrength, 0) / this.radarTargets.length;
            const maxDistance = Math.max(...this.radarTargets.map(t => t.distance));
            
            document.getElementById('signal-value').textContent = `${Math.round(avgSignal)}%`;
            document.getElementById('signal-strength').style.width = `${avgSignal}%`;
            
            // Обновляем шум (случайное значение)
            const noise = Math.random() * 30;
            document.getElementById('noise-value').textContent = `${Math.round(noise)}%`;
            document.getElementById('noise-level').style.width = `${noise}%`;
            
            // Обновляем скорость сканирования
            const scanSpeed = 60 + Math.random() * 120;
            document.getElementById('scan-value').textContent = `${Math.round(scanSpeed)} об/мин`;
            document.getElementById('scan-speed').style.width = `${(scanSpeed / 180) * 100}%`;
            
            // Обновляем диапазон радара
            document.getElementById('radar-range').textContent = `${Math.round(maxDistance * 35).toLocaleString()} км`;
        }
    }

    updateRadarTargetsList() {
        const list = document.getElementById('radar-targets');
        list.innerHTML = '';
        
        // Сортируем цели по расстоянию
        const sortedTargets = [...this.radarTargets].sort((a, b) => a.distance - b.distance);
        
        sortedTargets.forEach((target, index) => {
            const item = document.createElement('div');
            item.className = `target-item ${this.selectedSatellite && this.selectedSatellite.id === target.satellite.id ? 'active' : ''}`;
            item.dataset.id = target.satellite.id;
            
            const isTracked = this.trackedSatellites.has(target.satellite.id);
            const distanceKm = Math.round(target.distance * 35);
            
            item.innerHTML = `
                <div class="target-header">
                    <div class="target-name">${target.satellite.name}</div>
                    <div class="target-distance">${distanceKm} км</div>
                </div>
                <div class="target-details">
                    <div class="target-type">${target.satellite.type}</div>
                    <div class="target-status ${target.satellite.status.toLowerCase()}">
                        ${target.satellite.status} ${isTracked ? '• ОТСЛЕЖИВАЕТСЯ' : ''}
                    </div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectSatellite(target.satellite);
            });
            
            list.appendChild(item);
        });
    }

    setRadarMode(mode) {
        console.log('Режим радара установлен:', mode);
        // Здесь можно добавить логику изменения режима работы радара
    }

    startTrackingUpdates() {
        setInterval(() => {
            this.updateSatellitePositions();
            this.updateTrackingStats();
            this.updateSystemStatus();
            this.updateRadarInfo();
        }, 2000);
    }

    updateSatellitePositions() {
        // Обновляем позиции спутников (имитация движения)
        this.satellites.forEach(satellite => {
            if (!satellite.isDestroyed) {
                // Случайное движение по орбите
                const angle = Math.random() * Math.PI * 2;
                const distance = 5;
                
                satellite.x += Math.cos(angle) * distance;
                satellite.y += Math.sin(angle) * distance;
                
                // Ограничиваем движение в пределах карты
                satellite.x = Math.max(100, Math.min(1900, satellite.x));
                satellite.y = Math.max(100, Math.min(1900, satellite.y));
                
                // Обновляем позицию на карте
                const element = document.querySelector(`.satellite-map[data-id="${satellite.id}"]`);
                if (element) {
                    element.style.left = `${satellite.x}px`;
                    element.style.top = `${satellite.y}px`;
                }
                
                // Обновляем линии отслеживания
                if (this.trackedSatellites.has(satellite.id)) {
                    this.drawTrackingLines();
                }
            }
        });
    }

    showDestructionWarning() {
        document.getElementById('destruction-warning').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideDestructionWarning() {
        document.getElementById('destruction-warning').style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('confirm-destruction').checked = false;
        document.getElementById('confirm-destruction-btn').disabled = true;
    }

    activateDestructionProtocol() {
        this.destructionActive = true;
        this.hideDestructionWarning();
        
        // Активируем таймер самоуничтожения
        this.startDestructionSequence();
        
        // Обновляем статус системы
        this.updateSystemStatus();
        
        // Показываем уведомление
        this.showNotification('ПРОТОКОЛ САМОУНИЧТОЖЕНИЯ АКТИВИРОВАН', 'danger');
    }

    startDestructionSequence() {
        let countdown = 10; // 10 секунд для демонстрации
        
        const destructionInterval = setInterval(() => {
            if (countdown <= 0) {
                clearInterval(destructionInterval);
                this.destroyAllSatellites();
                return;
            }
            
            // Обновляем таймер
            document.getElementById('timer').textContent = `00:${countdown.toString().padStart(2, '0')}`;
            
            // Визуальные эффекты
            if (countdown <= 5) {
                this.flashDestructionPanel();
            }
            
            countdown--;
        }, 1000);
    }

    flashDestructionPanel() {
        const panel = document.querySelector('.destruction-panel');
        panel.style.animation = 'none';
        setTimeout(() => {
            panel.style.animation = 'blink 0.5s infinite';
        }, 10);
    }

    destroyAllSatellites() {
        // Уничтожаем все спутники
        this.satellites.forEach(satellite => {
            satellite.isDestroyed = true;
            satellite.status = 'УНИЧТОЖЕН';
        });
        
        // Очищаем отслеживание
        this.trackedSatellites.clear();
        this.selectedSatellite = null;
        
        // Обновляем интерфейс
        this.renderGalaxyMap();
        this.updateTrackingList();
        this.updateSelectedSatelliteDisplay();
        this.clearTrackingLines();
        
        // Обновляем статус системы
        document.getElementById('system-status').textContent = 'КАТАСТРОФА';
        document.getElementById('system-status').style.color = 'var(--red)';
        
        // Обновляем количество спутников
        document.getElementById('total-satellites').textContent = '0';
        
        // Обновляем состояние системы
        document.getElementById('system-health').style.width = '0%';
        document.getElementById('health-value').textContent = '0%';
        
        // Обновляем аварийный статус
        const statusIndicator = document.getElementById('emergency-status');
        statusIndicator.innerHTML = `
            <div class="status-dot danger"></div>
            <span>СИСТЕМА УНИЧТОЖЕНА</span>
        `;
        
        // Отключаем кнопку самоуничтожения
        document.getElementById('destruction-btn').disabled = true;
        document.getElementById('destruction-btn').innerHTML = `
            <i class="fas fa-skull-crossbones"></i>
            <span>СИСТЕМА УНИЧТОЖЕНА</span>
        `;
        
        // Показываем финальное уведомление
        this.showNotification('ВСЕ СПУТНИКИ УНИЧТОЖЕНЫ. СИСТЕМА НЕРАБОТОСПОСОБНА.', 'critical');
        
        // Останавливаем все обновления
        clearInterval(this.destructionTimer);
    }

    emergencyStop() {
        if (this.destructionActive) {
            // Останавливаем процедуру самоуничтожения
            clearInterval(this.destructionTimer);
            this.destructionActive = false;
            
            // Сбрасываем таймер
            document.getElementById('timer').textContent = '--:--';
            
            // Обновляем статус системы
            this.updateSystemStatus();
            
            // Показываем уведомление
            this.showNotification('АВАРИЙНАЯ ОСТАНОВКА ВЫПОЛНЕНА', 'warning');
        } else {
            this.showNotification('СИСТЕМА НЕ НАХОДИТСЯ В РЕЖИМЕ САМОУНИЧТОЖЕНИЯ', 'info');
        }
    }

    performQuickAction(action) {
        switch(action) {
            case 'scan':
                this.performFullScan();
                break;
            case 'diagnostics':
                this.performSystemDiagnostics();
                break;
            case 'reboot':
                this.rebootTrackingSystem();
                break;
            case 'emergency':
                this.activateEmergencyProtocol();
                break;
        }
    }

    performFullScan() {
        // Сканируем все спутники
        const activeSatellites = this.satellites.filter(s => !s.isDestroyed).length;
        
        this.showNotification(`СКАНИРОВАНИЕ ВЫПОЛНЕНО. ОБНАРУЖЕНО: ${activeSatellites} СПУТНИКОВ`, 'info');
        
        // Обновляем информацию о сканировании
        document.getElementById('radar-accuracy').textContent = '99%';
        
        // Добавляем все спутники в цели радара
        this.satellites.forEach(satellite => {
            if (!satellite.isDestroyed) {
                this.addToRadarTargets(satellite);
            }
        });
    }

    performSystemDiagnostics() {
        const issues = [];
        
        // Проверяем состояние системы
        const destroyedCount = this.satellites.filter(s => s.isDestroyed).length;
        if (destroyedCount > 0) {
            issues.push(`УНИЧТОЖЕНО СПУТНИКОВ: ${destroyedCount}`);
        }
        
        const warningCount = this.satellites.filter(s => s.status === 'ПРЕДУПРЕЖДЕНИЕ').length;
        if (warningCount > 0) {
            issues.push(`СПУТНИКОВ С ПРЕДУПРЕЖДЕНИЕМ: ${warningCount}`);
        }
        
        const criticalCount = this.satellites.filter(s => s.status === 'КРИТИЧЕСКИЙ').length;
        if (criticalCount > 0) {
            issues.push(`СПУТНИКОВ В КРИТИЧЕСКОМ СОСТОЯНИИ: ${criticalCount}`);
        }
        
        if (issues.length === 0) {
            this.showNotification('ДИАГНОСТИКА ЗАВЕРШЕНА. НЕИСПРАВНОСТЕЙ НЕ ОБНАРУЖЕНО.', 'success');
        } else {
            const message = `ДИАГНОСТИКА ЗАВЕРШЕНА. ПРОБЛЕМЫ:\n${issues.join('\n')}`;
            this.showNotification(message, 'warning');
        }
    }

    rebootTrackingSystem() {
        // Перезагрузка системы отслеживания
        this.trackedSatellites.clear();
        this.selectedSatellite = null;
        
        // Обновляем интерфейс
        this.updateTrackingList();
        this.updateSelectedSatelliteDisplay();
        this.clearTrackingLines();
        
        this.showNotification('СИСТЕМА ОТСЛЕЖИВАНИЯ ПЕРЕЗАГРУЖЕНА', 'info');
    }

    activateEmergencyProtocol() {
        // Активация аварийного протокола
        this.showNotification('АВАРИЙНЫЙ ПРОТОКОЛ АКТИВИРОВАН', 'danger');
        
        // Переводим все спутники в безопасный режим
        this.satellites.forEach(satellite => {
            if (!satellite.isDestroyed && satellite.status !== 'НОРМАЛЬНЫЙ') {
                satellite.status = 'НОРМАЛЬНЫЙ';
            }
        });
        
        // Перерисовываем карту
        this.renderGalaxyMap();
        
        // Обновляем статус системы
        this.updateSystemStatus();
    }

    performDiagnostics(satelliteId) {
        const satellite = this.satellites.find(s => s.id === satelliteId);
        if (satellite) {
            const diagnostics = `
                Диагностика ${satellite.name}:
                • Сигнал: ${satellite.signal}%
                • Мощность: ${satellite.power}%
                • Температура: ${satellite.temperature}°C
                • Последний контакт: ${new Date(satellite.lastContact).toLocaleTimeString()}
            `;
            this.showNotification(diagnostics, 'info');
        }
    }

    rebootSatellite(satelliteId) {
        const satellite = this.satellites.find(s => s.id === satelliteId);
        if (satellite && !satellite.isDestroyed) {
            // Имитация перезагрузки спутника
            satellite.signal = 100;
            satellite.power = 100;
            satellite.status = 'НОРМАЛЬНЫЙ';
            
            // Обновляем отображение
            this.updateSelectedSatelliteDisplay();
            this.renderGalaxyMap();
            
            this.showNotification(`СПУТНИК ${satellite.name} ПЕРЕЗАГРУЖЕН`, 'success');
        }
    }

    emergencyProtocol(satelliteId) {
        const satellite = this.satellites.find(s => s.id === satelliteId);
        if (satellite && !satellite.isDestroyed) {
            // Имитация аварийного протокола
            satellite.status = 'КРИТИЧЕСКИЙ';
            satellite.signal = 10;
            satellite.power = 20;
            
            // Обновляем отображение
            this.updateSelectedSatelliteDisplay();
            this.renderGalaxyMap();
            
            this.showNotification(`АВАРИЙНЫЙ ПРОТОКОЛ АКТИВИРОВАН ДЛЯ ${satellite.name}`, 'danger');
        }
    }

    updateSystemStatus() {
        const destroyedCount = this.satellites.filter(s => s.isDestroyed).length;
        const warningCount = this.satellites.filter(s => s.status === 'ПРЕДУПРЕЖДЕНИЕ').length;
        const criticalCount = this.satellites.filter(s => s.status === 'КРИТИЧЕСКИЙ').length;
        const totalCount = this.satellites.length;
        
        // Рассчитываем состояние системы
        let systemHealth = 100;
        let status = 'НОРМАЛЬНОЕ';
        let statusColor = 'var(--primary-green)';
        
        if (destroyedCount > 0) {
            systemHealth -= (destroyedCount / totalCount) * 100;
        }
        
        if (criticalCount > 0) {
            systemHealth -= (criticalCount / totalCount) * 50;
            status = 'КРИТИЧЕСКОЕ';
            statusColor = 'var(--red)';
        } else if (warningCount > 0) {
            systemHealth -= (warningCount / totalCount) * 25;
            status = 'ПРЕДУПРЕЖДЕНИЕ';
            statusColor = 'var(--yellow)';
        }
        
        // Обновляем отображение
        document.getElementById('system-status').textContent = status;
        document.getElementById('system-status').style.color = statusColor;
        
        document.getElementById('system-health').style.width = `${systemHealth}%`;
        document.getElementById('health-value').textContent = `${Math.round(systemHealth)}%`;
        
        // Обновляем количество активных спутников
        const activeCount = totalCount - destroyedCount;
        document.getElementById('total-satellites').textContent = activeCount;
        
        // Обновляем аварийный статус
        const statusIndicator = document.getElementById('emergency-status');
        if (this.destructionActive) {
            statusIndicator.innerHTML = `
                <div class="status-dot danger"></div>
                <span>САМОУНИЧТОЖЕНИЕ АКТИВНО</span>
            `;
        } else if (criticalCount > 0) {
            statusIndicator.innerHTML = `
                <div class="status-dot warning"></div>
                <span>АВАРИЙНЫЙ РЕЖИМ: АКТИВЕН</span>
            `;
        } else {
            statusIndicator.innerHTML = `
                <div class="status-dot safe"></div>
                <span>АВАРИЙНЫЙ РЕЖИМ: ОТКЛЮЧЕН</span>
            `;
        }
    }

    startDestructionTimer() {
        this.destructionTimer = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                
                const minutes = Math.floor(this.timeLeft / 60);
                const seconds = this.timeLeft % 60;
                
                document.getElementById('timer').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // Если осталось меньше минуты - начинаем мигать
                if (this.timeLeft < 60) {
                    document.querySelector('.timer').style.animation = 'blink 1s infinite';
                }
            } else {
                // Автоматическая активация самоуничтожения
                this.activateDestructionProtocol();
                clearInterval(this.destructionTimer);
            }
        }, 1000);
    }

    updateClock() {
        const now = new Date();
        const hours = now.getUTCHours().toString().padStart(2, '0');
        const minutes = now.getUTCMinutes().toString().padStart(2, '0');
        const seconds = now.getUTCSeconds().toString().padStart(2, '0');
        
        document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds} UTC`;
    }

    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: ${type === 'warning' || type === 'danger' ? 'black' : 'white'};
            padding: 15px 20px;
            border-radius: 4px;
            border: 2px solid ${this.getNotificationBorderColor(type)};
            box-shadow: 0 0 20px ${this.getNotificationColor(type)};
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 5 секунд
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    getStatusColor(status) {
        switch(status) {
            case 'НОРМАЛЬНЫЙ': return 'var(--status-normal)';
            case 'ПРЕДУПРЕЖДЕНИЕ': return 'var(--status-warning)';
            case 'КРИТИЧЕСКИЙ': return 'var(--status-critical)';
            case 'УНИЧТОЖЕН': return 'var(--status-destroyed)';
            default: return 'var(--status-normal)';
        }
    }

    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'danger': return 'fa-skull-crossbones';
            case 'info': return 'fa-info-circle';
            default: return 'fa-info-circle';
        }
    }

    getNotificationColor(type) {
        switch(type) {
            case 'success': return 'var(--primary-green)';
            case 'warning': return 'var(--yellow)';
            case 'danger': return 'var(--red)';
            case 'info': return 'var(--cyan)';
            default: return 'var(--cyan)';
        }
    }

    getNotificationBorderColor(type) {
        switch(type) {
            case 'success': return 'var(--primary-dark)';
            case 'warning': return '#cc9900';
            case 'danger': return '#990000';
            case 'info': return '#008888';
            default: return '#008888';
        }
    }
}

// Инициализация системы при загрузке страницы
let satelliteSystem;

document.addEventListener('DOMContentLoaded', () => {
    satelliteSystem = new SatelliteTrackingSystem();
    window.satelliteSystem = satelliteSystem;
});
