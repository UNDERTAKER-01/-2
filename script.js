// Класс для имитации Солнечной системы
class SolarSystem {
    constructor() {
        this.planets = [];
        this.satellites = [];
        this.selectedObject = null;
        this.timeScale = 1;
        this.viewScale = 5;
        this.centerObject = 'sun';
        this.showOrbits = true;
        this.showGrid = true;
        this.showTrails = false;
        this.simulationDate = new Date('1999-01-01');
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.createSolarSystem();
        this.createSatellites();
        this.renderSolarSystem();
        this.setupEventListeners();
        this.startSimulation();
        this.updateSystemInfo();
    }

    createSolarSystem() {
        // Данные планет (расстояние в а.е., период в земных годах, радиус в пикселях)
        this.planets = [
            {
                name: 'МЕРКУРИЙ',
                type: 'planet',
                color: '#888888',
                distance: 0.39, // а.е.
                period: 0.24,   // года
                radius: 8,
                satellites: 0,
                description: 'Ближайшая к Солнцу планета. Температура поверхности: от -180°C до 430°C.'
            },
            {
                name: 'ВЕНЕРА',
                type: 'planet',
                color: '#ffcc66',
                distance: 0.72,
                period: 0.62,
                radius: 12,
                satellites: 0,
                description: 'Вторая планета. Атмосфера из углекислого газа, давление в 92 раза больше земного.'
            },
            {
                name: 'ЗЕМЛЯ',
                type: 'planet',
                color: '#0066cc',
                distance: 1.0,
                period: 1.0,
                radius: 13,
                satellites: 1,
                description: 'Третья планета. Единственное известное небесное тело, населенное живыми организмами.'
            },
            {
                name: 'МАРС',
                type: 'planet',
                color: '#ff6666',
                distance: 1.52,
                period: 1.88,
                radius: 10,
                satellites: 2,
                description: 'Четвертая планета. "Красная планета" из-за оксида железа в почве.'
            },
            {
                name: 'ЮПИТЕР',
                type: 'planet',
                color: '#ff9966',
                distance: 5.20,
                period: 11.86,
                radius: 28,
                satellites: 79,
                description: 'Пятая планета. Крупнейшая в Солнечной системе. Газовый гигант.'
            },
            {
                name: 'САТУРН',
                type: 'planet',
                color: '#ffcc99',
                distance: 9.58,
                period: 29.46,
                radius: 24,
                satellites: 82,
                description: 'Шестая планета. Известен своими кольцами из льда и камней.'
            },
            {
                name: 'УРАН',
                type: 'planet',
                color: '#66ccff',
                distance: 19.22,
                period: 84.01,
                radius: 18,
                satellites: 27,
                description: 'Седьмая планета. Ледяной гигант, вращается "на боку".'
            },
            {
                name: 'НЕПТУН',
                type: 'planet',
                color: '#6666ff',
                distance: 30.05,
                period: 164.8,
                radius: 17,
                satellites: 14,
                description: 'Восьмая планета. Самый ветреный мир в Солнечной системе.'
            },
            {
                name: 'ПЛУТОН',
                type: 'dwarf',
                color: '#cccccc',
                distance: 39.48,
                period: 248.09,
                radius: 6,
                satellites: 5,
                description: 'Карликовая планета. Ранее считался девятой планетой.'
            }
        ];
    }

