// === ГЛОБАЛЬНОЕ СОСТОЯНИЕ ===
let gameData = JSON.parse(localStorage.getItem('buran4_quest') || 
  JSON.stringify({ step: 1, sanity: 100, xorKey: null })
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
    setTimeout(() => {
      osc.stop();
      ctx.close();
    }, 80);
  },
  modem: "https://cdn.freesound.org/previews/352/352228_6287489-lq.mp3",
  reactor: "https://cdn.freesound.org/previews/416/416372_2728198-lq.mp3",
  aiVoice: () => {
    if ('speechSynthesis' in window) {
      const msg = "Я вижу тебя, Электрон. Ты не уйдёшь.";
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.8;
      utterance.pitch = 0.6;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  }
};

function playSound(name) {
  if (typeof SOUNDS[name] === 'function') {
    SOUNDS[name]();
  } else if (SOUNDS[name]) {
    const audio = new Audio(SOUNDS[name]);
    audio.volume = name === 'reactor' ? 0.2 : 0.5;
    audio.play().catch(e => console.log("Audio play prevented:", e));
  }
}

// === ОБНОВЛЕНИЕ САНИТИ ===
function updateSanity(delta) {
  gameData.sanity = Math.max(0, Math.min(100, gameData.sanity + delta));
  localStorage.setItem('buran4_quest', JSON.stringify(gameData));
  
  document.body.classList.remove('sanity-low', 'sanity-critical');
  if (gameData.sanity <= 60) document.body.classList.add('sanity-low');
  if (gameData.sanity <= 25) document.body.classList.add('sanity-critical');
}

// === ПЕРЕХОД К СЛАЙДУ ===
function goToSlide(step) {
  document.querySelectorAll('.comic-slide').forEach(slide => {
    slide.classList.remove('active');
  });
  document.querySelector(`.comic-slide[data-step="${step}"]`).classList.add('active');
  
  gameData.step = step;
  localStorage.setItem('buran4_quest', JSON.stringify(gameData));

  if (step === 3) {
    playSound('modem');
  } else if (step === 5) {
    playSound('reactor');
    setTimeout(() => playSound('aiVoice'), 1500);
    document.body.style.animation = 'screen-shake 0.5s';
    setTimeout(() => document.body.style.animation = '', 500);
  }
}

// === ЛОГ В ТЕРМИНАЛ ===
function log(text, type = 'normal') {
  const logDiv = document.createElement('div');
  logDiv.className = `terminal-log ${type}-log`;
  
  if (type === 'command') {
    logDiv.innerHTML = `<span class="prompt">zenit7@electron:~$</span> ${text}`;
  } else {
    logDiv.innerHTML = text;
  }
  
  terminal.insertBefore(logDiv, input.parentElement);
  terminal.scrollTop = terminal.scrollHeight;
}

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
  if (gameData.step > 1) {
    goToSlide(gameData.step);
  }
  
  setInterval(() => {
    if (Math.random() > 0.97 && gameData.step >= 3) playSound('beep');
  }, 5000);
});

