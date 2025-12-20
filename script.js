// Инициализация системы мониторинга
class SatelliteMonitor {
    constructor() {
        this.satellites = [];
        this.selectedSatellite = null;
        this.trackedSatellites = new Set();
        this.destructionActive = false;
        this.init();
    }

    init() {
        this.generateSatellites();
        this.renderSatelliteList();
        this.setupEventListeners();
        this.setupClock();
        this.setupRadar();
        this.animateMap();
    }

    generateSatellites() {
        const names = [
            'COSMOS', 'SPUTNIK', 'GALILEO', 'GPS', 'GLONASS', 'METEOR',
            'NAVSTAR', 'INTELSAT', 'HUBBLE', 'ISS', 'VOYAGER', 'CASSINI'
        ];
        
        const types = ['Навигационный', 'Коммуникационный', 'Научный', 'Военный', 'Метеорологический'];
        
        for (let i = 0; i < 47; i++) {
            const statusRand = Math.random();
            let status, statusClass;
            
            if (statusRand < 0.7) {
                status = 'НОРМАЛЬНЫЙ';
                statusClass = 'normal';
            } else if (statusRand < 0.9) {
                status = 'ПРЕДУПРЕЖДЕНИЕ';
                statusClass = 'warning';
            } else {
                status = 'КРИТИЧЕСКИЙ';
                statusClass = 'critical';
            }
            
            this.satellites.push({
                id: i + 1,
                name: `${names[i % names.length]}-${Math.floor(Math.random() * 1000)}`,
                type: types[i % types.length],
                status: status,
                statusClass: statusClass,
                altitude: Math.floor(Math.random() * 40000) + 200,
                speed: (Math.random() * 5 + 3).toFixed(1),
                signal: Math.floor(Math.random() * 30) + 70,
                power: Math.floor(Math.random() * 30) + 70,
                temperature: Math.floor(Math.random() * 200) - 100,
                x: Math.random() * 90 + 5,
                y: Math.random() * 90 + 5,
                isImportant: Math.random() > 0.8,
                isDestroyed: false
            });
        }
    }

    renderSatelliteList() {
        const container = document.querySelector('.list-container');
        container.innerHTML = '';
        
        this.satellites.forEach(satellite => {
            if (satellite.isDestroyed) return;
            
            const item = document.createElement('div');
            item.className = `satellite-item ${this.selectedSatellite && this.selectedSatellite.id === satellite.id ? 'selected' : ''}`;
            item.dataset.id = satellite.id;
            
            item.innerHTML = `
                <div class="sat-icon ${satellite.statusClass}">
                    <i class="fas fa-satellite"></i>
                </div>
                <div class="sat-info">
                    <div class="sat-name">${satellite.name}</div>
                    <div class="sat-details">
                        <span>${satellite.type}</span>
                        <span>${satellite.altitude} км</span>
                        <span>${satellite.status}</span>
                    </div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectSatellite(satellite);
            });
            
            container.appendChild(item);
        });
    }

    selectSatellite(satellite) {
        this.selectedSatellite = satellite;
        this.renderSatelliteList();
        this.displaySatelliteInfo();
        this.updateTrackingCount();
    }

    displaySatelliteInfo() {
        const container = document.getElementById('selected-info');
        
        if (!this.selectedSatellite) {
            container.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-satellite fa-3x"></i>
                    <p>Выберите спутник для информации</p>
                </div>
            `;
            return;
        }
        
        const sat = this.selectedSatellite;
        const isTracked = this.trackedSatellites.has(sat.id);
        
        container.innerHTML = `
            <div class="satellite-detail">
                <div class="sat-header">
                    <div class="sat-big-icon ${sat.statusClass}">
                        <i class="fas fa-satellite fa-3x"></i>
                    </div>
                    <div class="sat-title">
                        <h3>${sat.name}</h3>
                        <div class="sat-id">ID: ${sat.id.toString().padStart(3, '0')}</div>
                    </div>
                </div>
                
                <div class="sat-data">
                    <div class="data-row">
                        <span>Тип:</span>
                        <span>${sat.type}</span>
                    </div>
                    <div class="data-row">
                        <span>Статус:</span>
                        <span class="status-${sat.statusClass}">${sat.status}</span>
                    </div>
                    <div class="data-row">
                        <span>Высота:</span>
                        <span>${sat.altitude} км</span>
                    </div>
                    <div class="data-row">
                        <span>Скорость:</span>
                        <span>${sat.speed} км/с</span>
                    </div>
                    <div class="data-row">
                        <span>Сигнал:</span>
                        <span>${sat.signal}%</span>
                    </div>
                    <div class="data-row">
                        <span>Мощность:</span>
                        <span>${sat.power}%</span>
                    </div>
                </div>
                
                <div class="sat-actions">
                    <button class="action-btn ${isTracked ? 'tracked' : ''}" 
                            onclick="monitor.toggleTracking(${sat.id})">
                        <i class="fas ${isTracked ? 'fa-eye-slash' : 'fa-eye'}"></i>
                        ${isTracked ? 'ПРЕКРАТИТЬ СЛЕЖЕНИЕ' : 'ОТСЛЕЖИВАТЬ'}
                    </button>
                </div>
            </div>
        `;
    }

    toggleTracking(satelliteId) {
        if (this.trackedSatellites.has(satelliteId)) {
            this.trackedSatellites.delete(satelliteId);
        } else {
            this.trackedSatellites.add(satelliteId);
        }
        
        this.displaySatelliteInfo();
        this.updateTrackingCount();
        this.updateRadarTargets();
    }

    updateTrackingCount() {
        document.getElementById('tracking-count').textContent = this.trackedSatellites.size;
    }

    setupEventListeners() {
        // Отслеживание всех спутников
        document.getElementById('track-all').addEventListener('click', () => {
            this.satellites.forEach(sat => {
                if (!sat.isDestroyed) {
                    this.trackedSatellites.add(sat.id);
                }
            });
            this.updateTrackingCount();
            this.displaySatelliteInfo();
        });
        
        // Очистка отслеживания
        document.getElementById('clear-tracking').addEventListener('click', () => {
            this.trackedSatellites.clear();
            this.updateTrackingCount();
            this.displaySatelliteInfo();
        });
        
        // Кнопка самоуничтожения
        document.getElementById('destruction-btn').addEventListener('click', () => {
            this.showDestructionWarning();
        });
        
        // Подтверждение самоуничтожения
        document.getElementById('confirm-btn').addEventListener('click', () => {
            this.activateDestructionProtocol();
        });
        
        // Отмена самоуничтожения
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hideDestructionWarning();
        });
        
