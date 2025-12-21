// radar.js
window.addEventListener('hashchange', () => {
  if (location.hash === '#radar') showRadar();
  else hideRadar();
});

function showRadar() {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="radar-overlay" class="overlay">
      <div class="radar-screen">
        <h2>РАДИОЛОКАЦИОННАЯ СТАНЦИЯ „ВИХРЬ“</h2>
        <svg id="radar-scan" width="500" height="500" viewBox="-250 -250 500 500">
          <circle r="240" fill="none" stroke="#004400" stroke-width="1"/>
          <circle r="180" fill="none" stroke="#003300" stroke-width="1"/>
          <circle r="120" fill="none" stroke="#002200" stroke-width="1"/>
          <circle r="60" fill="none" stroke="#001100" stroke-width="1"/>
          <line x1="0" y1="0" x2="0" y2="-240" stroke="#00ff00" stroke-width="2" id="scan-line"/>
          <g id="radar-dots"></g>
        </svg>
        <div id="radar-log">ОЖИДАНИЕ СИГНАЛОВ...</div>
      </div>
    </div>
  `);

  const line = document.getElementById('scan-line');
  let angle = 0;
  const dots = document.getElementById('radar-dots');
  const log = document.getElementById('radar-log');

  // Имитация сигналов
  setInterval(() => {
    if (Math.random() < 0.3) {
      const a = Math.random() * 360;
      const r = 60 + Math.random() * 180;
      const x = Math.sin(a * Math.PI/180) * r;
      const y = -Math.cos(a * Math.PI/180) * r;
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', x);
      dot.setAttribute('cy', y);
      dot.setAttribute('r', 3);
      dot.setAttribute('fill', '#00ff00');
      dot.setAttribute('class', 'blink-slow');
      dots.appendChild(dot);
      setTimeout(() => dot.remove(), 3000);
      log.textContent = `СИГНАЛ: АЗИМУТ ${a.toFixed(1)}°, ДИСТАНЦИЯ ${r.toFixed(0)} км`;
      playSound('beep');
    }
  }, 800);

  // Вращение луча
  function rotate() {
    angle = (angle + 2) % 360;
    const rad = angle * Math.PI / 180;
    line.setAttribute('x2', Math.sin(rad) * 240);
    line.setAttribute('y2', -Math.cos(rad) * 240);
    if (document.getElementById('radar-overlay')) requestAnimationFrame(rotate);
  }
  rotate();
}

function hideRadar() {
  document.getElementById('radar-overlay')?.remove();
}
