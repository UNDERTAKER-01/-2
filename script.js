// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Обновление времени
    function updateClock() {
        const now = new Date();
        const utcHours = now.getUTCHours().toString().padStart(2, '0');
        const utcMinutes = now.getUTCMinutes().toString().padStart(2, '0');
        const utcSeconds = now.getUTCSeconds().toString().padStart(2, '0');
        
        document.getElementById('clock').textContent = `${utcHours}:${utcMinutes}:${utcSeconds} UTC`;
    }
    
    // Обновление каждую секунду
    setInterval(updateClock, 1000);
    updateClock(); // Первоначальный вызов
    
    // Анимация спутников
    function animateSatellites() {
        const satellites = document.querySelectorAll('.satellite');
        
        satellites.forEach(satellite => {
            // Случайное перемещение спутника
            const currentTop = parseInt(satellite.style.top) || 50;
            const currentLeft = parseInt(satellite.style.left) || 50;
            
            const newTop = Math.max(5, Math.min(95, currentTop + (Math.random() - 0.5) * 2));
            const newLeft = Math.max(5, Math.min(95, currentLeft + (Math.random() - 0.5) * 2));
            
            satellite.style.top = `${newTop}%`;
            satellite.style.left = `${newLeft}%`;
            
            // Клик по спутнику
            satellite.addEventListener('click', function() {
                const satelliteName = this.getAttribute('data-name');
                document.getElementById('satellite-name').textContent = `Название: ${satelliteName}`;
                
                // Случайные данные о спутнике
                const types = ['Навигационный', 'Коммуникационный', 'Научный', 'Военный', 'Метеорологический'];
                const operators = ['Космический Центр', 'NASA', 'Роскосмос', 'ESA', 'КНР'];
                
                document.getElementById('satellite-type').textContent = `Тип: ${types[Math.floor(Math.random() * types.length)]}`;
                document.getElementById('satellite-launch').textContent = `Запуск: ${Math.floor(Math.random() * 30 + 1)}.${Math.floor(Math.random() * 12 + 1)}.${Math.floor(Math.random() * 10 + 1990)}`;
                document.getElementById('satellite-operator').textContent = `Оператор: ${operators[Math.floor(Math.random() * operators.length)]}`;
                document.getElementById('satellite-period').textContent = `Период: ${(Math.random() * 20 + 90).toFixed(1)} мин`;
                
                // Показать всплывающее окно
                document.getElementById('satellite-info').style.display = 'flex';
            });
        });
    }
    
    // Анимация каждые 3 секунды
    setInterval(animateSatellites, 3000);
    animateSatellites(); // Первоначальный вызов
    
    // Закрытие всплывающего окна
    document.querySelector('.close-btn').addEventListener('click', function() {
        document.getElementById('satellite-info').style.display = 'none';
    });
    
    // Клик вне окна для закрытия
    document.getElementById('satellite-info').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
    
    // Анимация визуализатора сигнала
    function animateSignal() {
        const visualizer = document.querySelector('.signal-visualizer');
        const bars = 20;
        
        // Очистить предыдущие бары
        visualizer.innerHTML = '';
        
        // Создать новые бары сигнала
        for (let i = 0; i < bars; i++) {
            const bar = document.createElement('div');
            bar.style.position = 'absolute';
            bar.style.bottom = '0';
            bar.style.left = `${(i / bars) * 100}%`;
            bar.style.width = `${(100 / bars) * 0.8}%`;
            bar.style.height = `${Math.random() * 80 + 10}%`;
            bar.style.backgroundColor = `hsl(${100 + Math.random() * 60}, 100%, 50%)`;
            bar.style.opacity = '0.7';
            visualizer.appendChild(bar);
        }
    }
    
    // Анимация сигнала каждые 0.5 секунды
    setInterval(animateSignal, 500);
    animateSignal(); // Первоначальный вызов
    
    // Обновление счетчика посетителей
    function updateCounter() {
        const counterElement = document.getElementById('counter');
        let count = parseInt(counterElement.textContent);
        count += Math.floor(Math.random() * 3); // Случайное увеличение
        counterElement.textContent = count.toString().padStart(6, '0');
    }
    
    // Обновление счетчика каждые 10 секунд
    setInterval(updateCounter, 10000);
    
    // Эффект для кнопок меню
    const menuItems = document.querySelectorAll('.menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Эффект для кнопок управления
    const controlButtons = document.querySelectorAll('.map-controls .btn');
    controlButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Визуальная обратная связь
            this.style.backgroundColor = '#00aa00';
            this.style.boxShadow = '0 0 15px #0f0';
            
            setTimeout(() => {
                this.style.backgroundColor = '';
                this.style.boxShadow = '';
            }, 300);
            
            // Действия в зависимости от кнопки
            const buttonText = this.textContent;
            if (buttonText.includes('СТАРТ')) {
                alert('Запуск мониторинга спутников...');
            } else if (buttonText.includes('ПАУЗА')) {
                alert('Мониторинг приостановлен');
            }
        });
    });
});