        // Подтверждение чекбокса
        document.getElementById('confirm-box').addEventListener('change', (e) => {
            document.getElementById('confirm-btn').disabled = !e.target.checked;
        });
    }

    setupClock() {
        const updateClock = () => {
            const now = new Date();
            const hours = now.getUTCHours().toString().padStart(2, '0');
            const minutes = now.getUTCMinutes().toString().padStart(2, '0');
            const seconds = now.getUTCSeconds().toString().padStart(2, '0');
            
            document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds} UTC`;
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    setupRadar() {
        const canvas = document.getElementById('radar-canvas');
        const ctx = canvas.getContext('2d');
        
        // Установка размеров
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        let sweepAngle = 0;
        
        const drawRadar = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 10;
            
            // Сетка радара
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.lineWidth = 1;
            
            // Концентрические круги
            for (let i = 1; i <= 3; i++) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * i / 3, 0, Math.PI * 2);
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
            
            // Развертка радара
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + radius * Math.cos(sweepAngle),
                centerY + radius * Math.sin(sweepAngle)
            );
            ctx.stroke();
            
            sweepAngle += 0.05;
            
            // Цели радара
            const targets = this.trackedSatellites.size + Math.floor(Math.random() * 10);
            document.getElementById('radar-targets').textContent = targets;
            
            // Рисуем цели
            ctx.fillStyle = '#0ff';
            for (let i = 0; i < targets; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * radius * 0.8;
                
                const x = centerX + distance * Math.cos(angle);
                const y = centerY + distance * Math.sin(angle);
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Свечение
                ctx.shadowColor = '#0ff';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            
            requestAnimationFrame(drawRadar);
        };
        
        drawRadar();
        
        // Обработка изменения размера
        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        });
    }

    animateMap() {
        const map = document.getElementById('galaxy-map');
        
        // Создаем звездное поле
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: white;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.8 + 0.2};
            `;
            map.appendChild(star);
        }
        
        // Создаем спутники на карте
        this.satellites.forEach(satellite => {
            if (satellite.isDestroyed) return;
            
            const satElement = document.createElement('div');
            satElement.className = `map-satellite ${satellite.statusClass}`;
            satElement.dataset.id = satellite.id;
            satElement.style.cssText = `
                position: absolute;
                left: ${satellite.x}%;
                top: ${satellite.y}%;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 10;
            `;
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-satellite';
            icon.style.cssText = `
                font-size: 24px;
                color: ${this.getStatusColor(satellite.statusClass)};
                text-shadow: 0 0 10px ${this.getStatusColor(satellite.statusClass)};
                animation: float 3s infinite ease-in-out;
            `;
            
            satElement.appendChild(icon);
            map.appendChild(satElement);
            
            // Обработчик клика
            satElement.addEventListener('click', () => {
                this.selectSatellite(satellite);
            });
        });
        
        // Анимация движения спутников
        setInterval(() => {
            document.querySelectorAll('.map-satellite').forEach(element => {
                const currentLeft = parseFloat(element.style.left);
                const currentTop = parseFloat(element.style.top);
                
                const newLeft = (currentLeft + (Math.random() - 0.5) * 0.5) % 100;
                const newTop = (currentTop + (Math.random() - 0.5) * 0.5) % 100;
                
                element.style.left = `${newLeft}%`;
                element.style.top = `${newTop}%`;
            });
        }, 1000);
    }

    getStatusColor(statusClass) {
        switch(statusClass) {
            case 'normal': return '#0f0';
            case 'warning': return '#ff0';
            case 'critical': return '#f00';
            default: return '#0ff';
        }
    }

    showDestructionWarning() {
        document.getElementById('destruction-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideDestructionWarning() {
        document.getElementById('destruction-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('confirm-box').checked = false;
        document.getElementById('confirm-btn').disabled = true;
    }

    activateDestructionProtocol() {
        this.destructionActive = true;
        this.hideDestructionWarning();
        
        // Запускаем обратный отсчет
        let countdown = 5;
        const timerElement = document.querySelector('.timer');
        const originalTimer = timerElement.textContent;
        
        const countdownInterval = setInterval(() => {
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.destroyAllSatellites();
                timerElement.textContent = '00:00';
                return;
            }
            
            timerElement.textContent = `00:0${countdown}`;
            countdown--;
        }, 1000);
        
        // Визуальные эффекты
        const panel = document.querySelector('.destruction-panel');
        panel.style.animation = 'blink 0.5s infinite';
        
        // Звуковые эффекты (имитация)
        const beep = () => {
            console.log('BEEP!');
        };
        
        const beepInterval = setInterval(beep, 1000);
        
        // Остановка всех эффектов при отмене
        setTimeout(() => {
            if (this.destructionActive) {
                clearInterval(beepInterval);
                panel.style.animation = '';
                timerElement.textContent = originalTimer;
            }
        }, 6000);
    }

    destroyAllSatellites() {
        // Уничтожаем все спутники
        this.satellites.forEach(satellite => {
            satellite.isDestroyed = true;
            satellite.status = 'УНИЧТОЖЕН';
            satellite.statusClass = 'destroyed';
        });
        
        // Очищаем отслеживание
        this.trackedSatellites.clear();
        this.selectedSatellite = null;
        
        // Обновляем интерфейс
        this.renderSatelliteList();
        this.displaySatelliteInfo();
        this.updateTrackingCount();
        
        // Обновляем карту
        document.querySelectorAll('.map-satellite').forEach(el => {
            el.style.display = 'none';
        });
        
        // Обновляем статистику
        document.querySelectorAll('.stat-value').forEach(el => {
            if (el.textContent.includes('47')) {
                el.textContent = '0';
            }
        });
        
        // Отключаем кнопку
        document.getElementById('destruction-btn').disabled = true;
        document.getElementById('destruction-btn').innerHTML = `
            <i class="fas fa-skull-crossbones"></i>
            <span>СИСТЕМА УНИЧТОЖЕНА</span>
        `;
        
        // Показываем уведомление
        alert('ВСЕ СПУТНИКИ УНИЧТОЖЕНЫ. СИСТЕМА НЕРАБОТОСПОСОБНА.');
    }

    updateRadarTargets() {
        // Обновляем количество целей на радаре
        const targets = this.trackedSatellites.size + Math.floor(Math.random() * 5);
        document.getElementById('radar-targets').textContent = targets;
    }
}

// Инициализация при загрузке
let monitor;

document.addEventListener('DOMContentLoaded', () => {
    monitor = new SatelliteMonitor();
    window.monitor = monitor;
});
