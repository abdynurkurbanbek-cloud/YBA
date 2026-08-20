// ==========================================
// 1. ИНИЦИАЛИЗАЦИЯ И ХРАНИЛИЩЕ ДАННЫХ
// ==========================================

// Курсы валют по умолчанию (к KZT)
let exchangeRates = {
  USD: 450.00,
  EUR: 490.00,
  CNY: 62.00,
  RUB: 5.00,
  KZT: 1.00
};

// Цитаты дня
const quotes = [
  { text: "«Лучший способ предсказать будущее — создать его.»", author: "— Питер Друкер" },
  { text: "«Риск возникает от незнания того, что вы делаете.»", author: "— Уоррен Баффет" },
  { text: "«Быстрые движения и разрушение стереотипов — единственный способ расти.»", author: "— Марк Цукерберг" },
  { text: "«Сложнее всего начать действовать, всё остальное зависит только от упорства.»", author: "— Амелия Эрхарт" }
];
let currentQuoteIndex = 0;

// Загрузка данных из localStorage или базовые значения
let state = {
  isAdmin: false,
  businesses: JSON.parse(localStorage.getItem('yba_businesses')) || [
    {
      id: 1,
      name: "NeoPay Fintech",
      founder: "Арман Сериков",
      phone: "+7 701 111 22 33",
      ask: 50000,
      share: 10,
      monthlyProfit: 15000, // Чистая прибыль компании в месяц ($)
      desc: "Платформа микро-эквайринга для малого бизнеса.",
      status: "approved"
    },
    {
      id: 2,
      name: "EcoLogix Logistics",
      founder: "Данияр Касымов",
      phone: "+7 707 333 44 55",
      ask: 120000,
      share: 15,
      monthlyProfit: 28000,
      desc: "Оптимизация логистических маршрутов с ИИ.",
      status: "approved"
    }
  ],
  applications: JSON.parse(localStorage.getItem('yba_applications')) || [
    {
      id: 101,
      name: "CoffeeCode",
      founder: "Айбек Нурланов",
      phone: "+7 747 888 99 00",
      ask: 25000,
      share: 12,
      desc: "Сеть умных кофе-поинтов самообслуживания."
    }
  ],
  jobs: JSON.parse(localStorage.getItem('yba_jobs')) || [
    { id: 1, businessName: "NeoPay Fintech", title: "Senior Flutter Dev", salary: "1,200,000 ₸" },
    { id: 2, businessName: "EcoLogix Logistics", title: "SMM / Target Specialist", salary: "350,000 ₸" }
  ],
  jobResponses: JSON.parse(localStorage.getItem('yba_job_responses')) || [],
  tenders: JSON.parse(localStorage.getItem('yba_tenders')) || [
    { id: 1, title: "Разработка лендинга для B2B", project: "NeoPay Fintech", budget: "350 000 ₸", status: "active" },
    { id: 2, title: "Настройка контекстной рекламы", project: "EcoLogix Logistics", budget: "200 000 ₸", status: "active" }
  ],
  tenderResponses: JSON.parse(localStorage.getItem('yba_tender_responses')) || [],
  chatMessages: JSON.parse(localStorage.getItem('yba_chat')) || [
    { sender: "Админ", text: "Добро пожаловать в YBA OS! Подавайте заявки на инвестиции и участвуйте в тендерах.", isAdmin: true, time: "10:00" }
  ]
};

// Функция сохранения в localStorage
function saveData() {
  localStorage.setItem('yba_businesses', JSON.stringify(state.businesses));
  localStorage.setItem('yba_applications', JSON.stringify(state.applications));
  localStorage.setItem('yba_jobs', JSON.stringify(state.jobs));
  localStorage.setItem('yba_job_responses', JSON.stringify(state.jobResponses));
  localStorage.setItem('yba_tenders', JSON.stringify(state.tenders));
  localStorage.setItem('yba_tender_responses', JSON.stringify(state.tenderResponses));
  localStorage.setItem('yba_chat', JSON.stringify(state.chatMessages));
}