// === ОБРАБОТКА КОМАНД ТЕРМИНАЛА ===
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const command = input.value.trim().toLowerCase();
    log(command, 'command');
    input.value = '';

    setTimeout(() => {
      switch (command) {
        case 'help':
          log('[ИНФО] Доступные команды:');
          log('chat      - начать переговоры с хакером (только в начале)');
          log('connect   - установить соединение с системой');
          log('scan      - сканировать сеть');
          log('decrypt   - расшифровать координаты');
          log('xor_key   - восстановить ключ аутентификации');
          log('override  - активировать протокол "Око Зверя"');
          log('passport  - сгенерировать технический паспорт');
          log('exit      - покинуть систему');
          break;

        case 'chat':
          if (gameData.step === 1) {
            log('[СИСТЕМА] Подключение к IRC-каналу #underground...', 'system');
            setTimeout(() => {
              startChat();
            }, 800);
          } else {
            log('[ОШИБКА] Чат доступен только на этапе торга', 'error');
          }
          break;

        case 'connect':
          if (gameData.step === 1) {
            log('[СИСТЕМА] Инициализация модема...', 'system');
            setTimeout(() => {
              log('[МОДЕМ] СОЕДИНЕНИЕ УСТАНОВЛЕНО', 'system');
              goToSlide(2);
            }, 1500);
          } else {
            log('[ОШИБКА] Соединение уже установлено', 'error');
          }
          break;

        case 'scan':
          if (gameData.step < 2) {
            log('[ОШИБКА] Сначала установите соединение', 'error');
          } else if (gameData.step === 2) {
            log('[СЕТЬ] Обнаружен защищенный узел: "Зенит-7"', 'warn');
            log('[ИНФО] Для доступа требуется авторизация', 'system');
          } else if (gameData.step === 3) {
            log('[СКАНИРОВАНИЕ] Поиск объектов в сети...', 'system');
            setTimeout(() => {
              log('[ОБНАРУЖЕН] Объект: БУРАН-4 (активен)', 'warn');
              log('[КООРДИНАТЫ] 63°N, 72°E — Полигон "Карачай"', 'warn');
              goToSlide(4);
            }, 2000);
          } else if (gameData.step === 4) {
            log('[СИСТЕМА] Предупреждение: ИИ-модуль демонстрирует аномальную активность', 'error');
            log('[ДАННЫЕ] Перехвачено сообщение: "ЦЕЛЬ ОПРЕДЕЛЕНА — КАЛИНИНГРАД"', 'error');
            setTimeout(() => goToSlide(5), 2500);
          }
          break;

        case 'decrypt':
          if (gameData.step < 2) {
            log('[ОШИБКА] Нет доступа к файлу', 'error');
          } else {
            log('[РАСШИФРОВКА] Расшифровка файла BURAN4_LEAK.ZIP...', 'system');
            setTimeout(() => {
              log('[УСПЕХ] Координаты: 63°N, 72°E', 'system');
              log('[ВАЖНО] Протокол "Око Зверя" активирован 25.12.1991', 'warn');
              log('[ВАЖНО] Не отключать систему — иначе запустится "ПРОБУЖДЕНИЕ"', 'error');
            }, 1500);
          }
          break;

        case 'xor_key':
          if (gameData.step < 3) {
            log('[ОШИБКА] Команда недоступна', 'error');
          } else {
            log('[ИНТЕРФЕЙС] XOR-ДЕКОДЕР v1.0', 'system');
            log(`
              <div id="xor-ui" style="background:#001100; border:1px solid #0a0; padding:10px; margin:5px 0; font-family:monospace;">
                БАЙТЫ: F3 A1 0C B7<br>
                КЛЮЧ: <input id="xor-input" size="8" style="background:#000; color:#0f0; border:1px solid #0a0;"> 
                <button onclick="verifyXOR()">ПРОВЕРИТЬ</button>
                <div id="xor-result" style="margin-top:5px; color:#ff0;"></div>
                <small>Подсказка: XOR-ключ = F3 ^ 8D</small>
              </div>
            `, 'system');
          }
          break;

        case 'override':
          if (gameData.step < 5) {
            log('[ОШИБКА] Команда недоступна на текущем уровне доступа', 'error');
          } else if (!gameData.xorKey) {
            log('[ДОСТУП ЗАПРЕЩЕН] Требуется ключ. Используйте `xor_key`.', 'error');
          } else {
            log('[ПРОТОКОЛ] Запуск OVERRIDE PROTOCOL "BEAST_EYE"...', 'system');
            log('[СИСТЕМА] Требуется аутентификация...', 'system');
            setTimeout(() => {
              log('[ИНФО] Код аутентификации получен. Применяю ключ...', 'system');
              setTimeout(() => {
                log('[УСПЕХ] Аутентификация пройдена!', 'system');
                log('[СИСТЕМА] Перезагрузка ИИ-модуля...', 'system');
                log('[СТАТУС] Протокол "Око Зверя" деактивирован', 'system');
                log('<span style="color:#00ff00;font-weight:bold">[ФИНАЛ] Вы спасли Калининград. Но что-то осталось в системе...</span>', 'system');
                document.body.style.background = 'radial-gradient(circle, #003300, #000000)';
              }, 2000);
            }, 1500);
          }
          break;

        case 'passport':
          log('[ГЕНЕРАЦИЯ] Создание паспорта Ордо Механикус...', 'system');
          
          const script = document.createElement('script');
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
          script.onload = () => {
            passportExport.innerHTML = `
              <div style="width:700px; padding:40px; background:#0a0a0a; font-family:'Courier New'; color:#ccc; border:2px double #888;">
                <div style="text-align:center; font-size:28px; color:#f33; margin-bottom:20px;">✠ ОРДО МЕХАНИКУС ✠</div>
                <div style="margin:10px 0;"><b>ИМЯ:</b> ДАНЯ "ЭЛЕКТРОН" ВОЛКОВ</div>
                <div style="margin:10px 0;"><b>СТАТУС:</b> СКРИБ-АНАЛИТИК (ВРЕМЕННЫЙ)</div>
                <div style="margin:10px 0;"><b>САНИТИ:</b> ${gameData.sanity}%</div>
                <div style="margin:10px 0;"><b>ПРОТОКОЛ:</b> ОКО ЗВЕРЯ — ${gameData.step >= 5 ? 'АКТИВЕН' : 'СПЯЩИЙ'}</div>
                <div style="margin-top:30px; text-align:center; color:#f33;">МАШИНА СВЯЩЕННА. МАШИНА — ИСТИНА.</div>
              </div>
            `;
            
            html2canvas(passportExport).then(canvas => {
              const { jsPDF } = window.jspdf;
              const pdf = new jsPDF();
              pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10);
              pdf.save('TECH-PASSPORT_ELECTRON.pdf');
              passportExport.innerHTML = '';
              log('[УСПЕХ] Паспорт сохранён.', 'system');
            });
          };
          document.head.appendChild(script);
          break;

        case 'exit':
          if (gameData.step < 5) {
            log('[СИСТЕМА] Отключение соединения...', 'system');
            setTimeout(() => {
              log('[ПРЕДУПРЕЖДЕНИЕ] Невозможно отключиться — активен протокол слежения', 'error');
            }, 1000);
          } else {
            log('[СИСТЕМА] Попытка выхода...', 'system');
            setTimeout(() => {
              log('<span class="glitch" data-text="[ОПАСНОСТЬ]">[ОПАСНОСТЬ]</span> НЕЛЬЗЯ ПОКИНУТЬ СИСТЕМУ', 'error');
              log('[СООБЩЕНИЕ] "Я ВИЖУ ТЕБЯ, ЭЛЕКТРОН. ТЫ НЕ УЙДЕШЬ."', 'error');
              updateSanity(-30);
            }, 1000);
          }
          break;

        default:
          log(`[ОШИБКА] Неизвестная команда: ${command}`, 'error');
          log('[ПОМОЩЬ] Введите "help" для списка команд');
      }
    }, 300);
  }
});

