// main.js
let satellitesData = [];
let tankers = [
  { x: 200, y: 400, dx: 1.2, dy: -0.3, id: 'tkr-1' },
  { x: 800, y: 350, dx: -0.9, dy: 0.4, id: 'tkr-2' },
  { x: 500, y: 500, dx: 0.7, dy: -0.5, id: 'tkr-3' }
];
let oilRigs = [
  { x: 300, y: 300 }, { x: 450, y: 280 }, { x: 600, y: 320 },
  { x: 250, y: 420 }, { x: 700, y: 380 }
];

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  initOilRigs();
  initTankers();
  fetchSatellites(); // CelesTrak
  animate();
  bindEvents();
});

function initOilRigs() {
  const svg = document.getElementById('oil-rigs');
  oilRigs.forEach((rig, i) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = `
      <circle cx="${rig.x}" cy="${rig.y}" r="4" fill="#00aa00"/>
      <text x="${rig.x+8}" y="${rig.y+4}" fill="#00ff88" font-size="10">R${i+1}</text>
    `;
    svg.appendChild(g);
  });
}

function initTankers() {
  const svg = document.getElementById('tankers');
  tankers.forEach(t => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.id = `tanker-${t.id}`;
    g.innerHTML = `
      <polygon points="${t.x},${t.y-6} ${t.x-5},${t.y+4} ${t.x+5},${t.y+4}" 
               fill="#0088ff" stroke="#00ccff" stroke-width="0.5"/>
      <text x="${t.x+8}" y="${t.y+4}" fill="#00ccff" font-size="9">T${t.id.slice(-1)}</text>
    `;
    svg.appendChild(g);
  });
}

function fetchSatellites() {
  // CelesTrak: последние 5 КА из списка "active"
  const url = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle';
  // Для оффлайн-режима — имитация
  setTimeout(() => {
    satellitesData = [
      { name: 'COSMOS-2471', x: 400, y: 150, r: 3 },
      { name: 'GPS-BIIR-3', x: 900, y: 180, r: 2 },
      { name: 'ISS (ZARYA)', x: 700, y: 250, r: 4 },
      { name: 'HUBBLE', x: 300, y: 300, r: 2 }
    ];
    renderSatellites();
  }, 500);
}

function renderSatellites() {
  const svg = document.getElementById('satellites');
  svg.innerHTML = '';
  satellitesData.forEach(sat => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', sat.x);
    circle.setAttribute('cy', sat.y);
    circle.setAttribute('r', sat.r);
    circle.setAttribute('fill', '#00ffaa');
    circle.setAttribute('class', 'satellite blink-slow');
    circle.dataset.name = sat.name;
    svg.appendChild(circle);
  });
}

function animate() {
  // Движение танкеров
  tankers.forEach(t => {
    t.x += t.dx;
    t.y += t.dy;
    if (t.x < 50 || t.x > 1150) t.dx *= -1;
    if (t.y < 50 || t.y > 550) t.dy *= -1;

    const el = document.getElementById(`tanker-${t.id}`);
    el.querySelector('polygon').setAttribute('points',
      `${t.x},${t.y-6} ${t.x-5},${t.y+4} ${t.x+5},${t.y+4}`
    );
    el.querySelector('text').setAttribute('x', t.x + 8);
    el.querySelector('text').setAttribute('y', t.y + 4);
  });

  requestAnimationFrame(animate);
}

function bindEvents() {
  document.getElementById('buran4').addEventListener('click', () => {
    addLog('⚠️ БУРАН-4\nКоординаты: 63°N, 72°E\nСтатус: АКТИВЕН\nПротокол: ОКО ЗВЕРЯ — ЗАГРУЖЕН', 'error');
    playSound('alert');
  });

  document.getElementById('satellites').addEventListener('click', e => {
    if (e.target.tagName === 'circle') {
      const name = e.target.dataset.name;
      addLog(`🛰️ ${name} — сигнал получен`, 'warn');
    }
  });

  document.getElementById('btn-radar').onclick = () => window.location.href = '#radar';
  document.getElementById('btn-archive').onclick = () => window.location.href = '#archive';
  document.getElementById('btn-game').onclick = () => window.location.href = '#game';
  document.getElementById('btn-report').onclick = () => window.location.href = '#report';
}

function addLog(text, type = 'normal') {
  const log = document.getElementById('log-entries');
  const div = document.createElement('div');
  div.className = `log-entry ${type}`;
  div.textContent = new Date().toISOString().slice(0,19).replace('T',' ') + ' — ' + text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

// Вспомогательные
function playSound(name) {
  if (window.sounds && sounds[name]) {
    const audio = new Audio(sounds[name]);
    audio.volume = 0.6;
    audio.play().catch(e => console.warn('Audio blocked'));
  }
}