// ==========================================
// 2. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  runAllCalculations();
  renderMemberLists();
  renderChat();
  fetchRealRates();
  
  // Делаем функции глобальными для вызова из HTML
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.handleLogin = handleLogin;
window.logoutAdmin = logoutAdmin;
window.switchAdminTab = switchAdminTab;
window.nextQuote = nextQuote;
window.runConversion = runConversion;
window.runAllCalculations = runAllCalculations;
window.fetchRealRates = fetchRealRates;
window.submitFounderApp = submitFounderApp;
window.sendChatMessage = sendChatMessage;
window.approveApplication = approveApplication;
window.rejectApplication = rejectApplication;
});

// ==========================================
// 3. АВТОРИЗАЦИЯ И РЕЖИМЫ (MEMBER / ADMIN)
// ==========================================
function openLoginModal() {
  document.getElementById('login-modal').classList.remove('hidden');
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.add('hidden');
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('admin-pass-input').value = '';
}

function handleLogin(event) {
  event.preventDefault();
  const pass = document.getElementById('admin-pass-input').value;
  
  // Пароль: gigaget
  if (pass === 'gigaget') {
    state.isAdmin = true;
    closeLoginModal();
    updateUserInterface();
  } else {
    document.getElementById('login-error').classList.remove('hidden');
  }
}

function logoutAdmin() {
  state.isAdmin = false;
  updateUserInterface();
}

function updateUserInterface() {
  const viewMember = document.getElementById('view-member');
  const viewAdmin = document.getElementById('view-admin');
  const roleBadge = document.getElementById('role-badge');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');

  if (state.isAdmin) {
    viewMember.classList.add('hidden');
    viewAdmin.classList.remove('hidden');
    roleBadge.textContent = "Admin Mode";
    roleBadge.className = "text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase tracking-wider";
    btnLogin.classList.add('hidden');
    btnLogout.classList.remove('hidden');
    
    updateAdminAnalytics();
    renderAdminLists();
    populateBusinessSelect();
  } else {
    viewMember.classList.remove('hidden');
    viewAdmin.classList.add('hidden');
    roleBadge.textContent = "Member Mode";
    roleBadge.className = "text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold uppercase tracking-wider";
    btnLogin.classList.remove('hidden');
    btnLogout.classList.add('hidden');
    
    renderMemberLists();
  }
}

function switchAdminTab(tabName) {
  document.querySelectorAll('.atab-btn').forEach(btn => {
    btn.className = "atab-btn px-4 py-2 font-semibold text-xs rounded-xl text-slate-400 hover:text-white transition";
  });
  document.querySelectorAll('.acontent').forEach(content => {
    content.classList.add('hidden');
  });

  const activeBtn = document.getElementById(`atab-${tabName}`);
  const activeContent = document.getElementById(`acontent-${tabName}`);
  
  if (activeBtn) activeBtn.className = "atab-btn px-4 py-2 font-semibold text-xs rounded-xl bg-slate-800 text-emerald-400 border border-slate-700/50";
  if (activeContent) activeContent.classList.remove('hidden');

  if (tabName === 'metrics') updateAdminAnalytics();
}

