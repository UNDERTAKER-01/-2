// report.js
window.addEventListener('hashchange', () => {
  if (location.hash === '#report') showReportScreen();
  else hideReportScreen();
});

function showReportScreen() {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="report-overlay" class="overlay">
      <div class="report-screen">
        <h2>ОТПРАВКА ТЕХНИЧЕСКОГО ОТЧЁТА</h2>
        <textarea id="report-text" placeholder="Введите протокол...">Объект Буран-4 проявляет признаки внеземной активности. Рекомендую: не доверять ИИ-модулю "Око Зверя".</textarea>
        <div id="transmission" style="display:none">
          <div class="progress-bar"><div id="progress-fill"></div></div>
          <div id="tx-status">ИНИЦИАЛИЗАЦИЯ ПЕРЕДАЧИ...</div>
        </div>
        <button id="btn-send">ОТПРАВИТЬ НА БАЗУ</button>
        <button id="btn-close">ЗАКРЫТЬ</button>
      </div>
    </div>
  `);

  document.getElementById('btn-send').onclick = transmitReport;
  document.getElementById('btn-close').onclick = hideReportScreen;
}

function hideReportScreen() {
  document.getElementById('report-overlay')?.remove();
}

function transmitReport() {
  const btn = document.getElementById('btn-send');
  const tx = document.getElementById('transmission');
  const status = document.getElementById('tx-status');
  const fill = document.getElementById('progress-fill');

  btn.disabled = true;
  tx.style.display = 'block';

  // Имитация передачи
  let progress = 0;
  const interval = setInterval(() => {
    progress += 2;
    fill.style.width = progress + '%';
    if (progress === 30) status.textContent = 'ШИФРОВАНИЕ...';
    if (progress === 60) status.textContent = 'ЗАХВАТ КАНАЛА...';
    if (progress === 85) status.textContent = 'ПЕРЕДАЧА ДАННЫХ...';
    if (progress >= 100) {
      clearInterval(interval);
      status.textContent = '✅ ОТЧЁТ ДОСТАВЛЕН НА БАЗУ-7 (ЧЕЛЯБИНСК-70)';
      playSound('beep');
      // Сохраняем в localStorage
      const report = {
        time: new Date().toISOString(),
        text: document.getElementById('report-text').value
      };
      const reports = JSON.parse(localStorage.getItem('reports') || '[]');
      reports.push(report);
      localStorage.setItem('reports', JSON.stringify(reports));
      setTimeout(hideReportScreen, 2000);
    }
  }, 80);
}
