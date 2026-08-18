// Демо-пароль для входа в кабинет инвестора
const ADMIN_PASSWORD = "admin";

// Состояние системы
let isAdminAuthenticated = false;

const globalData = {
  dealFlow: [
    { id: 1, name: "EcoPack Tech", founder: "Иван Смирнов", ask: "$50,000", share: "10%", status: "pending", desc: "Биоразлагаемая упаковка для e-commerce." },
    { id: 2, name: "NeuroSales AI", founder: "Анна Громова", ask: "$120,000", share: "15%", status: "pending", desc: "AI-ассистент для холодных продаж." }
  ],
  messages: [
    { id: 1, sender: "Алексей (EdTrack AI)", text: "Добрый день! Подготовили обновленный финансовый отчет за Q2.", time: "10 минут назад" }
  ]
};

// === УПРАВЛЕНИЕ АВТОРИЗАЦИЕЙ И ОТОБРАЖЕНИЕМ ===
function openLoginModal() {
  document.getElementById('login-modal').classList.remove('hidden');
  document.getElementById('admin-pass-input').focus();
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.add('hidden');
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('admin-pass-input').value = '';
}

function handleLogin(e) {
  e.preventDefault();
  const inputPass = document.getElementById('admin-pass-input').value;

  if (inputPass === ADMIN_PASSWORD) {
    isAdminAuthenticated = true;
    closeLoginModal();
    showAdminDashboard();
  } else {
    document.getElementById('login-error').classList.remove('hidden');
  }
}

function showAdminDashboard() {
  document.getElementById('view-member').classList.add('hidden');
  document.getElementById('view-admin').classList.remove('hidden');
  
  document.getElementById('btn-login').classList.add('hidden');
  document.getElementById('btn-logout').classList.remove('hidden');

  const badge = document.getElementById('role-badge');
  badge.textContent = 'Investor Mode';
  badge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium';

  renderAdminDealflow();
  renderAdminMessages();
}

function logoutAdmin() {
  isAdminAuthenticated = false;
  document.getElementById('view-admin').classList.add('hidden');
  document.getElementById('view-member').classList.remove('hidden');

  document.getElementById('btn-logout').classList.add('hidden');
  document.getElementById('btn-login').classList.remove('hidden');

  const badge = document.getElementById('role-badge');
  badge.textContent = 'Founder Mode';
  badge.className = 'text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium';
}

// === ЛОГИКА АДМИНА ===
function switchAdminTab(tabId) {
  document.querySelectorAll('.acontent').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.atab-btn').forEach(el => {
    el.classList.remove('bg-slate-800', 'text-emerald-400');
    el.classList.add('text-slate-400');
  });

  document.getElementById('acontent-' + tabId).classList.remove('hidden');
  document.getElementById('atab-' + tabId).classList.add('bg-slate-800', 'text-emerald-400');
}

function renderAdminDealflow() {
  const container = document.getElementById('admin-dealflow-list');
  const filter = document.getElementById('dealflow-filter').value;
  container.innerHTML = '';

  const items = globalData.dealFlow.filter(d => filter === 'all' || d.status === filter);

  if (items.length === 0) {
    container.innerHTML = '<div class="text-xs text-slate-500 p-4">Нет заявок по данному фильтру.</div>';
    return;
  }

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = "p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between";
    card.innerHTML = `
      <div>
        <div class="flex items-center space-x-2">
          <h4 class="text-sm font-semibold text-white">${item.name}</h4>
          <span class="text-[10px] px-2 py-0.5 rounded ${item.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}">${item.status}</span>
        </div>
        <p class="text-xs text-slate-400 mt-1">Фаундер: ${item.founder} | Запрос: ${item.ask} за ${item.share}</p>
        <p class="text-xs text-slate-300 mt-1">${item.desc}</p>
      </div>
      ${item.status === 'pending' ? `
        <div class="flex space-x-2">
          <button onclick="changeStatus(${item.id}, 'approved')" class="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-semibold">Одобрить</button>
          <button onclick="changeStatus(${item.id}, 'rejected')" class="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs">Отклонить</button>
        </div>
      ` : ''}
    `;
    container.appendChild(card);
  });
}

