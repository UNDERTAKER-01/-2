// game.js
let gameActive = false;

window.addEventListener('hashchange', () => {
  if (location.hash === '#game') showGameScreen();
  else hideGameScreen();
});

function showGameScreen() {
  gameActive = true;
  document.body.insertAdjacentHTML('beforeend', `
    <div id="game-overlay" class="overlay">
      <div class="game-screen">
        <h2>МОДУЛЬ САМОУНИЧТОЖЕНИЯ — РЕМОНТ</h2>
        <div id="diagram">
          <svg width="400" height="200">
            <rect x="50" y="50" width="300" height="100" fill="#111" stroke="#00ff00"/>
            <text x="200" y="100" text-anchor="middle" fill="#00ff00">БУРАН-4: ЦЕНТРАЛЬНЫЙ БЛОК</text>
            <g id="slots">
              <rect x="90" y="70" width="30" height="30" fill="none" stroke="#ff0000" stroke-dasharray="4,2"/>
              <rect x="180" y="70" width="30" height="30" fill="none" stroke="#ff0000" stroke-dasharray="4,2"/>
              <rect x="270" y="70" width="30" height="30" fill="none" stroke="#ff0000" stroke-dasharray="4,2"/>
            </g>
          </svg>
        </div>
        <div id="parts">
          <div class="part" data-type="power" draggable="true">⚡</div>
          <div class="part" data-type="cpu" draggable="true">🧠</div>
          <div class="part" data-type="fuse" draggable="true">⚠️</div>
        </div>
        <div id="timer">САМОУНИЧТОЖЕНИЕ: <span id="countdown">03:00</span></div>
        <button id="btn-abort">ПРЕРВАТЬ</button>
      </div>
    </div>
  `);

  setupDragDrop();
  startCountdown();
}

function hideGameScreen() {
  gameActive = false;
  document.getElementById('game-overlay')?.remove();
}

function setupDragDrop() {
  const parts = document.querySelectorAll('.part');
  const slots = document.querySelectorAll('#slots rect');

  parts.forEach(part => {
    part.addEventListener('dragstart', e => {
      e.dataTransfer.setData('type', part.dataset.type);
    });
  });

  slots.forEach((slot, i) => {
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('drop', e => {
      e.preventDefault();
      const type = e.dataTransfer.getData('type');
      const correctTypes = ['power', 'cpu', 'fuse'];
      if (type === correctTypes[i]) {
        slot.style.fill = '#00ff00';
        slot.style.stroke = '#00ff00';
        playSound('beep');
        checkWin();
      } else {
        playSound('alert');
        addLog('ОШИБКА: НЕПРАВИЛЬНЫЙ МОДУЛЬ', 'error');
      }
    });
  });

  document.getElementById('btn-abort').onclick = () => {
    addLog('ПРОТОКОЛ САМОУНИЧТОЖЕНИЯ — ОТМЕНЁН', 'warn');
    hideGameScreen();
  };
}

function startCountdown() {
  let sec = 180; // 3:00
  const timerEl = document.getElementById('countdown');
  const interval = setInterval(() => {
    if (!gameActive) return clearInterval(interval);
    sec--;
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    timerEl.textContent = `${mm}:${ss}`;
    if (sec <= 30) timerEl.style.color = '#ff0000';
    if (sec <= 0) {
      clearInterval(interval);
      addLog('БУРАН-4: САМОУНИЧТОЖЕНИЕ АКТИВИРОВАНО', 'error');
      setTimeout(() => hideGameScreen(), 2000);
    }
  }, 1000);
}

function checkWin() {
  const filled = document.querySelectorAll('#slots rect[fill="#00ff00"]').length;
  if (filled === 3) {
    addLog('МОДУЛЬ ВОССТАНОВЛЕН. САМОУНИЧТОЖЕНИЕ ОТКЛЮЧЕНО.', 'warn');
    setTimeout(() => {
      addLog('ДОСТУП ОТКРЫТ: ПРОТОКОЛ „ОКО ЗВЕРЯ“ — ГОТОВ К ЗАПУСКУ', 'error');
      hideGameScreen();
    }, 1500);
  }
}
