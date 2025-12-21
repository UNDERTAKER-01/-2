// === СОСТОЯНИЕ ===
let gameData = JSON.parse(localStorage.getItem('buran4_quest') || 
  JSON.stringify({
    step: 1,
    sanity: 100,
    xorKey: null,
    chat: {
      state: 'greeting',
      askedPrice: false,
      askedLocation: false,
      chosenOption: null,
      messages: []
    }
  })
);

// === DOM ===
const comic = document.getElementById('comic');
const terminal = document.getElementById('terminal');
const input = document.getElementById('terminal-input');
const passportExport = document.getElementById('passport-export');

// === ЗВУКИ ===
const SOUNDS = {
  beep: () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 800;
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, 80);
  }
};

function playSound(name) {
  if (SOUNDS[name]) SOUNDS[name]();
}

// === САНИТИ ===
function updateSanity(delta) {
  gameData.sanity = Math.max(0, Math.min(100, gameData.sanity + delta));
  localStorage.setItem('buran4_quest', JSON.stringify(gameData));
  
  document.body.classList.remove('sanity-low', 'sanity-critical');
  if (gameData.sanity <= 60) document.body.classList.add('sanity-low');
  if (gameData.sanity <= 25) document.body.classList.add('sanity-critical');
}

// === СЛАЙДЫ ===
function goToSlide(step) {
  document.querySelectorAll('.comic-slide').forEach(slide => {
    slide.classList.remove('active');
  });
  document.querySelector(`.comic-slide[data-step="${step}"]`).classList.add('active');
  gameData.step = step;
  localStorage.setItem('buran4_quest', JSON.stringify(gameData));
}

// === ЛОГ ===
function log(text, type = 'normal') {
  const logDiv = document.createElement('div');
  logDiv.className = `terminal-log ${type}-log`;
  logDiv.innerHTML = type === 'command' 
    ? `<span class="prompt">zenit7@electron:~$</span> ${text}`
    : text;
  terminal.insertBefore(logDiv, input.parentElement);
  terminal.scrollTop = terminal.scrollHeight;
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
  if (gameData.step > 1) goToSlide(gameData.step);
  setInterval(() => { if (Math.random() > 0.97) playSound('beep'); }, 5000);
});

// === ТЕРМИНАЛ ===
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const cmd = input.value.trim().toLowerCase();
    log(cmd, 'command');
    input.value = '';

    setTimeout(() => {
      switch (cmd) {
        case 'help':
          log('[ИНФО] Команды:');
          log('chat      - переговоры с хакером');
          log('report    - финальный отчёт (после координат)');
          log('scan      - сканировать сеть');
          log('exit      - покинуть систему');
          break;

        case 'chat':
          if (gameData.step === 1) {
            log('[СИСТЕМА] Подключение к #underground...', 'system');
            setTimeout(startChat, 800);
          } else {
            log('[ОШИБКА] Доступно только в начале', 'error');
          }
          break;

        case 'report':
          if (gameData.chat.chosenOption) {
            generateReport();
          } else {
            log('[ОШИБКА] Сначала получите координаты', 'error');
          }
          break;

        case 'scan':
          if (gameData.step === 1 && gameData.chat.chosenOption) {
            log('[СКАНИРОВАНИЕ] Поиск объекта...', 'system');
            setTimeout(() => {
              log('[ОБНАРУЖЕН] Объект: БУРАН-4 (активен)', 'warn');
              log('[КООРДИНАТЫ] 63.0517°N, 72.1184°E', 'warn');
              goToSlide(2);
            }, 2000);
          } else if (gameData.step === 1) {
            log('[ОШИБКА] Сначала получите координаты через чат', 'error');
          } else {
            log('[СИСТЕМА] Уже отсканировано', 'system');
          }
          break;

        case 'exit':
          log('[СИСТЕМА] Отключение...', 'system');
          setTimeout(() => {
            log('[ПРЕДУПРЕЖДЕНИЕ] Активен протокол слежения', 'error');
          }, 1000);
          break;

        default:
          log(`[ОШИБКА] Неизвестная команда: ${cmd}`, 'error');
      }
    }, 300);
  }
});