    createSatellites() {
        // Группы спутников для каждой планеты
        const satelliteGroups = {
            earth: [
                { type: 'navigation', count: 24, name: 'GPS/GLONASS' },
                { type: 'communication', count: 15, name: 'Связь' },
                { type: 'scientific', count: 8, name: 'Научные' }
            ],
            mars: [
                { type: 'scientific', count: 5, name: 'Марсианские станции' }
            ],
            jupiter: [
                { type: 'scientific', count: 8, name: 'Исследователи Юпитера' }
            ],
            saturn: [
                { type: 'scientific', count: 6, name: 'Исследователи Сатурна' }
            ]
        };

        this.satellites = [];
        let id = 1;

        // Создаем спутники для каждой планеты
        Object.entries(satelliteGroups).forEach(([planet, groups]) => {
            groups.forEach(group => {
                for (let i = 0; i < group.count; i++) {
                    const planetData = this.planets.find(p => 
                        (planet === 'earth' && p.name === 'ЗЕМЛЯ') ||
                        (planet === 'mars' && p.name === 'МАРС') ||
                        (planet === 'jupiter' && p.name === 'ЮПИТЕР') ||
                        (planet === 'saturn' && p.name === 'САТУРН')
                    );

                    if (planetData) {
                        this.satellites.push({
                            id: id++,
                            name: `${group.name}-${i + 1}`,
                            type: group.type,
                            planet: planetData.name,
                            distance: planetData.distance,
                            orbitRadius: 0.01 + Math.random() * 0.02,
                            period: 0.1 + Math.random() * 0.2,
                            angle: Math.random() * Math.PI * 2,
                            status: Math.random() > 0.8 ? 'warning' : 'normal',
                            launchYear: 1990 + Math.floor(Math.random() * 9),
                            description: `Искусственный спутник ${planetData.name}. Тип: ${group.type}.`
                        });
                    }
                }
            });
        });
    }

    renderSolarSystem() {
        const map = document.getElementById('solar-system-map');
        map.innerHTML = '';

        // Создаем сетку координат
        this.createCoordinateGrid(map);

        // Создаем Солнце
        this.createSun(map);

        // Создаем орбиты
        if (this.showOrbits) {
            this.createOrbits(map);
        }

        // Создаем планеты
        this.planets.forEach(planet => {
            this.createPlanet(map, planet);
        });

        // Создаем спутники
        this.satellites.forEach(satellite => {
            this.createSatellite(map, satellite);
        });

        // Обновляем количество видимых спутников
        this.updateVisibleSatellites();
    }

    createCoordinateGrid(container) {
        if (!this.showGrid) return;

        const grid = document.createElement('div');
        grid.className = 'coordinate-grid';
        
        // Горизонтальная линия
        const horizontal = document.createElement('div');
        horizontal.className = 'grid-line horizontal';
        grid.appendChild(horizontal);
        
        // Вертикальная линия
        const vertical = document.createElement('div');
        vertical.className = 'grid-line vertical';
        grid.appendChild(vertical);
        
        container.appendChild(grid);
    }

    createSun(container) {
        const sun = document.createElement('div');
        sun.className = 'sun';
        sun.dataset.type = 'sun';
        sun.dataset.name = 'СОЛНЦЕ';
        
        sun.innerHTML = `
            <div class="sun-glow"></div>
        `;
        
        sun.addEventListener('click', () => {
            this.selectObject(sun, {
                name: 'СОЛНЦЕ',
                type: 'star',
                description: 'Звезда спектрального класса G2V. Источник энергии для всей Солнечной системы.',
                temperature: '5,500°C (поверхность), 15,000,000°C (ядро)',
                mass: '1.989 × 10³⁰ кг',
                diameter: '1,392,684 км'
            });
        });
        
        container.appendChild(sun);
    }

    createOrbits(container) {
        this.planets.forEach(planet => {
            const orbit = document.createElement('div');
            orbit.className = 'orbit';
            
            // Масштабируем расстояние для отображения
            const scaledDistance = this.scaleDistance(planet.distance);
            orbit.style.width = `${scaledDistance * 2}px`;
            orbit.style.height = `${scaledDistance * 2}px`;
            
            container.appendChild(orbit);
        });
    }