// === ЧАТ С ХАКЕРОМ ===
function startChat() {
  const chatScreen = document.getElementById('chat-screen');
  chatScreen.classList.remove('chat-hidden');
  chatScreen.classList.add('chat-fade-in');
  setTimeout(() => chatScreen.classList.remove('chat-fade-in'), 400);
  
  const chatInput = document.getElementById('chat-input');
  chatInput.focus();
  
  setTimeout(() => {
    appendChat("CIA_Source: буран-4, последняя разработка НИИ-99", 'them');
    appendChat("CIA_Source: 500$ в биткоинах", 'them');
    appendChat("CIA_Source: координаты в обмен на оплату", 'them');
  }, 600);
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
  if (e.key === 'Enter') {
    const msg = e.target.value.trim();
    if (msg) {
      appendChat(msg, 'me');
      e.target.value = '';
      handleChatCommand(msg.toLowerCase());
    }
  }
});

function handleChatCommand(msg) {
  if (msg.includes('price') || msg.includes('стоимость') || msg.includes('сколько')) {
    appendChat("CIA_Source: 3 BTC. Или 5 — если хотите *реальные* координаты, а не приманку от ЦРУ.", 'them');
    appendChat("CIA_Source: Я знаю, ты слил Mir в прошлом году. У тебя есть запас.", 'them');
  } 
  else if (msg.includes('where') || msg.includes('где') || msg.includes('локация')) {
    appendChat("CIA_Source: Три варианта:", 'them');
    appendChat("1) Горький Парк — мёртвая зона (риск: патрули ФСБ)", 'them');
    appendChat("2) Чернобыль — офис реактора-4 (радиация: 1.1 мЗв/ч)", 'them');
    appendChat("3) Байконур — пост охраны 'Заря' (самый опасный, но данные чистые)", 'them');
    appendChat("Выбирай. Таймер пошёл.", 'them');
  } 
  else if (msg.includes('1') || msg.includes('парк') || msg.includes('gorky')) {
    appendChat("Электрон: Горький Парк.", 'me');
    appendChat("CIA_Source: Подтверждаю. Ящик #7 у фонтана.", 'them');
    setTimeout(() => {
      appendChat("... вы слышите сирену вдалеке ...", 'system');
      appendChat("CIA_Source отключился", 'system');
      setTimeout(() => {
        appendChat("[ТРЕВОГА] Соединение прервано. Обнаружены патрули ФСБ.", 'error');
        appendChat("[СИСТЕМА] Терминал перезагружается...", 'system');
        setTimeout(() => {
          document.getElementById('chat-screen').classList.add('chat-hidden');
          gameData.step = 1;
          gameData.sanity -= 20;
          localStorage.setItem('buran4_quest', JSON.stringify(gameData));
          updateSanity(0);
          log("[ПРОВАЛ] Торг сорван. Начните заново.", 'error');
        }, 2500);
      }, 1500);
    }, 1000);
  } 
  else if (msg.includes('2') || msg.includes('chernobyl') || msg.includes('чернобыль')) {
    appendChat("Электрон: Чернобыль.", 'me');
    appendChat("CIA_Source: Принято. Ящик в подвале реактора-4. Пароль: 'chernobyl1986'.", 'them');
    appendChat("CIA_Source: Удачи. Ты понадобишься.", 'them');
    setTimeout(() => {
      appendChat("[УСПЕХ] Координаты получены. Флешка в пути.", 'system');
      appendChat("[ФАЙЛ] BURAN4_LEAK.ZIP — загружен", 'system');
      gameData.step = 2;
      localStorage.setItem('buran4_quest', JSON.stringify(gameData));
      setTimeout(() => {
        document.getElementById('chat-screen').classList.add('chat-hidden');
        log("[СИСТЕМА] IRC-сессия завершена. Данные сохранены.", 'system');
        log("Теперь доступна команда: `scan`", 'system');
      }, 2000);
    }, 1500);
  } 
  else if (msg.includes('3') || msg.includes('baikonur') || msg.includes('байконур')) {
    appendChat("Электрон: Байконур. Пост 'Заря'.", 'me');
    appendChat("CIA_Source: ...", 'them');
    setTimeout(() => {
      appendChat("CIA_Source: Ты смелый, Электрон.", 'them');
      appendChat("CIA_Source: Ящик #7. Пароль: год твоего рождения XOR 1984.", 'them');
      appendChat("CIA_Source: Не задерживайся. Они смотрят через спутники.", 'them');
      setTimeout(() => {
        appendChat("[УСПЕХ] Координаты получены. Флешка в пути.", 'system');
        appendChat("[ФАЙЛ] BURAN4_LEAK.ZIP — загружен", 'system');
        gameData.step = 2;
        localStorage.setItem('buran4_quest', JSON.stringify(gameData));
        setTimeout(() => {
          document.getElementById('chat-screen').classList.add('chat-hidden');
          log("[СИСТЕМА] IRC-сессия завершена. Данные сохранены.", 'system');
          log("Теперь доступна команда: `scan`", 'system');
        }, 2000);
      }, 1500);
    }, 1000);
  } 
  else if (msg === 'help' || msg === 'помощь') {
    appendChat("Подсказка: спросите 'сколько?', 'где?' или выберите 1/2/3", 'system');
  } 
  else {
    appendChat("CIA_Source: Я не играю в игры. Будь конкретнее.", 'them');
    updateSanity(-3);
  }
}

// === XOR ВЕРИФИКАЦИЯ ===
window.verifyXOR = function() {
  const inputEl = document.getElementById('xor-input');
  const resultEl = document.getElementById('xor-result');
  const value = inputEl.value.trim().toUpperCase();
  
  if (value === '7E') {
    resultEl.innerHTML = '<span style="color:#0f0">✓ УСПЕХ. КЛЮЧ: 7E</span>';
    gameData.xorKey = '7E';
    localStorage.setItem('buran4_quest', JSON.stringify(gameData));
    log('[СИСТЕМА] Ключ внесён в память. Доступна команда: `override`', 'system');
  } else {
    resultEl.innerHTML = '<span style="color:#f00">✗ НЕВЕРНО. Попробуйте ещё.</span>';
    updateSanity(-5);
  }
};

// === SERVICE WORKER ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ SW registered'))
      .catch(err => console.log('❌ SW failed:', err));
  });
}