// === ЧАТ ===
function startChat() {
  const screen = document.getElementById('chat-screen');
  screen.classList.remove('chat-hidden');
  screen.classList.add('chat-fade-in');
  setTimeout(() => screen.classList.remove('chat-fade-in'), 400);
  
  const log = document.getElementById('chat-log');
  log.innerHTML = `
    <div class="chat-msg system">● Connection established. Protocol: SSL + OTP</div>
    <div class="chat-msg them">CIA_Source has joined #underground</div>
  `;
  
  setTimeout(() => appendChat("CIA_Source: ...", 'them'), 1200);
  setTimeout(() => {
    appendChat("CIA_Source: ну?", 'them');
    gameData.chat.state = 'greeting';
    gameData.chat.messages = [];
    localStorage.setItem('buran4_quest', JSON.stringify(gameData));
  }, 2200);
}

function appendChat(text, type = 'them') {
  const log = document.getElementById('chat-log');
  const div = document.createElement('div');
  div.className = `chat-msg ${type}`;
  div.textContent = type === 'me' ? `Электрон: ${text}` : text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.value.trim()) {
    const msg = e.target.value.trim();
    appendChat(msg, 'me');
    e.target.value = '';
    handleChatCommand(msg);
  }
});

function handleChatCommand(msg) {
  const now = Date.now();
  gameData.chat.messages.push({ role: 'me', text: msg, time: now });
  localStorage.setItem('buran4_quest', JSON.stringify(gameData));

  const dots = setInterval(() => {
    const log = document.getElementById('chat-log');
    const last = log.lastChild;
    if (last && last.textContent.endsWith('...')) {
      last.textContent = last.textContent.slice(0, -3);
    } else {
      appendChat("CIA_Source is typing...", 'system');
    }
  }, 500);

  const delay = 800 + Math.random() * 1200 + Math.min(3000, msg.length * 60);
  setTimeout(() => {
    clearInterval(dots);
    const log = document.getElementById('chat-log');
    if (log.lastChild?.textContent?.includes('typing')) log.removeChild(log.lastChild);
    
    const response = generateResponse(msg);
    const { text, correction } = addTypo(response);
    appendChat(text, 'them');
    if (correction) setTimeout(() => appendChat(correction, 'them'), 1000);
    
    gameData.chat.messages.push({ role: 'them', text: response, time: Date.now() });
    localStorage.setItem('buran4_quest', JSON.stringify(gameData));
    
    // Если координаты переданы — предлагаем отчёт
    if (text.includes('63.0517')) {
      setTimeout(() => {
        appendChat("[СИСТЕМА] Данные получены. Сгенерировать финальный отчёт?", 'system');
        appendChat("Команда: > report", 'system');
      }, 3000);
    }
  }, delay);
}

// === ГЕНЕРАТОР ОТВЕТОВ ===
function addTypo(text) {
  if (Math.random() < 0.25) {
    const typos = [
      { f: 'координаты', t: 'координатыы' },
      { f: 'CIA_Source', t: 'CIA_Sourc~' }
    ];
    const typo = typos[Math.floor(Math.random() * typos.length)];
    const modified = text.replace(typo.f, typo.t);
    return {
      text: modified,
      correction: typo.f === 'CIA_Source' ? "CIA_Source: *sigh* keyboard's dying" : null
    };
  }
  return { text };
}