function changeStatus(id, newStatus) {
  const target = globalData.dealFlow.find(item => item.id === id);
  if (target) {
    target.status = newStatus;
    renderAdminDealflow();
  }
}

function renderAdminMessages() {
  const container = document.getElementById('admin-messages-list');
  container.innerHTML = '';
  globalData.messages.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs';
    div.innerHTML = `<div class="flex justify-between font-medium text-white mb-1"><span>${msg.sender}</span><span class="text-slate-500">${msg.time}</span></div><p class="text-slate-300">${msg.text}</p>`;
    container.appendChild(div);
  });
}

// === ЛОГИКА УЧАСТНИКА (FOUNDER) ===
function calcUnit() {
  const cac = parseFloat(document.getElementById('calc-cac').value) || 0;
  const ltv = parseFloat(document.getElementById('calc-ltv').value) || 0;
  const margin = parseFloat(document.getElementById('calc-margin').value) || 0;
  if (cac === 0) return;
  const ratio = ((ltv * (margin / 100)) / cac).toFixed(1);
  const el = document.getElementById('unit-result');
  el.textContent = `${ratio}x (${ratio >= 3 ? 'Отличный показатель' : 'Требует доработки'})`;
  el.className = ratio >= 3 ? 'font-bold text-emerald-400' : 'font-bold text-amber-400';
}

let timerInt = null;
let seconds = 180;
function toggleTimer() {
  const btn = document.getElementById('timer-btn');
  if (timerInt) {
    clearInterval(timerInt);
    timerInt = null;
    btn.textContent = "Старт";
  } else {
    btn.textContent = "Пауза";
    timerInt = setInterval(() => {
      if (seconds <= 0) { clearInterval(timerInt); return; }
      seconds--;
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      document.getElementById('timer-display').textContent = `${m}:${s}`;
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInt);
  timerInt = null;
  seconds = 180;
  document.getElementById('timer-display').textContent = "03:00";
  document.getElementById('timer-btn').textContent = "Старт";
}

function genHook() {
  const hooks = [
    "Как мы увеличили LTV на 140% с помощью одной гипотезы...",
    "Почему 90% B2B клиентов уходят, и как наш продукт это решает...",
    "Автоматизация продаж: как закрывать сделки в 2 раза быстрее..."
  ];
  document.getElementById('hook-output').textContent = `"${hooks[Math.floor(Math.random() * hooks.length)]}"`;
}

function submitFounderApp(e) {
  e.preventDefault();
  const name = document.getElementById('app-name').value;
  const ask = document.getElementById('app-ask').value;
  const share = document.getElementById('app-share').value;
  const desc = document.getElementById('app-desc').value;

  const newApp = {
    id: Date.now(),
    name: name,
    founder: "Текущий Фаундер",
    ask: `$${ask}`,
    share: `${share}%`,
    status: "pending",
    desc: desc
  };

  globalData.dealFlow.push(newApp);
  alert("Заявка успешно отправлена инвесторам!");
  updateFounderStatus();
}

function updateFounderStatus() {
  const myApp = globalData.dealFlow[globalData.dealFlow.length - 1];
  if (myApp) {
    document.getElementById('founder-status-badge').textContent = myApp.status.toUpperCase();
    document.getElementById('founder-status-desc').textContent = `Проект: ${myApp.name} (${myApp.ask})`;
  }
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  if (!input.value.trim()) return;

  globalData.messages.push({
    id: Date.now(),
    sender: "Вы (Founder)",
    text: input.value,
    time: "Только что"
  });

  input.value = '';
  renderChat();
}

function renderChat() {
  const box = document.getElementById('chat-box');
  box.innerHTML = '';
  globalData.messages.forEach(m => {
    const msg = document.createElement('div');
    msg.className = "p-2 rounded bg-slate-900 border border-slate-800 text-slate-300";
    msg.innerHTML = `<strong class="text-white">${m.sender}:</strong> ${m.text}`;
    box.appendChild(msg);
  });
  box.scrollTop = box.scrollHeight;
}

// Старт по умолчанию с экрана Участника
updateFounderStatus();
renderChat();