// ==========================================
// 4. ДЕТАЛЬНАЯ АНАЛИТИКА И МЕТРИКИ (АДМИН)
// ==========================================
function updateAdminAnalytics() {
  const approvedBusinesses = state.businesses.filter(b => b.status === 'approved');

  let totalInvested = 0;       // Инвестировано
  let totalPostMoney = 0;      // Капитализация
  let totalYbaShareValue = 0;  // Стоимость доли YBA
  let totalMonthlyRevenue = 0; // Ежемесячная прибыль YBA

  const tableBody = document.getElementById('admin-analytics-table-body');
  if (tableBody) tableBody.innerHTML = '';

  if (approvedBusinesses.length === 0) {
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="py-6 text-center text-slate-500">
            В портфеле пока нет активных компаний.
          </td>
        </tr>`;
    }
  } else {
    approvedBusinesses.forEach(biz => {
      const ask = Number(biz.ask) || 0;
      const share = Number(biz.share) || 0;
      const monthlyProfit = Number(biz.monthlyProfit) || 0;

      // Расчет показателей компании
      const postMoney = share > 0 ? (ask / (share / 100)) : 0;
      const ybaShareVal = postMoney * (share / 100);
      const ybaMonthlyProfit = monthlyProfit * (share / 100);

      // Накопление сумм
      totalInvested += ask;
      totalPostMoney += postMoney;
      totalYbaShareValue += ybaShareVal;
      totalMonthlyRevenue += ybaMonthlyProfit;

      // Отрисовка строки таблицы
      if (tableBody) {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/30 transition";
        tr.innerHTML = `
          <td class="py-3 px-3 font-semibold text-white">
            ${biz.name}
            <div class="text-[10px] text-slate-400 font-normal">${biz.founder}</div>
          </td>
          <td class="py-3 px-3 text-amber-400 font-medium">$${ask.toLocaleString()}</td>
          <td class="py-3 px-3 text-indigo-400 font-bold">${share}%</td>
          <td class="py-3 px-3 text-sky-400">$${Math.round(postMoney).toLocaleString()}</td>
          <td class="py-3 px-3 text-emerald-400 font-semibold">$${Math.round(ybaShareVal).toLocaleString()}</td>
          <td class="py-3 px-3 text-right font-bold text-emerald-400">$${Math.round(ybaMonthlyProfit).toLocaleString()} / мес.</td>
        `;
        tableBody.appendChild(tr);
      }
    });
  }

  // Обновление верхних карточек
  document.getElementById('admin-stat-invested').textContent = `$${totalInvested.toLocaleString()}`;
  document.getElementById('admin-stat-capital').textContent = `$${Math.round(totalPostMoney).toLocaleString()}`;
  document.getElementById('admin-stat-share-value').textContent = `$${Math.round(totalYbaShareValue).toLocaleString()}`;
  document.getElementById('admin-stat-monthly-revenue').textContent = `$${Math.round(totalMonthlyRevenue).toLocaleString()}`;
}

// ==========================================
// 5. КАЛЬКУЛЯТОРЫ И ИИ-СОВЕТНИК
// ==========================================
function runAllCalculations() {
  // 1. LTV / CAC
  const cac = parseFloat(document.getElementById('calc-cac').value) || 0;
  const ltv = parseFloat(document.getElementById('calc-ltv').value) || 0;
  const margin = parseFloat(document.getElementById('calc-margin').value) || 0;
  
  const netLtv = ltv * (margin / 100);
  const ratio = cac > 0 ? (netLtv / cac).toFixed(1) : 0;
  document.getElementById('unit-result').textContent = `${ratio}x`;

  // 2. Runway
  const cash = parseFloat(document.getElementById('runway-cash').value) || 0;
  const burn = parseFloat(document.getElementById('runway-burn').value) || 0;
  const runwayMonths = burn > 0 ? (cash / burn).toFixed(1) : 0;
  document.getElementById('runway-result').textContent = `${runwayMonths} мес.`;

  // 3. Valuation (Post-money)
  const invest = parseFloat(document.getElementById('val-investment').value) || 0;
  const equity = parseFloat(document.getElementById('val-equity').value) || 0;
  const postMoney = equity > 0 ? (invest / (equity / 100)) : 0;
  document.getElementById('valuation-result').textContent = `$${Math.round(postMoney).toLocaleString()}`;

  // Генерация совета ИИ
  updateAIAdvisor(ratio, runwayMonths, postMoney);
}

function updateAIAdvisor(ratio, runway, valuation) {
  const output = document.getElementById('ai-advisor-output');
  let advice = [];

  if (ratio < 3) {
    advice.push("⚠️ <b class='text-amber-400'>Низкая окупаемость рекламы (LTV/CAC < 3x):</b> Рекомендуется оптимизировать цену привлечения клиентов или поднять средний чек.");
  } else {
    advice.push("✅ <b class='text-emerald-400'>Отличная юнит-экономика:</b> Соотношение LTV/CAC показывает высокий потенциал масштабирования.");
  }

  if (runway < 6) {
    advice.push("🚨 <b class='text-rose-400'>Критический Runway (< 6 мес):</b> Срочно требуется привлекать инвестиции или снижать ежемесячные расходы (Burn Rate).");
  } else {
    advice.push("👍 <b class='text-sky-400'>Запас прочности в порядке:</b> Денежных средств достаточно для стабильной работы.");
  }

  output.innerHTML = advice.join('<br class="my-1">');
}

// ==========================================
// 6. ЦИТАТЫ И КУРСЫ ВАЛЮТ
// ==========================================
function nextQuote() {
  currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
  document.getElementById('quote-text').textContent = quotes[currentQuoteIndex].text;
  document.getElementById('quote-author').textContent = quotes[currentQuoteIndex].author;
}

function fetchRealRates() {
  runConversion();
}

function runConversion() {
  const amount = parseFloat(document.getElementById('conv-amount').value) || 0;
  const from = document.getElementById('conv-from').value;
  const to = document.getElementById('conv-to').value;

  const inKzt = amount * exchangeRates[from];
  const result = inKzt / exchangeRates[to];

  const symbol = to === 'KZT' ? '₸' : to === 'USD' ? '$' : to === 'EUR' ? '€' : '';
  document.getElementById('conv-result').textContent = `${result.toLocaleString(undefined, {maximumFractionDigits: 2})} ${symbol}`;
}

// ==========================================
// 7. ПОДАЧА ЗАЯВОК И ОДОБРЕНИЕ (DEAL FLOW)
// ==========================================
function submitFounderApp(event) {
  event.preventDefault();
  const name = document.getElementById('app-name').value;
  const founder = document.getElementById('app-founder').value;
  const phone = document.getElementById('app-phone').value;
  const ask = parseFloat(document.getElementById('app-ask').value);
  const share = parseFloat(document.getElementById('app-share').value);
  const desc = document.getElementById('app-desc').value;

  const newApp = {
    id: Date.now(),
    name, founder, phone, ask, share, desc
  };

  state.applications.push(newApp);
  saveData();

  alert('Заявка успешно отправлена администратору YBA!');
  event.target.reset();
}

function approveApplication(appId) {
  const appIndex = state.applications.findIndex(a => a.id === appId);
  if (appIndex !== -1) {
    const app = state.applications[appIndex];
    state.businesses.push({
      id: app.id,
      name: app.name,
      founder: app.founder,
      phone: app.phone,
      ask: app.ask,
      share: app.share,
      monthlyProfit: 10000,
      desc: app.desc,
      status: 'approved'
    });
    state.applications.splice(appIndex, 1);
    saveData();
    updateUserInterface();
  }
}

function rejectApplication(appId) {
  state.applications = state.applications.filter(a => a.id !== appId);
  saveData();
  updateUserInterface();
}

// ==========================================
// 8. ВАКАНСИИ И ОТКЛИКИ
// ==========================================
function populateBusinessSelect() {
  const select = document.getElementById('job-business-select');
  if (!select) return;
  select.innerHTML = '';
  state.businesses.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.name;
    opt.textContent = b.name;
    select.appendChild(opt);
  });
}

function addBusinessJob(event) {
  event.preventDefault();
  const businessName = document.getElementById('job-business-select').value;
  const title = document.getElementById('job-title').value;
  const salary = document.getElementById('job-salary').value;

  state.jobs.push({ id: Date.now(), businessName, title, salary });
  saveData();
  event.target.reset();
  renderAdminLists();
}

function openJobApplyModal(jobId, jobTitle) {
  document.getElementById('job-apply-id').value = jobId;
  document.getElementById('job-modal-title').textContent = jobTitle;
  document.getElementById('job-apply-modal').classList.remove('hidden');
}

function closeJobApplyModal() {
  document.getElementById('job-apply-modal').classList.add('hidden');
}

function submitJobResponse(event) {
  event.preventDefault();
  const jobId = document.getElementById('job-apply-id').value;
  const name = document.getElementById('job-apply-name').value;
  const phone = document.getElementById('job-apply-phone').value;

  const job = state.jobs.find(j => j.id == jobId);

  state.jobResponses.push({
    id: Date.now(),
    jobTitle: job ? job.title : 'Вакансия',
    businessName: job ? job.businessName : '',
    name,
    phone
  });

  saveData();
  closeJobApplyModal();
  alert('Ваш отклик отправлен работодателю!');
  event.target.reset();
}

// ==========================================
// 9. ТЕНДЕРЫ И ИСПОЛНИТЕЛИ
// ==========================================
function addAdminTender(event) {
  event.preventDefault();
  const title = document.getElementById('tender-title').value;
  const project = document.getElementById('tender-project').value;
  const budget = document.getElementById('tender-budget').value;

  state.tenders.push({ id: Date.now(), title, project, budget, status: 'active' });
  saveData();
  event.target.reset();
  renderAdminLists();
}

function openTenderApplyModal(tenderId, tenderTitle) {
  document.getElementById('tender-apply-id').value = tenderId;
  document.getElementById('tender-modal-title').textContent = tenderTitle;
  document.getElementById('tender-apply-modal').classList.remove('hidden');
}

function closeTenderApplyModal() {
  document.getElementById('tender-apply-modal').classList.add('hidden');
}

function submitTenderResponse(event) {
  event.preventDefault();
  const tenderId = document.getElementById('tender-apply-id').value;
  const name = document.getElementById('tender-apply-name').value;
  const phone = document.getElementById('tender-apply-phone').value;
  const offer = document.getElementById('tender-apply-offer').value;

  const tender = state.tenders.find(t => t.id == tenderId);

  state.tenderResponses.push({
    id: Date.now(),
    tenderTitle: tender ? tender.title : 'Тендер',
    name,
    phone,
    offer
  });

  saveData();
  closeTenderApplyModal();
  alert('Заявка на тендер принята!');
  event.target.reset();
}

function clearCompletedTenders() {
  state.tenders = state.tenders.filter(t => t.status !== 'completed');
  saveData();
  renderAdminLists();
}

// ==========================================
// 10. ЧАТ С АДМИНОМ
// ==========================================
function sendChatMessage(isAdminMsg) {
  const inputId = isAdminMsg ? 'chat-input-admin' : 'chat-input-member';
  const input = document.getElementById(inputId);
  const text = input.value.trim();

  if (!text) return;

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  state.chatMessages.push({
    sender: isAdminMsg ? 'Админ' : 'Участник',
    text,
    isAdmin: isAdminMsg,
    time: timeStr
  });

  saveData();
  input.value = '';
  renderChat();
}

function renderChat() {
  const containers = [document.getElementById('chat-box-member'), document.getElementById('chat-box-admin')];

  containers.forEach(box => {
    if (!box) return;
    box.innerHTML = '';
    state.chatMessages.forEach(msg => {
      const div = document.createElement('div');
      div.className = `p-2.5 rounded-xl max-w-[85%] ${
        msg.isAdmin 
          ? 'bg-emerald-950/40 border border-emerald-500/20 ml-auto text-right' 
          : 'bg-slate-900 border border-slate-800 mr-auto'
      }`;
      div.innerHTML = `
        <div class="text-[10px] font-bold ${msg.isAdmin ? 'text-emerald-400' : 'text-indigo-400'} mb-0.5">
          ${msg.sender} <span class="text-slate-500 font-normal ml-1">${msg.time}</span>
        </div>
        <div class="text-slate-200 text-xs">${msg.text}</div>
      `;
      box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
  });
}

// ==========================================
// 11. ОТРИСОВКА СПИСКОВ (MEMBER / ADMIN)
// ==========================================
function renderMemberLists() {
  const jobsList = document.getElementById('member-jobs-list');
  if (jobsList) {
    jobsList.innerHTML = state.jobs.map(j => `
      <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
        <div>
          <h4 class="font-bold text-white text-xs">${j.title}</h4>
          <p class="text-[11px] text-slate-400">${j.businessName} • <span class="text-emerald-400">${j.salary}</span></p>
        </div>
        <button onclick="openJobApplyModal(${j.id}, '${j.title}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition">
          Откликнуться
        </button>
      </div>
    `).join('');
  }

  const tendersList = document.getElementById('member-tenders-list');
  if (tendersList) {
    tendersList.innerHTML = state.tenders.map(t => `
      <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
        <div>
          <h4 class="font-bold text-white text-xs">${t.title}</h4>
          <p class="text-[11px] text-slate-400">${t.project} • <span class="text-amber-400">${t.budget}</span></p>
        </div>
        <button onclick="openTenderApplyModal(${t.id}, '${t.title}')" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition">
          Взять тендер
        </button>
      </div>
    `).join('');
  }
}

function renderAdminLists() {
  const dfList = document.getElementById('admin-dealflow-list');
  if (dfList) {
    if (state.applications.length === 0) {
      dfList.innerHTML = `<p class="text-xs text-slate-500 py-4">Нет новых заявок.</p>`;
    } else {
      dfList.innerHTML = state.applications.map(a => `
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
          <div>
            <h4 class="font-bold text-white text-xs">${a.name} <span class="text-slate-400 font-normal">(${a.founder})</span></h4>
            <p class="text-[11px] text-slate-400 mt-0.5">${a.desc}</p>
            <p class="text-[11px] text-indigo-400 font-semibold mt-1">Запрос: $${a.ask.toLocaleString()} за ${a.share}% • Тел: ${a.phone}</p>
          </div>
          <div class="flex space-x-2">
            <button onclick="approveApplication(${a.id})" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg">Принять</button>
            <button onclick="rejectApplication(${a.id})" class="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-semibold rounded-lg">Отклонить</button>
          </div>
        </div>
      `).join('');
    }
  }

  const bizList = document.getElementById('admin-businesses-list');
  if (bizList) {
    bizList.innerHTML = state.businesses.map(b => `
      <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
        <div class="flex justify-between items-start">
          <h4 class="font-bold text-white text-xs">${b.name}</h4>
          <span class="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">Активен</span>
        </div>
        <p class="text-[11px] text-slate-400">${b.desc}</p>
        <div class="text-[11px] text-slate-300 font-medium">
          Инвестиции: <span class="text-amber-400">$${b.ask.toLocaleString()}</span> | Доля YBA: <span class="text-indigo-400">${b.share}%</span>
        </div>
      </div>
    `).join('');
  }

  const adminJobs = document.getElementById('admin-jobs-list');
  if (adminJobs) {
    adminJobs.innerHTML = state.jobs.map(j => `
      <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <div class="font-bold text-white">${j.title}</div>
        <div class="text-slate-400">${j.businessName} • ${j.salary}</div>
      </div>
    `).join('');
  }

  const jobResp = document.getElementById('admin-job-responses-list');
  if (jobResp) {
    jobResp.innerHTML = state.jobResponses.map(r => `
      <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
        <div class="font-bold text-emerald-400">${r.name} (${r.phone})</div>
        <div class="text-slate-300">Отклик на: <b>${r.jobTitle}</b> (${r.businessName})</div>
      </div>
    `).join('');
  }

  const adminTenders = document.getElementById('admin-tenders-list');
  if (adminTenders) {
    adminTenders.innerHTML = state.tenders.map(t => `
      <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <div class="font-bold text-white">${t.title}</div>
        <div class="text-slate-400">${t.project} • ${t.budget}</div>
      </div>
    `).join('');
  }

  const tenderResp = document.getElementById('admin-tender-responses-list');
  if (tenderResp) {
    tenderResp.innerHTML = state.tenderResponses.map(r => `
      <div class="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
        <div class="font-bold text-amber-400">${r.name} (${r.phone})</div>
        <div class="text-slate-300">Предложение: ${r.offer}</div>
      </div>
    `).join('');
  }
}