function generateResponse(msg) {
  msg = msg.toLowerCase();
  const state = gameData.chat.state;
  let trust = 0, suspicion = 0;
  
  gameData.chat.messages.forEach(m => {
    if (m.role === 'me') {
      if (m.text.includes('спасибо')) trust++;
      if (m.text.includes('дорого') || m.text.includes('кто ты')) suspicion++;
    }
  });

  if (state === 'greeting') {
    if (msg.includes('координат') || msg.includes('буран')) {
      gameData.chat.state = 'price_asked';
      return "CIA_Source: 3 BTC. Или 5 — если хочешь *реальные* координаты.";
    }
    return "CIA_Source: я не за здравствуй-пока. Спрашивай или вали.";
  }

  if (state === 'price_asked') {
    if (msg.includes('ок') || msg.includes('да')) {
      gameData.chat.state = 'location_asked';
      return "CIA_Source: три варианта:\n1) Горький Парк\n2) Чернобыль\n3) Байконур\nЦифра. Одна.";
    }
    return "CIA_Source: цена фикс. 3 или 5. Выбирай.";
  }

  if (state === 'location_asked') {
    if (msg.includes('1') || msg.includes('2') || msg.includes('3')) {
      gameData.chat.chosenOption = 1;
      gameData.chat.state = 'done';
      
      const coords = "63.0517°N, 72.1184°E";
      let suffix = "\nБольше ничего не скажу.";
      
      if (trust > 0) {
        suffix = "\nНе трогай красный провод у входа. Он слушает.";
      } else if (suspicion > 0) {
        suffix = "\n*шепчет* Прости. Но приказ — есть приказ.";
      }
      
      return `CIA_Source: ${coords}${suffix}`;
    }
    return "CIA_Source: цифра. От 1 до 3.";
  }

  return "CIA_Source: ... не понял.";
}

// === ФИНАЛЬНЫЙ ОТЧЁТ ===
function generateReport() {
  log('[ГЕНЕРАЦИЯ] ФИНАЛЬНЫЙ ОТЧЁТ ОРДО МЕХАНИКУС...', 'system');
  
  let trust = "СРЕДНИЙ", color = "#ffff00";
  gameData.chat.messages.forEach(m => {
    if (m.role === 'me' && m.text.includes('спасибо')) trust = "ВЫСОКИЙ", color = "#00ff00";
  });

  const script = document.createElement('script');
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  script.onload = () => {
    passportExport.innerHTML = `
      <div id="report" style="width:700px; padding:40px; background:#080a08; color:#ccc; font-family:'Courier New'; border:3px double #555;">
        <div style="text-align:center; margin-bottom:25px;">
          <div style="font-family:'Orbitron', sans-serif; font-size:28px; color:#f33;">ОРДО МЕХАНИКУС</div>
          <div style="font-size:18px; color:#0f0;">ФИНАЛЬНЫЙ ОТЧЁТ</div>
        </div>
        <div style="margin:15px 0; padding:12px; background:#001100; border:1px solid #0a0;">
          <div><b>ОПЕРАТИВНИК:</b> ДАНЯ "ЭЛЕКТРОН" ВОЛКОВ</div>
          <div><b>СТАТУС:</b> <span style="color:${color};">ДОВЕРИЕ: ${trust}</span></div>
          <div><b>САНИТИ:</b> ${gameData.sanity}%</div>
        </div>
        <div style="margin:25px 0; text-align:center;">
          <div style="font-size:22px; color:#0f0;">КООРДИНАТЫ ЦЕЛИ</div>
          <div style="font-family:'Share Tech Mono'; font-size:26px; color:#0ff; letter-spacing:3px;">
            63.0517°N, 72.1184°E
          </div>
        </div>
        <div style="text-align:center; margin-top:40px; font-family:'Orbitron'; color:#f55; font-size:24px;">
          ✠ MACHINA SACRA ✠<br>
          <span style="font-size:16px;">МАШИНА — ИСТИНА</span>
        </div>
      </div>
    `;
    
    html2canvas(document.getElementById('report')).then(canvas => {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      const img = canvas.toDataURL('image/png');
      pdf.addImage(img, 'PNG', 15, 15, 180, 0);
      pdf.save('BURAN4_FINAL_REPORT.pdf');
      passportExport.innerHTML = '';
      log('[УСПЕХ] ОТЧЁТ СОХРАНЁН.', 'system');
    });
  };
  document.head.appendChild(script);
}