    createPlanet(container, planet) {
        const planetElement = document.createElement('div');
        planetElement.className = `planet ${planet.name.toLowerCase()}`;
        planetElement.dataset.name = planet.name;
        planetElement.dataset.type = planet.type;
        
        // Начальная позиция на орбите
        const angle = Math.random() * Math.PI * 2;
        const scaledDistance = this.scaleDistance(planet.distance);
        
        planetElement.style.width = `${planet.radius * 2}px`;
        planetElement.style.height = `${planet.radius * 2}px`;
        planetElement.style.background = planet.color;
        
        // Сохраняем данные для анимации
        planetElement.orbitData = {
            distance: scaledDistance,
            angle: angle,
            speed: (2 * Math.PI) / (planet.period * 365 * 24 * 60 * 60) // радиан/секунду
        };
        
        this.updatePlanetPosition(planetElement);
        
        // Для Сатурна добавляем кольца
        if (planet.name === 'САТУРН') {
            const ring = document.createElement('div');
            ring.className = 'saturn-ring';
            ring.style.width = `${planet.radius * 4}px`;
            ring.style.height = `${planet.radius * 4}px`;
            planetElement.appendChild(ring);
        }
        
        planetElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectObject(planetElement, planet);
            this.showPlanetSatellites(planet.name);
        });
        
        container.appendChild(planetElement);
    }

    createSatellite(container, satellite) {
        const satElement = document.createElement('div');
        satElement.className = `satellite ${satellite.type}`;
        satElement.dataset.id = satellite.id;
        satElement.dataset.name = satellite.name;
        satElement.dataset.type = 'satellite';
        
        satElement.style.width = '6px';
        satElement.style.height = '6px';
        satElement.style.background = this.getSatelliteColor(satellite.type);
        
        // Данные для анимации
        satElement.orbitData = {
            planetDistance: satellite.distance,
            orbitRadius: satellite.orbitRadius,
            angle: satellite.angle,
            speed: (2 * Math.PI) / (satellite.period * 365 * 24 * 60 * 60)
        };
        
        this.updateSatellitePosition(satElement);
        
        satElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectObject(satElement, satellite);
        });
        
        container.appendChild(satElement);
    }

    scaleDistance(distance) {
        // Масштабируем расстояние для отображения (1 а.е. = 100px на масштабе 5)
        const baseScale = 100;
        return distance * baseScale * (this.viewScale / 5);
    }

    updatePlanetPosition(planetElement) {
        if (!planetElement.orbitData) return;
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Обновляем угол в зависимости от времени
        const timePassed = Date.now() / 1000; // секунды
        planetElement.orbitData.angle += planetElement.orbitData.speed * timePassed * this.timeScale;
        
        const x = centerX + Math.cos(planetElement.orbitData.angle) * planetElement.orbitData.distance;
        const y = centerY + Math.sin(planetElement.orbitData.angle) * planetElement.orbitData.distance;
        
        planetElement.style.left = `${x}px`;
        planetElement.style.top = `${y}px`;
    }

    updateSatellitePosition(satElement) {
        if (!satElement.orbitData) return;
        
        const planetName = this.satellites.find(s => 
            s.id === parseInt(satElement.dataset.id)
        )?.planet;
        
        if (!planetName) return;
        
        const planetElement = document.querySelector(`.planet[data-name="${planetName}"]`);
        if (!planetElement) return;
        
        // Получаем позицию планеты
        const planetRect = planetElement.getBoundingClientRect();
        const planetX = planetRect.left + planetRect.width / 2;
        const planetY = planetRect.top + planetRect.height / 2;
        
        // Обновляем угол спутника
        const timePassed = Date.now() / 1000;
        satElement.orbitData.angle += satElement.orbitData.speed * timePassed * this.timeScale * 10; // Спутники движутся быстрее
        
        const scaledRadius = this.scaleDistance(satElement.orbitData.orbitRadius);
        const x = planetX + Math.cos(satElement.orbitData.angle) * scaledRadius;
        const y = planetY + Math.sin(satElement.orbitData.angle) * scaledRadius;
        
        satElement.style.left = `${x}px`;
        satElement.style.top = `${y}px`;
    }

    getSatelliteColor(type) {
        switch(type) {
            case 'navigation': return '#0f0';
            case 'communication': return '#ff0';
            case 'scientific': return '#0ff';
            case 'military': return '#f00';
            default: return '#fff';
        }
    }

    selectObject(element, data) {
        // Снимаем выделение со всех объектов
        document.querySelectorAll('.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Выделяем выбранный объект
        element.classList.add('selected');
        this.selectedObject = { element, data };
        
        // Обновляем информацию
        this.updateObjectDetails(data);
        this.updateTelemetry(data);
        
        // Обновляем координаты в подвале
        this.updateCoordinates(element);
    }

    updateObjectDetails(data) {
        const detailsPanel = document.getElementById('object-details');
        
        if (!data) {
            detailsPanel.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-satellite fa-3x"></i>
                    <p>Кликните на объект для информации</p>
                </div>
            `;
            return;
        }
        
        let detailsHTML = '';
        
        if (data.type === 'planet' || data.type === 'dwarf') {
            detailsHTML = `
                <div class="planet-detail">
                    <div class="detail-header">
                        <div class="detail-icon" style="background: ${data.color}"></div>
                        <div class="detail-title">
                            <h3>${data.name}</h3>
                            <div class="detail-type">${data.type === 'dwarf' ? 'КАРЛИКОВАЯ ПЛАНЕТА' : 'ПЛАНЕТА'}</div>
                        </div>
                    </div>
                    
                    <div class="detail-info">
                        <div class="info-item">
                            <span>РАССТОЯНИЕ ОТ СОЛНЦА:</span>
                            <span>${data.distance} а.е.</span>
                        </div>
                        <div class="info-item">
                            <span>ПЕРИОД ОБРАЩЕНИЯ:</span>
                            <span>${data.period} лет</span>
                        </div>
                        <div class="info-item">
                            <span>СПУТНИКОВ:</span>
                            <span>${data.satellites}</span>
                        </div>
                    </div>
                    
                    <div class="detail-description">
                        <p>${data.description}</p>
                    </div>
                </div>
            `;
        } else if (data.type === 'satellite') {
            detailsHTML = `
                <div class="satellite-detail">
                    <div class="detail-header">
                        <div class="detail-icon" style="background: ${this.getSatelliteColor(data.type)}"></div>
                        <div class="detail-title">
                            <h3>${data.name}</h3>
                            <div class="detail-type">ИСКУССТВЕННЫЙ СПУТНИК</div>
                        </div>
                    </div>
                    
                    <div class="detail-info">
                        <div class="info-item">
                            <span>ПЛАНЕТА:</span>
                            <span>${data.planet}</span>
                        </div>
                        <div class="info-item">
                            <span>ТИП:</span>
                            <span>${data.type.toUpperCase()}</span>
                        </div>
                        <div class="info-item">
                            <span>ЗАПУСК:</span>
                            <span>${data.launchYear}</span>
                        </div>
                        <div class="info-item">
                            <span>СТАТУС:</span>
                            <span class="status-${data.status}">${data.status === 'warning' ? 'ПРЕДУПРЕЖДЕНИЕ' : 'НОРМАЛЬНЫЙ'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-description">
                        <p>${data.description}</p>
                    </div>
                </div>
            `;
        } else if (data.name === 'СОЛНЦЕ') {
            detailsHTML = `
                <div class="star-detail">
                    <div class="detail-header">
                        <div class="detail-icon" style="background: #ff0"></div>
                        <div class="detail-title">
                            <h3>${data.name}</h3>
                            <div class="detail-type">ЗВЕЗДА</div>
                        </div>
                    </div>
                    
                    <div class="detail-info">
                        <div class="info-item">
                            <span>ТЕМПЕРАТУРА:</span>
                            <span>${data.temperature}</span>
                        </div>
                        <div class="info-item">
                            <span>МАССА:</span>
                            <span>${data.mass}</span>
                        </div>
                        <div class="info-item">
                            <span>ДИАМЕТР:</span>
                            <span>${data.diameter}</span>
                        </div>
                    </div>
                    
                    <div class="detail-description">
                        <p>${data.description}</p>
                    </div>
                </div>
            `;
        }
        
        detailsPanel.innerHTML = detailsHTML;
    }

    updateTelemetry(data) {
        // Обновляем телеметрию в зависимости от выбранного объекта
        if (data.type === 'planet') {
            document.getElementById('temperature').textContent = this.getPlanetTemperature(data.name);
            document.getElementById('temperature-bar').style.width = this.getTemperatureBarWidth(data.name);
            
            document.getElementById('radiation').textContent = this.getRadiationLevel(data.name);
            document.getElementById('radiation-bar').style.width = this.getRadiationBarWidth(data.name);
            
            document.getElementById('signal').textContent = '100%';
            document.getElementById('signal-bar').style.width = '100%';
            
            document.getElementById('velocity').textContent = this.getOrbitalVelocity(data.distance);
            document.getElementById('velocity-bar').style.width = this.getVelocityBarWidth(data.distance);
        } else if (data.type === 'satellite') {
            document.getElementById('temperature').textContent = '-65°C';
            document.getElementById('temperature-bar').style.width = '15%';
            
            document.getElementById('radiation').textContent = '0.8 мЗв';
            document.getElementById('radiation-bar').style.width = '40%';
            
            document.getElementById('signal').textContent = data.status === 'warning' ? '75%' : '100%';
            document.getElementById('signal-bar').style.width = data.status === 'warning' ? '75%' : '100%';
            
            document.getElementById('velocity').textContent = '7.8 км/с';
            document.getElementById('velocity-bar').style.width = '78%';
        }
    }

    getPlanetTemperature(planetName) {
        const temps = {
            'МЕРКУРИЙ': '430°C / -180°C',
            'ВЕНЕРА': '465°C',
            'ЗЕМЛЯ': '15°C',
            'МАРС': '-63°C',
            'ЮПИТЕР': '-145°C',
            'САТУРН': '-178°C',
            'УРАН': '-224°C',
            'НЕПТУН': '-218°C',
            'ПЛУТОН': '-229°C'
        };
        return temps[planetName] || '0°C';
    }

    getTemperatureBarWidth(planetName) {
        const values = {
            'МЕРКУРИЙ': '60%',
            'ВЕНЕРА': '80%',
            'ЗЕМЛЯ': '20%',
            'МАРС': '10%',
            'ЮПИТЕР': '5%',
            'САТУРН': '3%',
            'УРАН': '1%',
            'НЕПТУН': '2%',
            'ПЛУТОН': '0%'
        };
        return values[planetName] || '0%';
    }

    getRadiationLevel(planetName) {
        const levels = {
            'МЕРКУРИЙ': '5.6 мЗв',
            'ВЕНЕРА': '0.8 мЗв',
            'ЗЕМЛЯ': '0.3 мЗв',
            'МАРС': '0.7 мЗв',
            'ЮПИТЕР': '24.0 мЗв',
            'САТУРН': '0.9 мЗв',
            'УРАН': '0.4 мЗв',
            'НЕПТУН': '0.5 мЗв',
            'ПЛУТОН': '0.1 мЗв'
        };
        return levels[planetName] || '0.0 мЗв';
    }

    getRadiationBarWidth(planetName) {
        const values = {
            'МЕРКУРИЙ': '56%',
            'ВЕНЕРА': '8%',
            'ЗЕМЛЯ': '3%',
            'МАРС': '7%',
            'ЮПИТЕР': '80%',
            'САТУРН': '9%',
            'УРАН': '4%',
            'НЕПТУН': '5%',
            'ПЛУТОН': '1%'
        };
        return values[planetName] || '0%';
    }

    getOrbitalVelocity(distance) {
        // Примерная орбитальная скорость (км/с)
        const velocity = 30 / Math.sqrt(distance);
        return `${velocity.toFixed(1)} км/с`;
    }

    getVelocityBarWidth(distance) {
        // Шкала скорости (0-100%)
        const velocity = 30 / Math.sqrt(distance);
        const width = (velocity / 50) * 100; // Предполагаем макс скорость 50 км/с
        return `${Math.min(width, 100)}%`;
    }

    updateCoordinates(element) {
        const rect = element.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        const x = ((rect.left + rect.width / 2) - centerX) / 100;
        const y = ((rect.top + rect.height / 2) - centerY) / 100;
        
        // Для простоты Z = 0 (все в одной плоскости)
        document.getElementById('coordinates').textContent = 
            `X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, Z: 0.00 а.е.`;
    }

    showPlanetSatellites(planetName) {
        const satellitesList = document.getElementById('satellites-list');
        const planetSatellites = this.satellites.filter(s => s.planet === planetName);
        
        satellitesList.innerHTML = '';
        
        if (planetSatellites.length === 0) {
            satellitesList.innerHTML = `
                <div class="no-satellites">
                    <i class="fas fa-satellite"></i>
                    <p>Нет искусственных спутников</p>
                </div>
            `;
            return;
        }
        
        planetSatellites.forEach(satellite => {
            const item = document.createElement('div');
            item.className = 'satellite-item';
            item.dataset.id = satellite.id;
            
            item.innerHTML = `
                <div class="satellite-icon" style="background: ${this.getSatelliteColor(satellite.type)}">
                    <i class="fas fa-satellite"></i>
                </div>
                <div class="satellite-info">
                    <div class="satellite-name">${satellite.name}</div>
                    <div class="satellite-type">${satellite.type.toUpperCase()}</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                const satElement = document.querySelector(`.satellite[data-id="${satellite.id}"]`);
                if (satElement) {
                    this.selectObject(satElement, satellite);
                }
            });
            
            satellitesList.appendChild(item);
        });
    }

    updateVisibleSatellites() {
        const visibleCount = this.satellites.length;
        document.getElementById('visible-satellites').textContent = visibleCount;
        document.getElementById('total-satellites').textContent = visibleCount;
    }

    updateSystemInfo() {
        document.getElementById('distance-from-sun').textContent = '0 а.е.';
        
        // Обновляем дату и время симуляции
        const dateStr = this.simulationDate.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\./g, '.');
        
        const timeStr = this.simulationDate.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        document.getElementById('current-date').textContent = dateStr;
        document.getElementById('simulation-time').textContent = timeStr;
        
        // Обновляем режим системы
        document.getElementById('system-mode').textContent = 
            this.timeScale === 0 ? 'ПАУЗА' : 
            this.timeScale === 1 ? 'РЕАЛЬНОЕ ВРЕМЯ' : 
            `УСКОРЕНИЕ ${this.timeScale}x`;
    }

    setupEventListeners() {
        // Управление масштабом
        const scaleSlider = document.querySelector('.scale-slider');
        scaleSlider.addEventListener('input', (e) => {
            this.viewScale = parseInt(e.target.value);
            this.renderSolarSystem();
        });
        
        // Управление скоростью времени
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.timeScale = parseInt(e.target.dataset.speed);
                this.updateSystemInfo();
            });
        });
        
        // Управление видом
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                switch(e.target.dataset.view) {
                    case 'orbits':
                        this.showOrbits = true;
                        break;
                    case 'grid':
                        this.showGrid = !this.showGrid;
                        break;
                    case 'labels':
                        // Реализация меток
                        break;
                }
                
                this.renderSolarSystem();
            });
        });
        
        // Центрирование
        document.getElementById('center-select').addEventListener('change', (e) => {
            this.centerObject = e.target.value;
            this.centerOnObject();
        });
        
        // Управление картой
        document.getElementById('toggle-orbits').addEventListener('click', (e) => {
            this.showOrbits = !this.showOrbits;
            e.target.classList.toggle('active', this.showOrbits);
            this.renderSolarSystem();
        });
        
        document.getElementById('toggle-grid').addEventListener('click', (e) => {
            this.showGrid = !this.showGrid;
            e.target.classList.toggle('active', this.showGrid);
            this.renderSolarSystem();
        });
        
        document.getElementById('toggle-trails').addEventListener('click', (e) => {
            this.showTrails = !this.showTrails;
            e.target.classList.toggle('active', this.showTrails);
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
            this.viewScale = 5;
            this.timeScale = 1;
            scaleSlider.value = 5;
            this.renderSolarSystem();
            this.updateSystemInfo();
        });
        
        // Группировки спутников
        document.querySelectorAll('.group-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.group-item').forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
                
                const group = e.currentTarget.dataset.group;
                this.filterSatellitesByGroup(group);
            });
        });
    }

    filterSatellitesByGroup(group) {
        const satellites = document.querySelectorAll('.satellite');
        
        satellites.forEach(sat => {
            const satellite = this.satellites.find(s => s.id === parseInt(sat.dataset.id));
            
            let show = true;
            
            switch(group) {
                case 'earth':
                    show = satellite?.planet === 'ЗЕМЛЯ';
                    break;
                case 'mars':
                    show = satellite?.planet === 'МАРС';
                    break;
                case 'jupiter':
                    show = satellite?.planet === 'ЮПИТЕР';
                    break;
                case 'navigation':
                    show = satellite?.type === 'navigation';
                    break;
                case 'communication':
                    show = satellite?.type === 'communication';
                    break;
            }
            
            sat.style.display = show ? 'block' : 'none';
        });
        
        // Обновляем количество видимых спутников
        const visibleCount = Array.from(satellites).filter(s => s.style.display !== 'none').length;
        document.getElementById('visible-satellites').textContent = visibleCount;
    }

    centerOnObject() {
        // Реализация центрирования на объекте
        const map = document.getElementById('solar-system-map');
        
        switch(this.centerObject) {
            case 'sun':
                map.style.transform = 'translate(0, 0)';
                break;
            case 'earth':
                // Сдвигаем карту, чтобы Земля была в центре
                const earth = this.planets.find(p => p.name === 'ЗЕМЛЯ');
                if (earth) {
                    const offset = this.scaleDistance(earth.distance);
                    map.style.transform = `translate(-${offset}px, 0)`;
                }
                break;
        }
    }

    startSimulation() {
        const animate = () => {
            // Обновляем позиции планет
            document.querySelectorAll('.planet').forEach(planet => {
                this.updatePlanetPosition(planet);
            });
            
            // Обновляем позиции спутников
            document.querySelectorAll('.satellite').forEach(satellite => {
                this.updateSatellitePosition(satellite);
            });
            
            // Обновляем дату симуляции
            if (this.timeScale > 0) {
                const hours = this.timeScale / 3600; // Конвертируем масштаб в часы в секунду
                this.simulationDate.setTime(this.simulationDate.getTime() + hours * 1000);
                this.updateSystemInfo();
            }
            
            // Если выбран объект, обновляем его координаты
            if (this.selectedObject) {
                this.updateCoordinates(this.selectedObject.element);
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// Инициализация при загрузке
let solarSystem;

document.addEventListener('DOMContentLoaded', () => {
    solarSystem = new SolarSystem();
    window.solarSystem = solarSystem;
    
    // Инициализация часов
    const updateClock = () => {
        const now = new Date();
        const hours = now.getUTCHours().toString().padStart(2, '0');
        const minutes = now.getUTCMinutes().toString().padStart(2, '0');
        const seconds = now.getUTCSeconds().toString().padStart(2, '0');
        
        document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds} UTC`;
    };
    
    updateClock();
    setInterval(updateClock, 1000);
});
