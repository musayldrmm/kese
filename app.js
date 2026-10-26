/* =========================================================
   Kese — borç ve ödeme takibi
   Tek dosyalık, çevrimdışı, yerel veri uygulaması.
   ========================================================= */

(() => {
  "use strict";

  const STORAGE_KEY = "kese.data.v1";
  const SETTINGS_KEY = "kese.settings.v1";
  const NOTIFY_LOG_KEY = "kese.notifyLog.v1";
  const APP_VERSION = "1.1.0";
  const SCHEMA_VERSION = 2;
  const NOTIFICATION_CHECK_MS = 60 * 1000;
  const CALENDAR_MONTHS = 12;

  const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  const WEEKDAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

  const ACCENT_KEYS = ["mint", "amber", "coral", "sky", "violet", "rose"];
  const ACCENT_LABELS = {
    mint: "Mint yeşili",
    amber: "Amber",
    coral: "Mercan",
    sky: "Gökyüzü",
    violet: "Lila",
    rose: "Gül"
  };

  const CATEGORIES = {
    kira: { label: "Kira", icon: "home", accent: "mint" },
    fatura: { label: "Fatura", icon: "receipt", accent: "amber" },
    abonelik: { label: "Abonelik", icon: "repeat", accent: "violet" },
    diger: { label: "Diğer", icon: "grid", accent: "sky" }
  };

  const FREQS = {
    monthly: { label: "Her ay", short: "Aylık", months: 1 },
    quarterly: { label: "3 ayda bir", short: "3 aylık", months: 3 },
    yearly: { label: "Her yıl", short: "Yıllık", months: 12 },
    weekly: { label: "Her hafta", short: "Haftalık", months: 0 }
  };

  const ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    check: '<path d="m5 12 4.6 4.6L19 7"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.2 12 2.6 2.6 5.2-5.6"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16" rx="3.5"/><path d="M8 2.5v4M16 2.5v4M3 9.5h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 1.9"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="3.5"/><path d="M2.5 9.6h19M6.2 15h3.1"/>',
    layers: '<path d="m12 3 9 4.7-9 4.7-9-4.7L12 3Z"/><path d="m3 12.1 9 4.7 9-4.7"/><path d="m3 16.4 9 4.7 9-4.7"/>',
    repeat: '<path d="M17.2 2.8 21 6.6l-3.8 3.8"/><path d="M3 11.2V9.4A2.8 2.8 0 0 1 5.8 6.6H21"/><path d="m6.8 21.2-3.8-3.8 3.8-3.8"/><path d="M21 12.8v1.8a2.8 2.8 0 0 1-2.8 2.8H3"/>',
    home: '<path d="m3.5 10.8 8.5-7 8.5 7"/><path d="M5.5 9.3v10.2h13V9.3"/><path d="M9.5 19.5v-6h5v6"/>',
    receipt: '<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4L10 21l-2-1.4L6 21V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    grid: '<circle cx="6" cy="6" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="6" r="1.7" fill="currentColor" stroke="none"/><circle cx="18" cy="6" r="1.7" fill="currentColor" stroke="none"/><circle cx="6" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="6" cy="18" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="18" r="1.7" fill="currentColor" stroke="none"/><circle cx="18" cy="18" r="1.7" fill="currentColor" stroke="none"/>',
    wallet: '<path d="M4.5 7.6A2.6 2.6 0 0 1 7.1 5h9.2a2.2 2.2 0 0 1 2.2 2.2v.9"/><rect x="2.8" y="7.3" width="18.4" height="12.1" rx="3.6"/><path d="M15.8 11.6h5.4v3.9h-5.4a2 2 0 0 1 0-3.9Z"/>',
    alert: '<path d="M12 3.2 2.9 20h18.2L12 3.2Z"/><path d="M12 9v4.7M12 17.1v.1"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8v.2"/>',
    shield: '<path d="M12 3 5 5.8v5.4c0 4.4 2.8 7.5 7 9.8 4.2-2.3 7-5.4 7-9.8V5.8L12 3Z"/><path d="m8.5 11.8 2.4 2.4 4.6-4.9"/>',
    lock: '<rect x="4.5" y="10" width="15" height="11" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
    download: '<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5"/><path d="M4 19.5h16"/>',
    upload: '<path d="M12 16V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 19.5h16"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6.5 7l.8 13h9.4l.8-13"/><path d="M10 11v5M14 11v5"/>',
    pencil: '<path d="M4 20h4.3L20 8.3a2.3 2.3 0 0 0-3.3-3.3L5 16.7V20Z"/><path d="m14.8 6.8 2.4 2.4"/>',
    arrowRight: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    sparkles: '<path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/>',
    battery: '<rect x="2.5" y="7" width="17" height="10" rx="2.5"/><path d="M22 10.5v3"/><path d="M6 10.5v3M9.5 10.5v3"/>',
    bell: '<path d="M18 8.5a6 6 0 1 0-12 0c0 4.2-1.4 5.7-2.2 6.6-.4.4-.1 1.1.5 1.1h15.4c.6 0 .9-.7.5-1.1-.8-.9-2.2-2.4-2.2-6.6Z"/><path d="M9.8 19.4a2.3 2.3 0 0 0 4.4 0"/>'
  };

  const icon = (name, cls = "") =>
    `<svg${cls ? ` class="${cls}"` : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const view = $("#view");
  const overlayRoot = $("#overlayRoot");
  const toastRegion = $("#toastRegion");
  const appFrame = $("#appFrame");

  let data = emptyData();
  let settings = emptySettings();
  let notifyLog = loadNotifyLog();
  let ui = {
    tab: "genel",
    expandedUpcoming: false,
    sheet: null,
    dialog: null,
    focusReturn: null
  };
  let lastRenderDay = "";
  let toastTimer = 0;
  let toastLeaveTimer = 0;
  let notificationCheckPromise = null;
  let initialized = false;

  /* ---------------------------------------------------------
     Data
     --------------------------------------------------------- */

  function emptyData() {
    return { version: SCHEMA_VERSION, cards: [], loans: [], recurrings: [] };
  }

  function emptySettings() {
    return {
      notifications: {
        enabled: false,
        cut: true,
        payment: true
      }
    };
  }

  function loadSettings() {
    try {
      const raw = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || "null");
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return emptySettings();
      const source = raw.notifications && typeof raw.notifications === "object" ? raw.notifications : {};
      return {
        notifications: {
          enabled: source.enabled === true,
          cut: source.cut !== false,
          payment: source.payment !== false
        }
      };
    } catch (error) {
      console.warn("Kese: ayarlar okunamadı", error);
      return emptySettings();
    }
  }

  function saveSettings() {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.warn("Kese: ayarlar yazılamadı", error);
      return false;
    }
  }

  function loadNotifyLog() {
    try {
      const raw = JSON.parse(window.localStorage.getItem(NOTIFY_LOG_KEY) || "{}");
      return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    } catch (error) {
      console.warn("Kese: bildirim kaydı okunamadı", error);
      return {};
    }
  }

  function saveNotifyLog() {
    pruneNotifyLog();
    try {
      window.localStorage.setItem(NOTIFY_LOG_KEY, JSON.stringify(notifyLog));
    } catch (error) {
      console.warn("Kese: bildirim kaydı yazılamadı", error);
    }
  }

  function pruneNotifyLog() {
    const cutoff = ymd(addDays(today(), -45));
    Object.keys(notifyLog).forEach((key) => {
      if (key.slice(0, 10) < cutoff) delete notifyLog[key];
    });
  }

  function uid(prefix = "id") {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}_${window.crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
    }
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
  }

  function safeId(value, prefix) {
    return typeof value === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(value) ? value : uid(prefix);
  }

  function toInt(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function isoDate(value) {
    if (typeof value !== "string") return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function normalizeData(input, strict = false) {
    let source = input;
    if (source && typeof source === "object" && source.data && typeof source.data === "object") {
      source = source.data;
    }
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      if (strict) throw new Error("invalid backup");
      return emptyData();
    }
    const known = ["cards", "loans", "recurrings"].some((key) => Array.isArray(source[key]));
    if (!known) {
      if (strict) throw new Error("invalid backup");
      return emptyData();
    }

    const result = emptyData();
    const seen = new Set();
    const nextId = (value, prefix) => {
      let id = safeId(value, prefix);
      if (seen.has(id)) id = uid(prefix);
      seen.add(id);
      return id;
    };

    (Array.isArray(source.cards) ? source.cards : []).forEach((raw, index) => {
      if (!raw || typeof raw !== "object") return;
      const name = String(raw.name || "").trim().slice(0, 60);
      if (!name) return;
      const createdAt = isoDate(raw.createdAt) || new Date().toISOString();
      result.cards.push({
        id: nextId(raw.id, "card"),
        name,
        cutDay: clamp(toInt(raw.cutDay, 1), 1, 31),
        dueOffset: clamp(toInt(raw.dueOffset, 10), 0, 30),
        debt: Math.max(0, toInt(raw.debt, 0)),
        accent: ACCENT_KEYS.includes(raw.accent) ? raw.accent : ACCENT_KEYS[index % ACCENT_KEYS.length],
        notify: raw.notify !== false,
        createdAt,
        debtUpdatedAt: isoDate(raw.debtUpdatedAt) || createdAt
      });
    });

    (Array.isArray(source.loans) ? source.loans : []).forEach((raw) => {
      if (!raw || typeof raw !== "object") return;
      const name = String(raw.name || "").trim().slice(0, 60);
      if (!name) return;
      const remaining = clamp(toInt(raw.remaining, 0), 0, 600);
      const date = parseYMD(raw.nextDate) || today();
      let total = raw.totalInstallments == null || raw.totalInstallments === "" ? null : clamp(toInt(raw.totalInstallments, 0), 0, 600);
      if (total !== null && total < remaining) total = remaining;
      if (total === 0) total = null;
      const createdAt = isoDate(raw.createdAt) || new Date().toISOString();
      result.loans.push({
        id: nextId(raw.id, "loan"),
        name,
        remaining,
        totalInstallments: total,
        amount: Math.max(0, toInt(raw.amount, 0)),
        nextDate: ymd(date),
        anchorDay: clamp(toInt(raw.anchorDay, date.getDate()), 1, 31),
        notify: raw.notify !== false,
        createdAt,
        completedAt: remaining === 0 ? isoDate(raw.completedAt) || createdAt : null
      });
    });

    (Array.isArray(source.recurrings) ? source.recurrings : []).forEach((raw) => {
      if (!raw || typeof raw !== "object") return;
      const name = String(raw.name || "").trim().slice(0, 60);
      if (!name) return;
      const date = parseYMD(raw.nextDate) || today();
      result.recurrings.push({
        id: nextId(raw.id, "recurring"),
        name,
        amount: Math.max(0, toInt(raw.amount, 0)),
        category: CATEGORIES[raw.category] ? raw.category : "diger",
        freq: FREQS[raw.freq] ? raw.freq : "monthly",
        nextDate: ymd(date),
        anchorDay: clamp(toInt(raw.anchorDay, date.getDate()), 1, 31),
        notify: raw.notify !== false,
        createdAt: isoDate(raw.createdAt) || new Date().toISOString()
      });
    });

    return result;
  }

  function loadData() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyData();
      return normalizeData(JSON.parse(raw));
    } catch (error) {
      console.warn("Kese: kayıtlar okunamadı", error);
      return emptyData();
    }
  }

  function saveData() {
    data.version = SCHEMA_VERSION;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.warn("Kese: kayıt yazılamadı", error);
      showToast("Değişiklik kaydedilemedi. Tarayıcı depolaması dolu olabilir.", { icon: "alert" });
      return false;
    }
  }

  /* ---------------------------------------------------------
     Dates & money
     --------------------------------------------------------- */

  function today() {
    return startOfDay(new Date());
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function parseYMD(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
  }

  function ymd(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function addMonthsClamped(date, count, anchorDay) {
    const target = new Date(date.getFullYear(), date.getMonth() + count, 1);
    const day = Math.min(anchorDay || date.getDate(), daysInMonth(target.getFullYear(), target.getMonth()));
    return new Date(target.getFullYear(), target.getMonth(), day);
  }

  function dayInMonth(year, month, day) {
    return new Date(year, month, Math.min(day, daysInMonth(year, month)));
  }

  function nextOnDay(day, from = today()) {
    const thisMonth = dayInMonth(from.getFullYear(), from.getMonth(), day);
    if (thisMonth >= from) return thisMonth;
    return dayInMonth(from.getFullYear(), from.getMonth() + 1, day);
  }

  function lastOnDay(day, from = today()) {
    const thisMonth = dayInMonth(from.getFullYear(), from.getMonth(), day);
    if (thisMonth <= from) return thisMonth;
    return dayInMonth(from.getFullYear(), from.getMonth() - 1, day);
  }

  function daysBetween(a, b) {
    const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((end - start) / 86400000);
  }

  function sameMonth(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  }

  function formatShort(date) {
    return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
  }

  function formatLong(date) {
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }

  function relativeDays(date) {
    const diff = daysBetween(today(), date);
    if (diff < 0) return `${Math.abs(diff)} gün gecikti`;
    if (diff === 0) return "Bugün";
    if (diff === 1) return "Yarın";
    return `${diff} gün kaldı`;
  }

  function relativeClass(date) {
    const diff = daysBetween(today(), date);
    if (diff < 0) return "is-overdue";
    if (diff === 0) return "is-today";
    if (diff <= 7) return "is-soon";
    return "";
  }

  function updatedText(iso) {
    const date = isoDate(iso);
    if (!date) return "";
    const parsed = startOfDay(new Date(date));
    const diff = daysBetween(parsed, today());
    if (diff <= 0) return "Bugün";
    if (diff === 1) return "Dün";
    if (diff < 7) return `${diff} gün önce`;
    return formatShort(parsed);
  }

  function formatMoneyPlain(kurus) {
    const value = Math.abs(kurus) / 100;
    const hasFraction = Math.abs(kurus) % 100 !== 0;
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatMoney(kurus, symbol = true) {
    return `${symbol ? "₺" : ""}${formatMoneyPlain(kurus)}`;
  }

  function moneyVisual(kurus) {
    const plain = formatMoneyPlain(kurus);
    const [whole, fraction] = plain.split(",");
    return `<span class="currency">₺</span>${whole}${fraction ? `<span class="fraction">,${fraction}</span>` : ""}`;
  }

  function formatMoneyInput(kurus) {
    return formatMoney(kurus, false);
  }

  function parseMoney(value) {
    let raw = String(value == null ? "" : value)
      .trim()
      .replace(/\u00a0/g, "")
      .replace(/\s/g, "")
      .replace(/₺|TL|TRY/gi, "");
    if (!raw) return null;
    if (raw.includes(",")) {
      raw = raw.replace(/\./g, "").replace(",", ".");
    } else if (/^\d{1,3}(\.\d{3})+$/.test(raw)) {
      raw = raw.replace(/\./g, "");
    }
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
    return Math.round(Number(raw) * 100);
  }

  function initials(name) {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return Array.from(parts[0]).slice(0, 2).join("").toLocaleUpperCase("tr-TR");
    return (Array.from(parts[0])[0] + Array.from(parts[1])[0]).toLocaleUpperCase("tr-TR");
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character]));
  }

  function sum(items, iterator) {
    return items.reduce((total, item) => total + iterator(item), 0);
  }

  function cardSchedule(card, from = today()) {
    const currentCut = lastOnDay(card.cutDay, from);
    const nextCut = nextOnDay(card.cutDay, from);
    const currentDue = addDays(currentCut, card.dueOffset);
    const nextDue = addDays(nextCut, card.dueOffset);
    return {
      currentCut,
      nextCut,
      currentDue,
      nextDue,
      due: currentDue >= from ? currentDue : nextDue
    };
  }

  function cardDueForMonth(card, from = today()) {
    const schedule = cardSchedule(card, from);
    return card.debt > 0 && sameMonth(schedule.due, from) ? schedule.due : null;
  }

  function advanceRecurring(recurringItem) {
    const current = parseYMD(recurringItem.nextDate) || today();
    if (recurringItem.freq === "weekly") return ymd(addDays(current, 7));
    return ymd(addMonthsClamped(current, FREQS[recurringItem.freq].months, recurringItem.anchorDay));
  }

  function advanceLoan(loan) {
    const current = parseYMD(loan.nextDate) || today();
    return ymd(addMonthsClamped(current, 1, loan.anchorDay));
  }

  function monthLabel(date) {
    return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }

  function recordCount() {
    return data.cards.length + data.loans.length + data.recurrings.length;
  }

  function activeLoanCount() {
    return data.loans.filter((loan) => loan.remaining > 0).length;
  }

  function getTotals() {
    const cardTotal = sum(data.cards, (card) => card.debt);
    const loanTotal = sum(data.loans, (loan) => loan.amount * loan.remaining);
    const remainingInstallments = sum(data.loans, (loan) => loan.remaining);
    const total = cardTotal + loanTotal;
    return {
      cardTotal,
      loanTotal,
      total,
      cardShare: total > 0 ? Math.round((cardTotal / total) * 100) : 0,
      remainingInstallments
    };
  }

  function getMonthlyDue() {
    const now = today();
    let total = 0;
    let count = 0;
    let cardAmount = 0;
    data.cards.forEach((card) => {
      if (cardDueForMonth(card, now)) {
        total += card.debt;
        cardAmount += card.debt;
        count += 1;
      }
    });
    data.loans.forEach((loan) => {
      const date = parseYMD(loan.nextDate);
      if (loan.remaining > 0 && date && sameMonth(date, now)) {
        total += loan.amount;
        count += 1;
      }
    });
    data.recurrings.forEach((recurringItem) => {
      const date = parseYMD(recurringItem.nextDate);
      if (date && sameMonth(date, now)) {
        total += recurringItem.amount;
        count += 1;
      }
    });
    return { total, count, cardAmount };
  }

  function getUpcomingEvents() {
    const now = today();
    const horizon = addDays(now, 60);
    const events = [];

    data.cards.forEach((card) => {
      const schedule = cardSchedule(card, now);
      events.push({
        key: `cut-${card.id}-${ymd(schedule.nextCut)}`,
        kind: "card",
        id: card.id,
        action: "open-card",
        date: schedule.nextCut,
        title: card.name,
        subtitle: "Ekstre kesimi",
        icon: "calendar",
        amount: card.debt > 0 ? card.debt : null
      });
      if (schedule.due <= horizon) {
        events.push({
          key: `due-${card.id}-${ymd(schedule.due)}`,
          kind: "card",
          id: card.id,
          action: "open-card",
          date: schedule.due,
          title: card.name,
          subtitle: "Son ödeme",
          icon: "card",
          amount: card.debt > 0 ? card.debt : null
        });
      }
    });

    data.loans.forEach((loan) => {
      if (loan.remaining <= 0) return;
      const date = parseYMD(loan.nextDate);
      if (!date || date > horizon) return;
      events.push({
        key: `loan-${loan.id}-${ymd(date)}`,
        kind: "loan",
        id: loan.id,
        action: "open-loan",
        date,
        title: loan.name,
        subtitle: `${loan.remaining} taksit kaldı`,
        icon: "layers",
        amount: loan.amount
      });
    });

    data.recurrings.forEach((recurringItem) => {
      const date = parseYMD(recurringItem.nextDate);
      if (!date || date > horizon) return;
      const category = CATEGORIES[recurringItem.category] || CATEGORIES.diger;
      events.push({
        key: `rec-${recurringItem.id}-${ymd(date)}`,
        kind: "recurring",
        id: recurringItem.id,
        action: "open-recurring",
        date,
        title: recurringItem.name,
        subtitle: `${category.label} · ${FREQS[recurringItem.freq].short}`,
        icon: category.icon,
        amount: recurringItem.amount
      });
    });

    return events.sort((a, b) => {
      const diff = a.date - b.date;
      if (diff !== 0) return diff;
      return a.title.localeCompare(b.title, "tr");
    });
  }

  /* ---------------------------------------------------------
     Notifications
     --------------------------------------------------------- */

  function notificationPermission() {
    try {
      if (typeof window.Notification === "undefined") return "unsupported";
      const permission = window.Notification.permission;
      if (permission === "granted" || permission === "denied" || permission === "default") return permission;
      return "default";
    } catch (error) {
      return "unsupported";
    }
  }

  function requestNotificationPermission() {
    return new Promise((resolve) => {
      let settled = false;
      const done = (permission) => {
        if (settled) return;
        settled = true;
        resolve(permission === "granted" || permission === "denied" ? permission : "default");
      };
      try {
        const result = window.Notification.requestPermission(done);
        if (result && typeof result.then === "function") {
          result.then(done).catch(() => done("default"));
        }
      } catch (error) {
        done("default");
      }
    });
  }

  async function showSystemNotification({ title, body, tag, tab, entityType, entityId }) {
    if (notificationPermission() !== "granted") return false;
    let iconUrl = "./icons/icon-192.png";
    try {
      iconUrl = new URL("./icons/icon-192.png", window.location.href).href;
    } catch (error) {
      /* göreli yol yeterli */
    }
    const options = {
      body,
      tag: tag || "kese-reminder",
      icon: iconUrl,
      badge: iconUrl,
      lang: "tr",
      data: {
        tab: tab || "genel",
        entityType: entityType || null,
        entityId: entityId || null
      }
    };
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && typeof registration.showNotification === "function") {
          await registration.showNotification(title, options);
          return true;
        }
      }
      if (typeof window.Notification === "function") {
        new window.Notification(title, options);
        return true;
      }
    } catch (error) {
      console.warn("Kese: bildirim gösterilemedi", error);
    }
    return false;
  }

  function buildTodayReminders(day = today()) {
    if (!settings.notifications.enabled) return [];
    const dayKey = ymd(day);
    const reminders = [];

    data.cards.forEach((card) => {
      if (card.notify === false) return;
      const schedule = cardSchedule(card, day);
      if (settings.notifications.cut && ymd(schedule.nextCut) === dayKey) {
        reminders.push({
          key: `${dayKey}|card-cut|${card.id}`,
          title: `Ekstre kesildi · ${card.name}`,
          body: "Bugün ekstre kesim günü. Yeni ekstre tutarını Kese'ye girmeyi unutma.",
          tag: `kese-card-cut-${card.id}`,
          tab: "kartlar",
          entityType: "card",
          entityId: card.id
        });
      }
      if (settings.notifications.payment && card.debt > 0 && ymd(schedule.due) === dayKey) {
        reminders.push({
          key: `${dayKey}|card-due|${card.id}`,
          title: `Son ödeme günü · ${card.name}`,
          body: `${formatMoney(card.debt)} kart borcunu bugün ödemeyi unutma.`,
          tag: `kese-card-due-${card.id}`,
          tab: "kartlar",
          entityType: "card",
          entityId: card.id
        });
      }
    });

    data.loans.forEach((loan) => {
      if (loan.remaining <= 0 || loan.notify === false || !settings.notifications.payment) return;
      const date = parseYMD(loan.nextDate);
      if (!date || ymd(date) !== dayKey) return;
      reminders.push({
        key: `${dayKey}|loan|${loan.id}`,
        title: `Taksit günü · ${loan.name}`,
        body: `${formatMoney(loan.amount)} taksit ödemesi bugün. ${loan.remaining} taksit kaldı.`,
        tag: `kese-loan-${loan.id}`,
        tab: "taksitler",
        entityType: "loan",
        entityId: loan.id
      });
    });

    data.recurrings.forEach((recurringItem) => {
      if (recurringItem.notify === false || !settings.notifications.payment) return;
      const date = parseYMD(recurringItem.nextDate);
      if (!date || ymd(date) !== dayKey) return;
      const category = CATEGORIES[recurringItem.category] || CATEGORIES.diger;
      reminders.push({
        key: `${dayKey}|recurring|${recurringItem.id}`,
        title: `Ödeme günü · ${recurringItem.name}`,
        body: `${formatMoney(recurringItem.amount)} ${category.label.toLocaleLowerCase("tr-TR")} ödemesi bugün.`,
        tag: `kese-recurring-${recurringItem.id}`,
        tab: "duzenli",
        entityType: "recurring",
        entityId: recurringItem.id
      });
    });

    return reminders;
  }

  async function checkNotifications() {
    if (!settings.notifications.enabled || notificationPermission() !== "granted") return;
    if (notificationCheckPromise) return notificationCheckPromise;
    notificationCheckPromise = (async () => {
      const reminders = buildTodayReminders();
      if (!reminders.length) return;
      pruneNotifyLog();
      for (const reminder of reminders) {
        if (notifyLog[reminder.key]) continue;
        const sent = await showSystemNotification(reminder);
        if (sent) {
          notifyLog[reminder.key] = new Date().toISOString();
          saveNotifyLog();
        }
      }
    })();
    try {
      await notificationCheckPromise;
    } finally {
      notificationCheckPromise = null;
    }
  }

  async function setNotificationsEnabled(enabled) {
    if (!enabled) {
      settings.notifications.enabled = false;
      saveSettings();
      refreshSheet();
      showToast("Sistem bildirimleri kapatıldı.", { icon: "info" });
      return;
    }

    const current = notificationPermission();
    if (current === "unsupported") {
      showToast("Bu tarayıcı sistem bildirimlerini desteklemiyor. Takvime hatırlatma ekleyebilirsin.", {
        icon: "alert",
        duration: 7000
      });
      return;
    }

    let permission = current;
    if (permission === "default") permission = await requestNotificationPermission();
    if (permission !== "granted") {
      settings.notifications.enabled = false;
      saveSettings();
      refreshSheet();
      showToast(
        permission === "denied" || current === "denied"
          ? "Bildirim izni kapalı. Tarayıcı ayarlarından Kese'ye izin vermen gerekiyor."
          : "Bildirim izni verilmedi. Daha sonra tekrar deneyebilirsin.",
        { icon: "alert", duration: 7000 }
      );
      return;
    }

    settings.notifications.enabled = true;
    saveSettings();
    refreshSheet();
    showToast("Sistem bildirimleri açıldı. Ödeme ve ekstre günlerinde haber vereceğim.", {
      icon: "bell",
      duration: 5000
    });
    checkNotifications();
  }

  function toggleNotifyType(type) {
    if (type !== "cut" && type !== "payment") return;
    settings.notifications[type] = !settings.notifications[type];
    saveSettings();
    refreshSheet();
    const label = type === "cut" ? "Ekstre kesim" : "Ödeme günü";
    showToast(`${label} hatırlatması ${settings.notifications[type] ? "açıldı" : "kapatıldı"}.`, { icon: "info" });
  }

  function toggleEntityNotify(type, id) {
    const collection = { card: "cards", loan: "loans", recurring: "recurrings" }[type];
    if (!collection || !id) return;
    const item = data[collection].find((entry) => entry.id === id);
    if (!item) return;
    item.notify = item.notify === false;
    saveData();
    refreshSheet();
    showToast(
      item.notify ? `${item.name} için hatırlatma açıldı.` : `${item.name} için hatırlatma kapatıldı.`,
      { icon: item.notify ? "bell" : "info" }
    );
  }

  async function sendTestNotification() {
    const permission = notificationPermission();
    if (permission === "unsupported") {
      showToast("Bu tarayıcı sistem bildirimlerini desteklemiyor. Takvime hatırlatma ekleyebilirsin.", {
        icon: "alert",
        duration: 7000
      });
      return;
    }
    if (permission !== "granted") {
      showToast("Önce sistem bildirimlerini açıp izin vermelisin.", { icon: "alert" });
      return;
    }
    const sent = await showSystemNotification({
      title: "Kese test bildirimi",
      body: "Bildirimler çalışıyor. Ödeme ve ekstre günlerinde haber vereceğim.",
      tag: "kese-test",
      tab: ui.tab
    });
    showToast(
      sent ? "Test bildirimi gönderildi." : "Bildirim gönderilemedi. Kese'yi ana ekrana ekleyip tekrar dene.",
      { icon: sent ? "bell" : "alert", duration: sent ? 4000 : 7000 }
    );
  }

  function collectCalendarReminders() {
    const start = today();
    const end = addMonthsClamped(start, CALENDAR_MONTHS, start.getDate());
    const reminders = [];
    const push = (date, type, id, kind, title, description) => {
      if (!date || date < start || date > end) return;
      reminders.push({
        date,
        uid: `kese-${type}-${id}-${kind}-${ymd(date)}@kese`,
        title,
        description
      });
    };

    data.cards.forEach((card) => {
      if (card.notify === false) return;
      if (settings.notifications.cut) {
        let cut = nextOnDay(card.cutDay, start);
        while (cut <= end) {
          push(
            cut,
            "card",
            card.id,
            "cut",
            `${card.name} · Ekstre kesimi`,
            "Ekstre kesim günü. Yeni ekstre tutarını Kese'ye girmeyi unutma."
          );
          cut = addMonthsClamped(cut, 1, card.cutDay);
        }
      }
      if (settings.notifications.payment && card.debt > 0) {
        let cut = lastOnDay(card.cutDay, start);
        let due = addDays(cut, card.dueOffset);
        if (due < start) {
          cut = addMonthsClamped(cut, 1, card.cutDay);
          due = addDays(cut, card.dueOffset);
        }
        while (due <= end) {
          push(
            due,
            "card",
            card.id,
            "due",
            `${card.name} · Son ödeme`,
            `${formatMoney(card.debt)} kart borcunun son ödeme günü.`
          );
          cut = addMonthsClamped(cut, 1, card.cutDay);
          due = addDays(cut, card.dueOffset);
        }
      }
    });

    data.loans.forEach((loan) => {
      if (loan.remaining <= 0 || loan.notify === false || !settings.notifications.payment) return;
      let date = parseYMD(loan.nextDate);
      if (!date) return;
      let remaining = loan.remaining;
      let guard = 0;
      while (date < start && remaining > 0 && guard < 600) {
        date = addMonthsClamped(date, 1, loan.anchorDay);
        remaining -= 1;
        guard += 1;
      }
      while (date <= end && remaining > 0 && guard < 600) {
        push(
          date,
          "loan",
          loan.id,
          "payment",
          `${loan.name} · Taksit`,
          `${formatMoney(loan.amount)} taksit ödemesi. ${remaining} taksit kaldı.`
        );
        date = addMonthsClamped(date, 1, loan.anchorDay);
        remaining -= 1;
        guard += 1;
      }
    });

    data.recurrings.forEach((recurringItem) => {
      if (recurringItem.notify === false || !settings.notifications.payment) return;
      const category = CATEGORIES[recurringItem.category] || CATEGORIES.diger;
      let date = parseYMD(recurringItem.nextDate);
      if (!date) return;
      let guard = 0;
      const step = () => {
        if (recurringItem.freq === "weekly") return addDays(date, 7);
        return addMonthsClamped(date, FREQS[recurringItem.freq].months, recurringItem.anchorDay);
      };
      while (date < start && guard < 120) {
        date = step();
        guard += 1;
      }
      while (date <= end && guard < 120) {
        push(
          date,
          "recurring",
          recurringItem.id,
          "payment",
          `${recurringItem.name} · ${category.label}`,
          `${formatMoney(recurringItem.amount)} ödeme bugün.`
        );
        date = step();
        guard += 1;
      }
    });

    return reminders.sort((a, b) => a.date - b.date || a.title.localeCompare(b.title, "tr"));
  }

  function escapeIcsText(value) {
    return String(value == null ? "" : value)
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  }

  function icsDate(date) {
    return ymd(date).replace(/-/g, "");
  }

  function icsAlarmStamp(date) {
    const local = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0, 0);
    return local.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }

  function buildCalendarFile() {
    const reminders = collectCalendarReminders();
    if (!reminders.length) return null;
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Kese//Borc Takibi//TR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Kese Hatırlatmalar",
      "X-WR-TIMEZONE:Europe/Istanbul"
    ];
    reminders.forEach((item) => {
      lines.push(
        "BEGIN:VEVENT",
        `UID:${item.uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${icsDate(item.date)}`,
        `DTEND;VALUE=DATE:${icsDate(addDays(item.date, 1))}`,
        `SUMMARY:${escapeIcsText(item.title)}`,
        `DESCRIPTION:${escapeIcsText(item.description)}`,
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
        "TRANSP:TRANSPARENT",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeIcsText(item.title)}`,
        `TRIGGER;VALUE=DATE-TIME:${icsAlarmStamp(item.date)}`,
        "END:VALARM",
        "END:VEVENT"
      );
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }

  function exportCalendar() {
    const content = buildCalendarFile();
    if (!content) {
      showToast("Takvime eklenecek hatırlatma yok. Önce kayıt ekle veya hatırlatma türlerini aç.", {
        icon: "info",
        duration: 6000
      });
      return;
    }
    downloadTextFile(`kese-hatirlatmalar-${ymd(today())}.ics`, content, "text/calendar;charset=utf-8");
    showToast("Takvim dosyası indirildi. Açıp hatırlatmaları ekle.", { icon: "calendar", duration: 6000 });
  }

  /* ---------------------------------------------------------
     Overlay helpers
     --------------------------------------------------------- */

  function syncAppState() {
    const hasSheet = Boolean(document.getElementById("sheetOverlay"));
    const hasDialog = Boolean(document.getElementById("dialogLayer"));
    const locked = hasSheet || hasDialog;
    document.body.classList.toggle("is-locked", locked);
    if (appFrame) appFrame.inert = locked;
  }

  function focusableElements(root) {
    return $$(
      'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      root
    ).filter((element) => element.getClientRects().length > 0 || element === document.activeElement);
  }

  function showToast(message, options = {}) {
    if (!toastRegion) return;
    window.clearTimeout(toastTimer);
    window.clearTimeout(toastLeaveTimer);
    const duration = options.duration || (options.actionLabel ? 7000 : 3800);
    const iconName = options.icon || "checkCircle";
    toastRegion.innerHTML = `
      <div class="toast" role="status">
        <span class="toast-icon">${icon(iconName)}</span>
        <span class="toast-message">${escapeHTML(message)}</span>
        ${options.actionLabel ? `<button type="button" class="toast-action">${escapeHTML(options.actionLabel)}</button>` : ""}
      </div>
    `;
    const toast = toastRegion.firstElementChild;
    const actionButton = $(".toast-action", toast);
    if (actionButton) {
      actionButton.addEventListener("click", () => {
        dismissToast();
        if (typeof options.onAction === "function") options.onAction();
      }, { once: true });
    }
    toastTimer = window.setTimeout(dismissToast, duration);
  }

  function dismissToast() {
    const toast = toastRegion.firstElementChild;
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.classList.add("is-leaving");
    toastLeaveTimer = window.setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 230);
  }

  function restoreFocusFallback() {
    const target = ui.focusReturn;
    ui.focusReturn = null;
    if (target && typeof target.focus === "function" && target.isConnected) {
      target.focus({ preventScroll: true });
      return;
    }
    if (view) view.focus({ preventScroll: true });
  }

  function closeSheet(options = {}) {
    const overlay = document.getElementById("sheetOverlay");
    if (!overlay) return;
    const animate = options.animate !== false;
    ui.sheet = null;
    if (animate) {
      overlay.classList.add("is-closing");
      window.setTimeout(() => {
        overlay.remove();
        syncAppState();
      }, 240);
    } else {
      overlay.remove();
      syncAppState();
    }
    syncAppState();
    if (!document.getElementById("dialogLayer")) {
      restoreFocusFallback();
    }
  }

  function closeDialog() {
    const layer = document.getElementById("dialogLayer");
    if (!layer) return;
    ui.dialog = null;
    layer.remove();
    syncAppState();
    if (!document.getElementById("sheetOverlay")) restoreFocusFallback();
  }

  function showDialog(options) {
    if (!overlayRoot) return;
    closeDialog();
    const danger = options.danger !== false;
    const layer = document.createElement("div");
    layer.id = "dialogLayer";
    layer.className = "dialog-layer";
    layer.innerHTML = `
      <div class="dialog-backdrop" data-action="close-dialog" aria-hidden="true"></div>
      <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialogTitle" aria-describedby="dialogMessage" tabindex="-1">
        <div class="dialog-icon${danger ? " is-danger" : ""}">${icon(options.icon || (danger ? "trash" : "checkCircle"))}</div>
        <h2 id="dialogTitle">${escapeHTML(options.title || "Emin misin?")}</h2>
        <p id="dialogMessage">${escapeHTML(options.message || "")}</p>
        <div class="dialog-actions">
          <button type="button" class="btn btn-secondary" data-action="close-dialog">${escapeHTML(options.cancelLabel || "Vazgeç")}</button>
          <button type="button" class="btn ${danger ? "btn-danger" : "btn-primary"}" data-action="confirm-dialog">${escapeHTML(options.confirmLabel || "Onayla")}</button>
        </div>
      </div>
    `;
    overlayRoot.appendChild(layer);
    ui.dialog = { onConfirm: options.onConfirm };
    syncAppState();
    const dialog = $(".dialog", layer);
    if (dialog) dialog.focus({ preventScroll: true });
  }

  function confirmDialog() {
    const action = ui.dialog && ui.dialog.onConfirm;
    if (typeof action !== "function") {
      closeDialog();
      return;
    }
    closeDialog();
    action();
  }

  /* ---------------------------------------------------------
     Sheet markup helpers
     --------------------------------------------------------- */

  function sheetShell({ kicker, title, subtitle, body, footer, staticSheet = false }) {
    return `
      <div class="overlay${staticSheet ? "" : ""}" id="sheetOverlay">
        <div class="backdrop${staticSheet ? " no-anim" : ""}" data-action="close-sheet" aria-hidden="true"></div>
        <section class="sheet${staticSheet ? " no-anim" : ""}" role="dialog" aria-modal="true" aria-labelledby="sheetTitle" tabindex="-1">
          <div class="sheet-grab" aria-hidden="true"></div>
          <header class="sheet-head">
            <div class="sheet-heading">
              <p class="sheet-kicker">${escapeHTML(kicker || "")}</p>
              <h2 class="sheet-title" id="sheetTitle">${escapeHTML(title || "")}</h2>
              ${subtitle ? `<p class="sheet-subtitle">${subtitle}</p>` : ""}
            </div>
            <button type="button" class="sheet-close" data-action="close-sheet" aria-label="Kapat">${icon("close")}</button>
          </header>
          ${body}
          ${footer || ""}
        </section>
      </div>
    `;
  }

  function sheetInfo(kind, id) {
    if (kind === "settings") {
      return {
        kicker: "AYARLAR",
        title: "Ayarlar",
        subtitle: "Yedekleme ve uygulama bilgileri",
        body: settingsBody()
      };
    }
    if (kind === "card-form") {
      const card = id ? data.cards.find((item) => item.id === id) : null;
      if (id && !card) return null;
      return {
        kicker: card ? "KARTI DÜZENLE" : "YENİ KART",
        title: card ? "Kart bilgileri" : "Kredi kartı ekle",
        subtitle: "Ekstre kesim ve son ödeme tarihleri otomatik hesaplanır.",
        body: cardFormBody(card),
        footer: `
          <div class="sheet-footer">
            <button type="submit" form="sheetForm" class="btn btn-primary btn-block">${icon("check")}${card ? "Değişiklikleri kaydet" : "Kartı kaydet"}</button>
          </div>
        `
      };
    }
    if (kind === "loan-form") {
      const loan = id ? data.loans.find((item) => item.id === id) : null;
      if (id && !loan) return null;
      return {
        kicker: loan ? "TAKSİTİ DÜZENLE" : "YENİ TAKSİT",
        title: loan ? "Taksit bilgileri" : "Taksitli ödeme ekle",
        subtitle: "Kalan taksit, tutar ve tarih yeterli.",
        body: loanFormBody(loan),
        footer: `
          <div class="sheet-footer">
            <button type="submit" form="sheetForm" class="btn btn-primary btn-block">${icon("check")}${loan ? "Değişiklikleri kaydet" : "Taksiti kaydet"}</button>
          </div>
        `
      };
    }
    if (kind === "recurring-form") {
      const recurringItem = id ? data.recurrings.find((item) => item.id === id) : null;
      if (id && !recurringItem) return null;
      return {
        kicker: recurringItem ? "ÖDEMEYİ DÜZENLE" : "YENİ ÖDEME",
        title: recurringItem ? "Ödeme bilgileri" : "Düzenli ödeme ekle",
        subtitle: "Kira, fatura, abonelik veya diğer düzenli ödemeler.",
        body: recurringFormBody(recurringItem),
        footer: `
          <div class="sheet-footer">
            <button type="submit" form="sheetForm" class="btn btn-primary btn-block">${icon("check")}${recurringItem ? "Değişiklikleri kaydet" : "Ödemeyi kaydet"}</button>
          </div>
        `
      };
    }
    if (kind === "card-detail") {
      const card = data.cards.find((item) => item.id === id);
      if (!card) return null;
      return {
        kicker: "KREDİ KARTI",
        title: card.name,
        subtitle: `Kesim her ayın ${card.cutDay}. günü`,
        body: cardDetailBody(card)
      };
    }
    if (kind === "loan-detail") {
      const loan = data.loans.find((item) => item.id === id);
      if (!loan) return null;
      return {
        kicker: "TAKSİTLİ ÖDEME",
        title: loan.name,
        subtitle: loan.remaining > 0 ? `${loan.remaining} taksit kaldı · aylık ödeme` : "Tüm taksitler ödendi",
        body: loanDetailBody(loan)
      };
    }
    if (kind === "recurring-detail") {
      const recurringItem = data.recurrings.find((item) => item.id === id);
      if (!recurringItem) return null;
      const category = CATEGORIES[recurringItem.category] || CATEGORIES.diger;
      return {
        kicker: category.label.toLocaleUpperCase("tr-TR"),
        title: recurringItem.name,
        subtitle: `${FREQS[recurringItem.freq].short} · sonraki ödeme ${formatShort(parseYMD(recurringItem.nextDate))}`,
        body: recurringDetailBody(recurringItem)
      };
    }
    return null;
  }

  function openSheet(kind, id = null, options = {}) {
    const info = sheetInfo(kind, id);
    if (!info) return;
    if (!document.getElementById("sheetOverlay")) {
      ui.focusReturn = document.activeElement;
    }
    const previous = document.getElementById("sheetOverlay");
    if (previous) previous.remove();
    const staticSheet = options.static === true;
    const markup = sheetShell({ ...info, staticSheet });
    overlayRoot.insertAdjacentHTML("beforeend", markup);
    ui.sheet = { kind, id };
    syncAppState();
    const sheet = $("#sheetOverlay .sheet");
    if (sheet) sheet.focus({ preventScroll: true });
    bindFormPreview();
  }

  function refreshSheet() {
    if (!ui.sheet) return;
    const current = ui.sheet;
    const focused = document.activeElement;
    const previousBody = $("#sheetOverlay .sheet-body");
    const scrollTop = previousBody ? previousBody.scrollTop : 0;
    openSheet(current.kind, current.id, { static: true });
    const nextBody = $("#sheetOverlay .sheet-body");
    if (nextBody) nextBody.scrollTop = scrollTop;
    if (focused && focused.closest && focused.closest("#sheetOverlay")) {
      const sheet = $("#sheetOverlay .sheet");
      if (sheet) sheet.focus({ preventScroll: true });
    }
  }

  function openSettings() {
    openSheet("settings");
  }

  /* ---------------------------------------------------------
     Page rendering
     --------------------------------------------------------- */

  function pageHead({ eyebrow, title, subtitle, action }) {
    return `
      <section class="page-head">
        <div class="page-head-row">
          <div>
            <p class="eyebrow"><span class="eyebrow-dot"></span>${escapeHTML(eyebrow)}</p>
            <h1>${escapeHTML(title)}</h1>
            ${subtitle ? `<p>${escapeHTML(subtitle)}</p>` : ""}
          </div>
          ${action ? actionButton(action) : ""}
        </div>
      </section>
    `;
  }

  function actionButton({ label, action }) {
    return `<button type="button" class="add-btn" data-action="${action}">${icon("plus")}<span>${escapeHTML(label)}</span></button>`;
  }

  function emptyState({ iconName, title, text, action, actionLabel }) {
    return `
      <div class="empty">
        <div class="empty-icon">${icon(iconName)}</div>
        <h3>${escapeHTML(title)}</h3>
        <p>${escapeHTML(text)}</p>
        <button type="button" class="btn btn-primary btn-sm" data-action="${action}">${icon("plus")}${escapeHTML(actionLabel)}</button>
      </div>
    `;
  }

  function sectionHead(title, subtitle, extra) {
    return `
      <div class="section-head">
        <div>
          <h2 class="section-title">${escapeHTML(title)}</h2>
          ${subtitle ? `<p class="section-sub">${escapeHTML(subtitle)}</p>` : ""}
        </div>
        ${extra || ""}
      </div>
    `;
  }

  function privacyFoot() {
    return `<div class="privacy-foot">${icon("lock")}<span>Veriler yalnızca bu cihazda saklanır.</span></div>`;
  }

  function render(options = {}) {
    let content = "";
    if (ui.tab === "kartlar") content = cardsPage();
    else if (ui.tab === "taksitler") content = loansPage();
    else if (ui.tab === "duzenli") content = recurringPage();
    else content = overviewPage();

    view.innerHTML = `<div${options.animate ? ' class="page-enter"' : ""}>${content}</div>`;
    syncTabs();
    const titles = {
      genel: "Kese — Genel bakış",
      kartlar: "Kese — Kartlar",
      taksitler: "Kese — Taksitler",
      duzenli: "Kese — Düzenli ödemeler"
    };
    document.title = titles[ui.tab] || titles.genel;
    lastRenderDay = ymd(today());
    if (options.scrollTop) window.scrollTo(0, 0);
  }

  function syncTabs() {
    $$(".tab").forEach((tab) => {
      const active = tab.dataset.tab === ui.tab;
      tab.classList.toggle("is-active", active);
      if (active) tab.setAttribute("aria-current", "page");
      else tab.removeAttribute("aria-current");
    });
  }

  function switchTab(tab) {
    if (!["genel", "kartlar", "taksitler", "duzenli"].includes(tab)) return;
    if (ui.tab === tab) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    ui.tab = tab;
    ui.expandedUpcoming = false;
    try {
      history.replaceState(null, "", `#${tab}`);
    } catch (error) {
      /* file:// gibi ortamlarda sessizce geç */
    }
    render({ animate: true, scrollTop: true });
    view.focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------
     Overview
     --------------------------------------------------------- */

  function overviewPage() {
    if (recordCount() === 0) return welcomePage();
    const totals = getTotals();
    const monthly = getMonthlyDue();
    const now = today();
    const cardCount = data.cards.length;
    const lenderCount = activeLoanCount();
    const recurringCount = data.recurrings.length;
    const captionParts = [
      `${cardCount} kart`,
      `${lenderCount} kredi`,
      `${recurringCount} düzenli`
    ].filter((part) => !part.startsWith("0 "));

    const events = getUpcomingEvents();
    const hero = `
      <section class="hero">
        <div class="hero-top">
          <div class="hero-copy">
            <div class="hero-label">${icon("wallet")}Toplam borç</div>
            <div class="hero-value">${moneyVisual(totals.total)}</div>
            <div class="hero-caption">${totals.total > 0 ? `${captionParts.join(" · ")} takibinde.` : "Kayıtlı borç görünmüyor."}</div>
          </div>
          <div class="hero-ring${totals.total > 0 ? "" : " is-empty"}" style="--card-share:${totals.cardShare}%" aria-hidden="true">
            <div class="hero-ring-copy">
              <span class="hero-ring-pct">${totals.total > 0 ? `${totals.cardShare}%` : "—"}</span>
              <span class="hero-ring-label">kart payı</span>
            </div>
          </div>
        </div>
        <div class="hero-breakdown">
          <div class="breakdown-item">
            <span class="breakdown-label"><span class="breakdown-dot"></span>Kredi kartları</span>
            <strong class="breakdown-value">${formatMoney(totals.cardTotal)}</strong>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label"><span class="breakdown-dot breakdown-dot--sky"></span>Taksitler</span>
            <strong class="breakdown-value">${formatMoney(totals.loanTotal)}</strong>
          </div>
        </div>
      </section>
    `;

    const statGrid = `
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-icon">${icon("calendar")}</span>
            <span class="stat-meta-top">BU AY</span>
          </div>
          <div class="stat-body">
            <div class="stat-label">Ödenecek</div>
            <div class="stat-value">${formatMoney(monthly.total)}</div>
            <div class="stat-foot">${monthly.count ? `${monthly.count} kalem · kartlar dahil` : "Ödeme yok"}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-top">
            <span class="stat-icon stat-icon--sky">${icon("layers")}</span>
            <span class="stat-meta-top">TAKSİT</span>
          </div>
          <div class="stat-body">
            <div class="stat-label">Kalan taksit</div>
            <div class="stat-value">${totals.remainingInstallments} <small>taksit</small></div>
            <div class="stat-foot">${totals.loanTotal > 0 ? `${formatMoney(totals.loanTotal)} kaldı` : "Taksit yok"}</div>
          </div>
        </div>
      </div>
    `;

    const upcoming = `
      <section class="section">
        ${sectionHead("Yaklaşan ödemeler", "Önümüzdeki 60 gün · gecikmişler dahil")}
        ${events.length ? upcomingList(events) : `
          <div class="empty-inline">
            ${icon("calendar")}
            <div>
              <strong>Yaklaşan ödeme yok</strong>
              <span>Taksit veya düzenli ödeme eklediğinde burada görünür.</span>
            </div>
          </div>
        `}
      </section>
    `;

    return `
      ${pageHead({
        eyebrow: `${WEEKDAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`,
        title: "Genel bakış",
        subtitle: "Borçların ve yaklaşan ödemelerin tek yerde."
      })}
      ${hero}
      ${statGrid}
      ${upcoming}
      ${privacyFoot()}
    `;
  }

  function welcomePage() {
    return `
      <section class="welcome">
        <div class="welcome-hero">
          <div class="welcome-mark">${icon("wallet")}</div>
          <p class="eyebrow"><span class="eyebrow-dot"></span>HOŞ GELDİN</p>
          <h1>Borçların tek yerde.</h1>
          <p class="welcome-lede">Kartlarını, taksitlerini, kira ve faturalarını ekle. Tarihleri Kese hesaplasın, sen sadece ödemelerini takip et.</p>
          <div class="welcome-actions">
            <button type="button" class="welcome-action accent-mint" data-action="add-card">
              <span class="wa-icon">${icon("card")}</span>
              <span class="wa-main"><span class="wa-title">Kredi kartı ekle</span><span class="wa-sub">Ekstre kesim tarihi ve borç</span></span>
              ${icon("chevron", "wa-arrow")}
            </button>
            <button type="button" class="welcome-action accent-sky" data-action="add-loan">
              <span class="wa-icon">${icon("layers")}</span>
              <span class="wa-main"><span class="wa-title">Taksitli ödeme ekle</span><span class="wa-sub">Kalan taksit, tutar ve tarih</span></span>
              ${icon("chevron", "wa-arrow")}
            </button>
            <button type="button" class="welcome-action accent-amber" data-action="add-recurring">
              <span class="wa-icon">${icon("repeat")}</span>
              <span class="wa-main"><span class="wa-title">Kira / düzenli ödeme ekle</span><span class="wa-sub">Her ay otomatik tekrar eder</span></span>
              ${icon("chevron", "wa-arrow")}
            </button>
          </div>
        </div>
        <ul class="welcome-points">
          <li>${icon("checkCircle")}<span>Ekstre kesim ve son ödeme tarihleri otomatik hesaplanır.</span></li>
          <li>${icon("checkCircle")}<span>Taksit ödedikçe kalan sayı ve sonraki tarih kendiliğinden güncellenir.</span></li>
          <li>${icon("checkCircle")}<span>Veriler yalnızca bu cihazda kalır, hesap açman gerekmez.</span></li>
        </ul>
        ${privacyFoot()}
      </section>
    `;
  }

  function upcomingList(events) {
    const now = today();
    const visible = ui.expandedUpcoming ? events : events.slice(0, 6);
    let html = '<div class="timeline">';
    let lastGroup = "";
    visible.forEach((event) => {
      const past = event.date < now;
      const groupKey = past ? "overdue" : `${event.date.getFullYear()}-${event.date.getMonth()}`;
      if (groupKey !== lastGroup) {
        html += `<div class="month-label${past ? " month-label--overdue" : ""}">${past ? "Gecikmiş" : escapeHTML(monthLabel(event.date))}</div>`;
        lastGroup = groupKey;
      }
      html += eventCard(event);
    });
    html += "</div>";
    if (events.length > 6) {
      html += `
        <button type="button" class="ghost-btn" data-action="toggle-upcoming">
          ${icon(ui.expandedUpcoming ? "chevron" : "plus")}
          ${ui.expandedUpcoming ? "Daha az göster" : `Tümünü göster (${events.length})`}
        </button>
      `;
    }
    return html;
  }

  function eventCard(event) {
    const now = today();
    const isToday = event.date.getTime() === now.getTime();
    const isPast = event.date < now;
    const when = relativeDays(event.date);
    const amount = event.amount != null ? formatMoney(event.amount) : "";
    return `
      <button type="button" class="event-card${isToday ? " is-today" : ""}${isPast ? " is-overdue" : ""}" data-action="${event.action}" data-id="${event.id}" aria-label="${escapeHTML(`${event.title}, ${event.subtitle}, ${formatLong(event.date)}${amount ? `, ${amount}` : ""}`)}">
        <span class="date-tile" aria-hidden="true">
          <span class="date-day">${event.date.getDate()}</span>
          <span class="date-mon">${MONTHS_SHORT[event.date.getMonth()]}</span>
        </span>
        <span class="event-main">
          <span class="event-title">${escapeHTML(event.title)}</span>
          <span class="event-sub">${icon(event.icon)}${escapeHTML(event.subtitle)}</span>
        </span>
        <span class="event-side">
          <span class="event-amount">${amount}</span>
          <span class="event-when">${escapeHTML(when)}</span>
        </span>
      </button>
    `;
  }

  /* ---------------------------------------------------------
     Cards page
     --------------------------------------------------------- */

  function cardsPage() {
    const totals = getTotals();
    const nearest = data.cards
      .map((card) => cardSchedule(card).nextCut)
      .sort((a, b) => a - b)[0];

    return `
      ${pageHead({
        eyebrow: "KREDİ KARTLARI",
        title: "Kartlar",
        subtitle: data.cards.length ? `${data.cards.length} kart · borç ve ekstre takibi` : "Kart ekle, tarihleri otomatik hesaplayalım.",
        action: { label: "Ekle", action: "add-card" }
      })}
      ${data.cards.length ? `
        <div class="summary-strip">
          <div>
            <span class="summary-strip-label">Toplam kart borcu</span>
            <strong class="summary-strip-value">${formatMoney(totals.cardTotal)}</strong>
          </div>
          <div class="summary-strip-side">
            ${data.cards.length} kart<br>
            Sonraki kesim <strong>${formatShort(nearest)}</strong>
          </div>
        </div>
        <div class="stack">
          ${data.cards
            .slice()
            .sort((a, b) => cardSchedule(a).nextCut - cardSchedule(b).nextCut)
            .map(cardTile)
            .join("")}
        </div>
      ` : emptyState({
        iconName: "card",
        title: "Henüz kart yok",
        text: "Ekstre kesim gününü gir; bir sonraki ekstre ve son ödeme tarihini Kese hesaplasın. Borcu istediğin zaman elle güncelle.",
        action: "add-card",
        actionLabel: "İlk kartını ekle"
      })}
    `;
  }

  function cardTile(card) {
    const schedule = cardSchedule(card);
    const cutWhen = relativeClass(schedule.nextCut);
    const dueWhen = relativeClass(schedule.due);
    return `
      <button type="button" class="card-tile accent-${card.accent}" data-action="open-card" data-id="${card.id}" aria-label="${escapeHTML(`${card.name} kart detayını aç`)}">
        <span class="tile-top">
          <span class="tile-badge">${escapeHTML(initials(card.name))}</span>
          <span class="tile-heading">
            <span class="tile-name">${escapeHTML(card.name)}</span>
            <span class="tile-sub">Kesim her ayın ${card.cutDay}. günü</span>
          </span>
          ${icon("chevron", "chevron")}
        </span>
        <span class="tile-debt">
          <span>
            <span class="debt-label">Güncel borç</span>
            <span class="debt-value">${formatMoney(card.debt)}</span>
          </span>
          <span class="debt-updated">${updatedText(card.debtUpdatedAt) ? `${updatedText(card.debtUpdatedAt)} güncellendi` : ""}</span>
        </span>
        <span class="tile-schedule">
          <span class="schedule-cell${cutWhen === "is-soon" ? " is-soon" : ""}">
            <span class="schedule-label">Sonraki ekstre</span>
            <span class="schedule-date">${formatShort(schedule.nextCut)}</span>
            <span class="schedule-when">${relativeDays(schedule.nextCut)}</span>
          </span>
          <span class="schedule-cell${dueWhen === "is-soon" ? " is-soon" : ""}">
            <span class="schedule-label">Son ödeme</span>
            <span class="schedule-date">${formatShort(schedule.due)}</span>
            <span class="schedule-when">${relativeDays(schedule.due)}</span>
          </span>
        </span>
      </button>
    `;
  }

  /* ---------------------------------------------------------
     Loans page
     --------------------------------------------------------- */

  function loansPage() {
    const totals = getTotals();
    return `
      ${pageHead({
        eyebrow: "TAKSİTLİ ÖDEMELER",
        title: "Taksitler",
        subtitle: data.loans.length ? `${activeLoanCount()} aktif kredi · ${totals.remainingInstallments} taksit kaldı` : "Kredi ve taksitli alışverişlerini takip et.",
        action: { label: "Ekle", action: "add-loan" }
      })}
      ${data.loans.length ? `
        <div class="summary-strip">
          <div>
            <span class="summary-strip-label">Kalan taksit borcu</span>
            <strong class="summary-strip-value">${formatMoney(totals.loanTotal)}</strong>
          </div>
          <div class="summary-strip-side">
            ${totals.remainingInstallments} taksit<br>
            ${activeLoanCount()} aktif kredi
          </div>
        </div>
        <div class="stack">
          ${data.loans
            .slice()
            .sort((a, b) => {
              if ((a.remaining === 0) !== (b.remaining === 0)) return a.remaining === 0 ? 1 : -1;
              return (parseYMD(a.nextDate) || today()) - (parseYMD(b.nextDate) || today());
            })
            .map(loanTile)
            .join("")}
        </div>
      ` : emptyState({
        iconName: "layers",
        title: "Henüz taksit yok",
        text: "Kalan taksit sayısını, taksit tutarını ve sonraki ödeme tarihini gir. Ödeme aldıkça Kese geri kalanını hesaplasın.",
        action: "add-loan",
        actionLabel: "İlk taksitini ekle"
      })}
    `;
  }

  function loanTile(loan) {
    const complete = loan.remaining <= 0;
    const next = parseYMD(loan.nextDate) || today();
    const total = loan.totalInstallments;
    const paid = total ? Math.max(0, total - loan.remaining) : null;
    const progress = total ? Math.round((paid / total) * 100) : 0;
    const nextClass = relativeClass(next);
    const progressLabel = total
      ? (paid === 0 ? "Henüz başlamadı" : `${paid}/${total} ödendi`)
      : "";
    return `
      <article class="loan-tile${complete ? " is-complete" : ""}" data-action="open-loan" data-id="${loan.id}" role="button" tabindex="0" aria-label="${escapeHTML(`${loan.name} taksit detayını aç`)}">
        <div class="tile-top">
          <span class="tile-badge">${icon("layers")}</span>
          <span class="tile-heading">
            <span class="tile-name">${escapeHTML(loan.name)}</span>
            <span class="tile-sub">${total ? `${total} taksitlik plan` : "Aylık taksit ödemesi"}</span>
          </span>
          ${complete ? `<span class="complete-chip">${icon("check")}Tamamlandı</span>` : icon("chevron", "chevron")}
        </div>
        <div class="loan-metrics">
          <div class="loan-metric">
            <div class="loan-metric-label">Kalan taksit</div>
            <div class="loan-metric-value">${loan.remaining} <small>taksit</small></div>
          </div>
          <div class="loan-metric loan-metric--money">
            <div class="loan-metric-label">Taksit tutarı</div>
            <div class="loan-metric-value">${formatMoney(loan.amount)}</div>
          </div>
        </div>
        ${total ? `
          <div class="progress-wrap">
            <div class="progress-meta"><span>${progressLabel}</span><strong>%${progress}</strong></div>
            <div class="progress-track"><div class="progress-fill" style="--progress:${progress}%"></div></div>
          </div>
        ` : ""}
        <div class="loan-foot">
          ${complete ? `
            <span class="complete-chip">${icon("checkCircle")}Tüm taksitler ödendi</span>
          ` : `
            <div class="next-payment">
              ${icon("calendar")}
              <div>
                <div class="next-payment-label">Sonraki taksit</div>
                <div class="next-payment-date">${formatShort(next)} <span class="rel ${nextClass}">${relativeDays(next)}</span></div>
              </div>
            </div>
            <button type="button" class="pay-btn" data-action="pay-loan" data-id="${loan.id}" aria-label="${escapeHTML(`${loan.name} taksitini ödendi olarak işaretle`)}">${icon("check")}Ödendi</button>
          `}
        </div>
      </article>
    `;
  }

  /* ---------------------------------------------------------
     Recurring page
     --------------------------------------------------------- */

  function recurringPage() {
    const now = today();
    const monthlyRecurring = data.recurrings.filter((item) => {
      const date = parseYMD(item.nextDate);
      return date && sameMonth(date, now);
    });
    const monthlyTotal = sum(monthlyRecurring, (item) => item.amount);
    return `
      ${pageHead({
        eyebrow: "DÜZENLİ ÖDEMELER",
        title: "Düzenli",
        subtitle: "Kira, faturalar ve abonelikler tek yerde.",
        action: { label: "Ekle", action: "add-recurring" }
      })}
      ${data.recurrings.length ? `
        <div class="summary-strip">
          <div>
            <span class="summary-strip-label">Bu ay ödenecek</span>
            <strong class="summary-strip-value">${formatMoney(monthlyTotal)}</strong>
          </div>
          <div class="summary-strip-side">
            ${monthlyRecurring.length} kalem<br>
            ${data.recurrings.length} düzenli ödeme
          </div>
        </div>
        <div class="stack">
          ${data.recurrings
            .slice()
            .sort((a, b) => (parseYMD(a.nextDate) || today()) - (parseYMD(b.nextDate) || today()))
            .map(recurringTile)
            .join("")}
        </div>
      ` : emptyState({
        iconName: "repeat",
        title: "Henüz düzenli ödeme yok",
        text: "Kira, elektrik, internet veya aboneliklerini ekle. Ödendi işaretlediğinde sonraki tarih otomatik ilerler.",
        action: "add-recurring",
        actionLabel: "İlk ödemeni ekle"
      })}
    `;
  }

  function recurringTile(recurringItem) {
    const category = CATEGORIES[recurringItem.category] || CATEGORIES.diger;
    const next = parseYMD(recurringItem.nextDate) || today();
    const overdue = next < today();
    const whenClass = relativeClass(next);
    return `
      <article class="rec-tile accent-${category.accent}${overdue ? " is-overdue" : ""}" data-action="open-recurring" data-id="${recurringItem.id}" role="button" tabindex="0" aria-label="${escapeHTML(`${recurringItem.name} ödeme detayını aç`)}">
        <span class="rec-icon">${icon(category.icon)}</span>
        <span class="rec-main">
          <span class="rec-name">${escapeHTML(recurringItem.name)}</span>
          <span class="rec-meta">${escapeHTML(category.label)}<span class="rec-meta-dot"></span>${escapeHTML(FREQS[recurringItem.freq].short)}<span class="rec-meta-dot"></span>${formatShort(next)}</span>
        </span>
        <span class="rec-right">
          <span class="rec-amount">${formatMoney(recurringItem.amount)}</span>
          <span class="rec-next ${whenClass}">${relativeDays(next)}</span>
          <button type="button" class="rec-pay" data-action="pay-recurring" data-id="${recurringItem.id}" aria-label="${escapeHTML(`${recurringItem.name} ödendi olarak işaretle`)}">${icon("check")}Ödendi</button>
        </span>
      </article>
    `;
  }

  /* ---------------------------------------------------------
     Forms
     --------------------------------------------------------- */

  function fieldError(name) {
    return `<p class="field-error" data-error-for="${name}" role="alert"></p>`;
  }

  function cardFormBody(card) {
    const cutDay = card ? card.cutDay : today().getDate();
    const dueOffset = card ? card.dueOffset : 10;
    const accent = card ? card.accent : ACCENT_KEYS[data.cards.length % ACCENT_KEYS.length];
    const dayOptions = Array.from({ length: 31 }, (_, index) => index + 1)
      .map((day) => `<option value="${day}"${day === cutDay ? " selected" : ""}>${day}</option>`)
      .join("");
    const accents = ACCENT_KEYS.map((key) => `
      <label class="accent-option accent-${key}" aria-label="${escapeHTML(ACCENT_LABELS[key])}">
        <input type="radio" name="accent" value="${key}"${key === accent ? " checked" : ""}>
        <span class="accent-dot">${icon("check")}</span>
      </label>
    `).join("");

    return `
      <form id="sheetForm" class="sheet-body" data-form="card" data-id="${card ? card.id : ""}" novalidate>
        <div class="field" data-field="name">
          <label class="field-label" for="cardName">Kart adı</label>
          <input class="input" id="cardName" name="name" type="text" maxlength="60" placeholder="Örn. Garanti Bonus" value="${card ? escapeHTML(card.name) : ""}" autocomplete="off" autocapitalize="words" enterkeyhint="next">
          ${fieldError("name")}
        </div>
        <div class="field-row">
          <div class="field" data-field="cutDay">
            <label class="field-label" for="cutDay">Kesim günü</label>
            <select class="select" id="cutDay" name="cutDay">${dayOptions}</select>
            ${fieldError("cutDay")}
            <p class="hint">Kısa aylarda ayın son günü kullanılır.</p>
          </div>
          <div class="field" data-field="dueOffset">
            <label class="field-label" for="dueOffset">Son ödeme</label>
            <div class="input-wrap input-wrap--suffix">
              <input class="input" id="dueOffset" name="dueOffset" type="number" min="0" max="30" step="1" inputmode="numeric" value="${dueOffset}">
              <span class="input-suffix">gün sonra</span>
            </div>
            ${fieldError("dueOffset")}
            <p class="hint">Kesimden kaç gün sonra?</p>
          </div>
        </div>
        <div class="field" data-field="debt">
          <label class="field-label" for="cardDebt">Güncel borç <span class="optional">sonradan güncellenebilir</span></label>
          <div class="input-wrap">
            <span class="input-prefix">₺</span>
            <input class="input" id="cardDebt" name="debt" type="text" inputmode="decimal" placeholder="0" value="${card ? formatMoneyInput(card.debt) : ""}" autocomplete="off">
          </div>
          ${fieldError("debt")}
          <p class="hint">Kart ekstresindeki tutarı elle gir. Boş bırakırsan 0 kabul edilir.</p>
        </div>
        <div class="form-preview" id="formPreview">
          ${icon("calendar")}
          <span data-preview-text>Ekstre tarihleri burada görünecek.</span>
        </div>
        <div class="field" data-field="accent">
          <div class="field-label">Kart rengi</div>
          <div class="accent-picker">${accents}</div>
        </div>
      </form>
    `;
  }

  function loanFormBody(loan) {
    return `
      <form id="sheetForm" class="sheet-body" data-form="loan" data-id="${loan ? loan.id : ""}" novalidate>
        <div class="field" data-field="name">
          <label class="field-label" for="loanName">Ödeme adı</label>
          <input class="input" id="loanName" name="name" type="text" maxlength="60" placeholder="Örn. İhtiyaç kredisi" value="${loan ? escapeHTML(loan.name) : ""}" autocomplete="off" autocapitalize="words" enterkeyhint="next">
          ${fieldError("name")}
        </div>
        <div class="field-row">
          <div class="field" data-field="remaining">
            <label class="field-label" for="loanRemaining">Kalan taksit</label>
            <input class="input" id="loanRemaining" name="remaining" type="number" min="0" max="600" step="1" inputmode="numeric" placeholder="8" value="${loan ? loan.remaining : ""}">
            ${fieldError("remaining")}
          </div>
          <div class="field" data-field="amount">
            <label class="field-label" for="loanAmount">Taksit tutarı</label>
            <div class="input-wrap">
              <span class="input-prefix">₺</span>
              <input class="input" id="loanAmount" name="amount" type="text" inputmode="decimal" placeholder="0" value="${loan ? formatMoneyInput(loan.amount) : ""}" autocomplete="off">
            </div>
            ${fieldError("amount")}
          </div>
        </div>
        <div class="field" data-field="nextDate">
          <label class="field-label" for="loanNextDate">Sonraki taksit tarihi</label>
          <input class="input" id="loanNextDate" name="nextDate" type="date" value="${loan ? loan.nextDate : ymd(today())}">
          ${fieldError("nextDate")}
          <p class="hint">Taksit ödendi dedikçe bir ay ileri alınır.</p>
        </div>
        <div class="field" data-field="totalInstallments">
          <label class="field-label" for="loanTotal">Toplam taksit <span class="optional">isteğe bağlı</span></label>
          <input class="input" id="loanTotal" name="totalInstallments" type="number" min="1" max="600" step="1" inputmode="numeric" placeholder="Örn. 12" value="${loan && loan.totalInstallments ? loan.totalInstallments : ""}">
          ${fieldError("totalInstallments")}
          <p class="hint">İlerleme çubuğu için toplam taksit sayısı.</p>
        </div>
        <div class="form-preview" id="formPreview">
          ${icon("layers")}
          <span data-preview-text>Taksit bilgileri burada özetlenecek.</span>
        </div>
      </form>
    `;
  }

  function recurringFormBody(recurringItem) {
    const category = recurringItem ? recurringItem.category : "kira";
    const freq = recurringItem ? recurringItem.freq : "monthly";
    const categories = Object.entries(CATEGORIES).map(([key, value]) => `
      <label class="chip-option">
        <input type="radio" name="category" value="${key}"${key === category ? " checked" : ""}>
        <span>${icon(value.icon)}${escapeHTML(value.label)}</span>
      </label>
    `).join("");
    const freqs = Object.entries(FREQS).map(([key, value]) => `
      <label class="chip-option">
        <input type="radio" name="freq" value="${key}"${key === freq ? " checked" : ""}>
        <span>${escapeHTML(value.label)}</span>
      </label>
    `).join("");

    return `
      <form id="sheetForm" class="sheet-body" data-form="recurring" data-id="${recurringItem ? recurringItem.id : ""}" novalidate>
        <div class="field" data-field="name">
          <label class="field-label" for="recName">Ödeme adı</label>
          <input class="input" id="recName" name="name" type="text" maxlength="60" placeholder="Örn. Kira, elektrik, Netflix" value="${recurringItem ? escapeHTML(recurringItem.name) : ""}" autocomplete="off" autocapitalize="words" enterkeyhint="next">
          ${fieldError("name")}
        </div>
        <div class="field" data-field="amount">
          <label class="field-label" for="recAmount">Tutar</label>
          <div class="input-wrap">
            <span class="input-prefix">₺</span>
            <input class="input" id="recAmount" name="amount" type="text" inputmode="decimal" placeholder="0" value="${recurringItem ? formatMoneyInput(recurringItem.amount) : ""}" autocomplete="off">
          </div>
          ${fieldError("amount")}
        </div>
        <div class="field" data-field="category">
          <div class="field-label">Kategori</div>
          <div class="chips">${categories}</div>
          ${fieldError("category")}
        </div>
        <div class="field" data-field="freq">
          <div class="field-label">Tekrar sıklığı</div>
          <div class="chips">${freqs}</div>
          ${fieldError("freq")}
        </div>
        <div class="field" data-field="nextDate">
          <label class="field-label" for="recNextDate">Sonraki ödeme tarihi</label>
          <input class="input" id="recNextDate" name="nextDate" type="date" value="${recurringItem ? recurringItem.nextDate : ymd(today())}">
          ${fieldError("nextDate")}
          <p class="hint">Ödendi işaretledikçe seçtiğin sıklıkta ilerler.</p>
        </div>
        <div class="form-preview" id="formPreview">
          ${icon("repeat")}
          <span data-preview-text>Sonraki ödeme tarihleri burada görünecek.</span>
        </div>
      </form>
    `;
  }

  function bindFormPreview() {
    const form = $("#sheetForm");
    if (form) updateFormPreview(form);
  }

  function updateFormPreview(form) {
    if (!form) return;
    const text = $("[data-preview-text]", form);
    if (!text) return;
    const formType = form.dataset.form;

    if (formType === "card") {
      const cutDay = Number(form.elements.cutDay.value);
      const offsetRaw = form.elements.dueOffset.value.trim();
      const offset = offsetRaw === "" ? 10 : Number(offsetRaw);
      if (!Number.isFinite(cutDay) || cutDay < 1 || cutDay > 31) return;
      const nextCut = nextOnDay(cutDay);
      const due = addDays(nextCut, Number.isFinite(offset) ? clamp(offset, 0, 30) : 10);
      text.innerHTML = `Sonraki ekstre <strong>${formatShort(nextCut)}</strong> · tahmini son ödeme <strong>${formatShort(due)}</strong>.`;
      return;
    }

    if (formType === "loan") {
      const remaining = Number(form.elements.remaining.value);
      const amount = parseMoney(form.elements.amount.value);
      const date = parseYMD(form.elements.nextDate.value);
      if (!date || !Number.isFinite(remaining) || remaining < 1 || amount == null || amount < 1) {
        text.textContent = "Kalan taksit, tutar ve tarihi girdiğinde özet burada görünür.";
        return;
      }
      const total = Number(form.elements.totalInstallments.value);
      let extra = "";
      if (Number.isFinite(total) && total >= remaining) {
        extra = ` · ${total} taksitlik planın ${total - Math.trunc(remaining)} taksiti ödenmiş olur.`;
      }
      text.innerHTML = `Kalan toplam <strong>${formatMoney(Math.trunc(remaining) * amount)}</strong> · sonraki taksit <strong>${formatShort(date)}</strong>${extra}`;
      return;
    }

    if (formType === "recurring") {
      const date = parseYMD(form.elements.nextDate.value);
      const freqInput = form.querySelector('input[name="freq"]:checked');
      const freq = freqInput ? freqInput.value : "monthly";
      if (!date) {
        text.textContent = "Bir tarih seçtiğinde sonraki ödemeler burada görünür.";
        return;
      }
      const dates = nextRecurringDates(date, freq, 3);
      text.innerHTML = `Sonraki ödemeler: <strong>${dates.map(formatShort).join(", ")}</strong>.`;
    }
  }

  function nextRecurringDates(date, freq, count) {
    const dates = [];
    let current = date;
    for (let index = 0; index < count; index += 1) {
      dates.push(current);
      if (freq === "weekly") current = addDays(current, 7);
      else current = addMonthsClamped(current, FREQS[freq].months, date.getDate());
    }
    return dates;
  }

  /* ---------------------------------------------------------
     Detail sheets
     --------------------------------------------------------- */

  function detailActions({ type, id, complete = false }) {
    return `
      <div class="action-stack">
        ${!complete ? "" : ""}
        <div class="action-grid">
          <button type="button" class="btn btn-secondary" data-action="edit-${type}" data-id="${id}">${icon("pencil")}Düzenle</button>
          <button type="button" class="btn btn-danger" data-action="delete-${type}" data-id="${id}">${icon("trash")}Sil</button>
        </div>
      </div>
    `;
  }

  function cardDetailBody(card) {
    const schedule = cardSchedule(card);
    const cutClass = relativeClass(schedule.nextCut);
    const dueClass = relativeClass(schedule.due);
    const updated = isoDate(card.debtUpdatedAt);
    return `
      <div class="sheet-body">
        <div class="detail-amount-block">
          <div class="detail-amount-label">Güncel borç</div>
          <div class="detail-amount">${moneyVisual(card.debt)}</div>
          <div class="detail-amount-sub">${updated ? `Son güncelleme: ${formatLong(startOfDay(new Date(updated)))}` : "Henüz güncellenmedi"}</div>
        </div>

        <div class="debt-box">
          <div class="debt-box-head">
            <span class="debt-box-title">Borcu güncelle <span>· elle</span></span>
          </div>
          <form class="debt-form" data-form="debt" data-id="${card.id}" novalidate>
            <div class="input-wrap">
              <span class="input-prefix">₺</span>
              <input class="input" name="debt" type="text" inputmode="decimal" value="${formatMoneyInput(card.debt)}" aria-label="Güncel kart borcu" autocomplete="off">
            </div>
            <button type="submit" class="btn btn-primary btn-xs">Güncelle</button>
          </form>
          <p class="debt-error field-error" id="debtError" role="alert"></p>
          <div class="debt-quick">
            <button type="button" data-action="zero-debt" data-id="${card.id}">0 TL yap</button>
          </div>
        </div>

        <div class="schedule-card">
          <div>
            <div class="sc-label">Sonraki ekstre</div>
            <div class="sc-date">${formatShort(schedule.nextCut)}</div>
            <div class="sc-when ${cutClass}">${relativeDays(schedule.nextCut)}</div>
          </div>
          <div>
            <div class="sc-label">Son ödeme</div>
            <div class="sc-date">${formatShort(schedule.due)}</div>
            <div class="sc-when ${dueClass}">${relativeDays(schedule.due)}</div>
          </div>
        </div>

        <div class="info-list">
          <div class="info-row"><span class="info-label">Kesim günü</span><span class="info-value">Her ayın ${card.cutDay}. günü</span></div>
          <div class="info-row"><span class="info-label">Ödeme vadesi</span><span class="info-value">Kesimden ${card.dueOffset} gün sonra</span></div>
          <div class="info-row"><span class="info-label">Kart rengi</span><span class="info-value">${escapeHTML(ACCENT_LABELS[card.accent] || "Mint")}</span></div>
        </div>

        <div class="detail-note">${icon("info")}<span>Son ödeme tarihi, kesim tarihine ${card.dueOffset} gün eklenerek hesaplanır. Borcu istediğin zaman güncelleyebilirsin.</span></div>

        ${detailNotifyRow("card", card)}

        ${detailActions({ type: "card", id: card.id })}
      </div>
    `;
  }

  function loanDetailBody(loan) {
    const complete = loan.remaining <= 0;
    const total = loan.totalInstallments;
    const paid = total ? Math.max(0, total - loan.remaining) : null;
    const progress = total ? Math.round((paid / total) * 100) : 0;
    const next = parseYMD(loan.nextDate) || today();
    const nextClass = relativeClass(next);
    const totalLeft = loan.amount * loan.remaining;
    return `
      <div class="sheet-body">
        <div class="detail-amount-block">
          <div class="detail-amount-label">Kalan toplam borç</div>
          <div class="detail-amount">${moneyVisual(totalLeft)}</div>
          <div class="detail-amount-sub">${complete ? "Tüm taksitler ödendi" : `${loan.remaining} taksit × ${formatMoney(loan.amount)}`}</div>
        </div>

        ${total ? `
          <div class="progress-detail">
            <div class="progress-meta"><span>${paid}/${total} taksit ödendi</span><strong>%${progress}</strong></div>
            <div class="progress-track"><div class="progress-fill" style="--progress:${progress}%"></div></div>
          </div>
        ` : ""}

        ${complete ? `
          <div class="completed-banner">${icon("checkCircle")}<span>Bu taksitli ödeme tamamlandı. Kayıt arşivinde kalır.</span></div>
        ` : `
          <div class="schedule-card">
            <div>
              <div class="sc-label">Sonraki taksit</div>
              <div class="sc-date">${formatShort(next)}</div>
              <div class="sc-when ${nextClass}">${relativeDays(next)}</div>
            </div>
            <div>
              <div class="sc-label">Aylık taksit</div>
              <div class="sc-date">${formatMoney(loan.amount)}</div>
              <div class="sc-when">Her ay</div>
            </div>
          </div>
        `}

        <div class="info-list">
          <div class="info-row"><span class="info-label">Kalan taksit</span><span class="info-value">${loan.remaining}</span></div>
          <div class="info-row"><span class="info-label">Toplam taksit</span><span class="info-value">${total ? total : "Belirtilmedi"}</span></div>
          ${total ? `<div class="info-row"><span class="info-label">Ödenen taksit</span><span class="info-value">${paid}</span></div>` : ""}
          <div class="info-row"><span class="info-label">Taksit tutarı</span><span class="info-value">${formatMoney(loan.amount)}</span></div>
        </div>

        ${!complete ? `<div class="detail-note">${icon("repeat")}<span>“Taksit ödendi” dediğinde kalan taksit bir azalır, sonraki tarih bir ay ileri gider.</span></div>` : ""}

        ${!complete ? detailNotifyRow("loan", loan) : ""}

        <div class="action-stack">
          ${!complete ? `<button type="button" class="btn btn-primary btn-block" data-action="pay-loan" data-id="${loan.id}">${icon("check")}Taksit ödendi</button>` : ""}
          <div class="action-grid">
            <button type="button" class="btn btn-secondary" data-action="edit-loan" data-id="${loan.id}">${icon("pencil")}Düzenle</button>
            <button type="button" class="btn btn-danger" data-action="delete-loan" data-id="${loan.id}">${icon("trash")}Sil</button>
          </div>
        </div>
      </div>
    `;
  }

  function recurringDetailBody(recurringItem) {
    const category = CATEGORIES[recurringItem.category] || CATEGORIES.diger;
    const next = parseYMD(recurringItem.nextDate) || today();
    const overdue = next < today();
    const nextClass = relativeClass(next);
    return `
      <div class="sheet-body">
        <div class="detail-amount-block">
          <div class="detail-amount-label">Ödeme tutarı</div>
          <div class="detail-amount">${moneyVisual(recurringItem.amount)}</div>
          <div class="detail-amount-sub">${escapeHTML(category.label)} · ${escapeHTML(FREQS[recurringItem.freq].short)}</div>
        </div>

        ${overdue ? `
          <div class="detail-note is-warning">${icon("alert")}<span>Bu ödemenin tarihi geçti. Ödediysen “Ödendi” olarak işaretle; sonraki tarih otomatik ilerlesin.</span></div>
        ` : ""}

        <div class="schedule-card">
          <div>
            <div class="sc-label">Sonraki ödeme</div>
            <div class="sc-date">${formatShort(next)}</div>
            <div class="sc-when ${nextClass}">${relativeDays(next)}</div>
          </div>
          <div>
            <div class="sc-label">Sıklık</div>
            <div class="sc-date">${escapeHTML(FREQS[recurringItem.freq].short)}</div>
            <div class="sc-when">${escapeHTML(FREQS[recurringItem.freq].label)}</div>
          </div>
        </div>

        <div class="info-list">
          <div class="info-row"><span class="info-label">Kategori</span><span class="info-value">${escapeHTML(category.label)}</span></div>
          <div class="info-row"><span class="info-label">Tekrar</span><span class="info-value">${escapeHTML(FREQS[recurringItem.freq].label)}</span></div>
          ${recurringItem.freq !== "weekly" ? `<div class="info-row"><span class="info-label">Ödeme günü</span><span class="info-value">Her ayın ${recurringItem.anchorDay}. günü</span></div>` : ""}
        </div>

        <div class="detail-note">${icon("repeat")}<span>“Ödendi” dediğinde sonraki ödeme tarihi ${escapeHTML(FREQS[recurringItem.freq].label.toLocaleLowerCase("tr-TR"))} otomatik ilerler.</span></div>

        ${detailNotifyRow("recurring", recurringItem)}

        <div class="action-stack">
          <button type="button" class="btn btn-primary btn-block" data-action="pay-recurring" data-id="${recurringItem.id}">${icon("check")}Ödendi olarak işaretle</button>
          <div class="action-grid">
            <button type="button" class="btn btn-secondary" data-action="edit-recurring" data-id="${recurringItem.id}">${icon("pencil")}Düzenle</button>
            <button type="button" class="btn btn-danger" data-action="delete-recurring" data-id="${recurringItem.id}">${icon("trash")}Sil</button>
          </div>
        </div>
      </div>
    `;
  }

  /* ---------------------------------------------------------
     Settings
     --------------------------------------------------------- */

  function isStandalone() {
    return Boolean(
      (window.navigator && window.navigator.standalone) ||
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
    );
  }

  function switchControl({ checked, action, label, disabled = false, attrs = "" }) {
    return `<button type="button" class="switch${checked ? " is-on" : ""}" role="switch" aria-checked="${checked ? "true" : "false"}" aria-label="${escapeHTML(label)}" data-action="${action}"${attrs}${disabled ? " disabled" : ""}></button>`;
  }

  function notificationStatusNote(permission) {
    if (permission === "unsupported") {
      return {
        icon: "alert",
        text: "Bu tarayıcı sistem bildirimlerini desteklemiyor. Takvime hatırlatma ekleyerek iPhone'da bildirim alabilirsin."
      };
    }
    if (permission === "denied") {
      return {
        icon: "alert",
        text: "Bildirim izni kapalı. Tarayıcı veya telefon ayarlarından Kese'ye izin vermen gerekiyor."
      };
    }
    if (!settings.notifications.enabled) {
      return {
        icon: "bell",
        text: "Sistem bildirimleri kapalı. Ödeme ve ekstre günlerinde hatırlatmak için aç."
      };
    }
    if (!settings.notifications.cut && !settings.notifications.payment) {
      return {
        icon: "info",
        text: "Bildirimler açık ama hatırlatma türü seçili değil. En az bir türü aç."
      };
    }
    return {
      icon: "bell",
      text: "Ödeme ve ekstre gününde, Kese açıkken bildirim gönderilir. Uygulama kapalıyken hatırlatma için takvime ekle."
    };
  }

  function detailNotifyRow(type, item) {
    const enabled = item.notify !== false;
    const systemOn = settings.notifications.enabled && notificationPermission() === "granted";
    const description = enabled
      ? systemOn
        ? "Bu kayıt için hatırlatma açık."
        : "Hatırlatma açık · sistem bildirimleri kapalı."
      : "Bu kayıt için hatırlatma kapalı.";
    return `
      <div class="settings-list detail-notify-list">
        <div class="settings-row settings-row--toggle">
          <span class="settings-row-icon">${icon("bell")}</span>
          <span class="settings-row-main">
            <span class="settings-row-title">Bildirim</span>
            <span class="settings-row-desc">${escapeHTML(description)}</span>
          </span>
          ${switchControl({
            checked: enabled,
            action: "toggle-entity-notify",
            label: `${item.name} için hatırlatmayı aç veya kapat`,
            attrs: ` data-type="${escapeHTML(type)}" data-id="${escapeHTML(item.id)}"`
          })}
        </div>
      </div>
    `;
  }

  function settingsBody() {
    const permission = notificationPermission();
    const notifications = settings.notifications;
    const status = notificationStatusNote(permission);
    return `
      <div class="sheet-body">
        <div class="settings-brand">
          <span class="brand-mark">${icon("wallet")}</span>
          <div class="settings-brand-main">
            <div class="settings-brand-name">Kese</div>
            <div class="settings-brand-sub">Yerel, sade borç takibi · v${APP_VERSION}</div>
            <div class="settings-counts">
              <span class="settings-count">${data.cards.length} kart</span>
              <span class="settings-count">${data.loans.length} taksit</span>
              <span class="settings-count">${data.recurrings.length} düzenli</span>
            </div>
          </div>
          ${isStandalone() ? `<span class="standalone-chip">${icon("check")}Uygulama</span>` : ""}
        </div>

        <div class="settings-section">
          <h3 class="settings-section-title">Yedekleme</h3>
          <div class="settings-list">
            <button type="button" class="settings-row" data-action="export-backup">
              <span class="settings-row-icon">${icon("download")}</span>
              <span class="settings-row-main">
                <span class="settings-row-title">Yedek al</span>
                <span class="settings-row-desc">Tüm kayıtları JSON dosyası olarak indir.</span>
              </span>
              ${icon("chevron", "settings-chevron")}
            </button>
            <button type="button" class="settings-row" data-action="import-backup">
              <span class="settings-row-icon">${icon("upload")}</span>
              <span class="settings-row-main">
                <span class="settings-row-title">Yedekten yükle</span>
                <span class="settings-row-desc">Daha önce aldığın yedeği geri yükle.</span>
              </span>
              ${icon("chevron", "settings-chevron")}
            </button>
          </div>
          <div class="settings-note">${icon("lock")}<span>Veriler yalnızca bu cihazın tarayıcısında saklanır. Safari verilerini temizlersen kayıtlar silinebilir; ara ara yedek al.</span></div>
          <input type="file" id="importFile" class="sr-only" accept="application/json,.json">
        </div>

        <div class="settings-section">
          <h3 class="settings-section-title">Bildirimler</h3>
          <div class="settings-list">
            <div class="settings-row settings-row--toggle">
              <span class="settings-row-icon">${icon("bell")}</span>
              <span class="settings-row-main">
                <span class="settings-row-title">Sistem bildirimleri</span>
                <span class="settings-row-desc">Ödeme ve ekstre günlerinde bildirim gönder.</span>
              </span>
              ${switchControl({
                checked: notifications.enabled,
                action: "toggle-notifications",
                label: "Sistem bildirimlerini aç veya kapat",
                disabled: permission === "unsupported"
              })}
            </div>
            <div class="settings-row settings-row--toggle">
              <span class="settings-row-icon">${icon("calendar")}</span>
              <span class="settings-row-main">
                <span class="settings-row-title">Ekstre kesim günü</span>
                <span class="settings-row-desc">Kart ekstresi kesildiği gün haber ver.</span>
              </span>
              ${switchControl({
                checked: notifications.cut,
                action: "toggle-notify-cut",
                label: "Ekstre kesim günü hatırlatmasını aç veya kapat"
              })}
            </div>
            <div class="settings-row settings-row--toggle">
              <span class="settings-row-icon">${icon("card")}</span>
              <span class="settings-row-main">
                <span class="settings-row-title">Ödeme günü</span>
                <span class="settings-row-desc">Kart son ödeme, taksit ve düzenli ödeme günlerinde haber ver.</span>
              </span>
              ${switchControl({
                checked: notifications.payment,
                action: "toggle-notify-payment",
                label: "Ödeme günü hatırlatmasını aç veya kapat"
              })}
            </div>
            ${notifications.enabled && permission === "granted" ? `
              <button type="button" class="settings-row" data-action="test-notification">
                <span class="settings-row-icon">${icon("sparkles")}</span>
                <span class="settings-row-main">
                  <span class="settings-row-title">Test bildirimi</span>
                  <span class="settings-row-desc">Bildirimlerin çalıştığını dene.</span>
                </span>
                ${icon("chevron", "settings-chevron")}
              </button>
            ` : ""}
            <button type="button" class="settings-row" data-action="export-calendar">
              <span class="settings-row-icon">${icon("calendar")}</span>
              <span class="settings-row-main">
                <span class="settings-row-title">Takvime hatırlatma ekle</span>
                <span class="settings-row-desc">Uygulama kapalıyken de bildirim için .ics dosyası indir.</span>
              </span>
              ${icon("download", "settings-chevron")}
            </button>
          </div>
          <div class="settings-note">${icon(status.icon)}<span>${escapeHTML(status.text)}</span></div>
        </div>

        <div class="settings-section">
          <h3 class="settings-section-title">iPhone'a kurulum</h3>
          ${isStandalone() ? `
            <ul class="install-steps">
              <li><span class="step-num">${icon("check")}</span><span>Kese uygulama modunda çalışıyor. Çevrimdışı açılmaya hazır.</span></li>
            </ul>
          ` : `
            <ol class="install-steps">
              <li><span class="step-num">1</span><span>Bu sayfayı iPhone'da <strong>Safari</strong> ile aç.</span></li>
              <li><span class="step-num">2</span><span>Alt menüdeki <strong>Paylaş</strong> simgesine dokun.</span></li>
              <li><span class="step-num">3</span><span><strong>Ana Ekrana Ekle</strong> seçeneğini seç ve ekle.</span></li>
              <li><span class="step-num">4</span><span>Kese'yi ana ekrandan aç; tam ekran ve çevrimdışı çalışır.</span></li>
            </ol>
          `}
        </div>

        <div class="settings-section">
          <h3 class="settings-section-title">Veriler</h3>
          <div class="settings-list">
            <button type="button" class="settings-row" data-action="delete-all">
              <span class="settings-row-icon is-danger">${icon("trash")}</span>
              <span class="settings-row-main">
                <span class="settings-row-title is-danger">Tüm verileri sil</span>
                <span class="settings-row-desc">Kart, taksit ve düzenli ödeme kayıtlarını temizle.</span>
              </span>
              ${icon("chevron", "settings-chevron")}
            </button>
          </div>
        </div>

        <p class="settings-version">KESE ${APP_VERSION} · VERİLER CİHAZDA</p>
      </div>
    `;
  }

  /* ---------------------------------------------------------
     Validation
     --------------------------------------------------------- */

  function clearFormErrors(form) {
    $$(".field.has-error", form).forEach((field) => field.classList.remove("has-error"));
    $$(".field-error", form).forEach((error) => {
      error.classList.remove("is-visible");
      error.textContent = "";
    });
    $$("[aria-invalid='true']", form).forEach((input) => input.removeAttribute("aria-invalid"));
  }

  function setFieldError(form, name, message) {
    const field = form.querySelector(`[data-field="${name}"]`);
    const input = form.elements[name];
    if (field) {
      field.classList.add("has-error");
      const error = $(".field-error", field);
      if (error) {
        error.textContent = message;
        error.classList.add("is-visible");
      }
    }
    if (input && typeof input.focus === "function") {
      input.setAttribute("aria-invalid", "true");
    }
  }

  function focusFirstError(form) {
    const field = $(".field.has-error", form);
    const input = field && field.querySelector("input, select, button");
    if (input) input.focus({ preventScroll: false });
  }

  function readName(form) {
    const value = String(form.elements.name ? form.elements.name.value : "").trim();
    if (!value) {
      setFieldError(form, "name", "Bir isim gir.");
      return null;
    }
    return value.slice(0, 60);
  }

  function readDate(form, name, fieldName = "nextDate") {
    const value = String(form.elements[name] ? form.elements[name].value : "");
    const date = parseYMD(value);
    if (!date) {
      setFieldError(form, fieldName, "Geçerli bir tarih seç.");
      return null;
    }
    return date;
  }

  function readMoneyField(form, name, fieldName, { allowZero = false, allowEmpty = false } = {}) {
    const raw = String(form.elements[name] ? form.elements[name].value : "").trim();
    if (!raw && allowEmpty) return 0;
    const value = parseMoney(raw);
    if (value == null || (allowZero ? value < 0 : value <= 0)) {
      setFieldError(form, fieldName, raw ? "Geçerli bir tutar gir." : "Bir tutar gir.");
      return null;
    }
    return value;
  }

  function readChecked(form, name, fallback) {
    const input = form.querySelector(`input[name="${name}"]:checked`);
    return input ? input.value : fallback;
  }

  /* ---------------------------------------------------------
     Form submit
     --------------------------------------------------------- */

  function saveEntityForm(form) {
    const kind = form.dataset.form;
    const id = form.dataset.id || null;
    clearFormErrors(form);

    if (kind === "card") {
      const name = readName(form);
      const cutDay = Number(form.elements.cutDay.value);
      const offsetRaw = String(form.elements.dueOffset.value).trim();
      const dueOffset = offsetRaw === "" ? 10 : Number(offsetRaw);
      const debt = readMoneyField(form, "debt", "debt", { allowZero: true, allowEmpty: true });
      const accent = readChecked(form, "accent", ACCENT_KEYS[data.cards.length % ACCENT_KEYS.length]);
      if (!Number.isInteger(cutDay) || cutDay < 1 || cutDay > 31) {
        setFieldError(form, "cutDay", "1 ile 31 arasında bir gün seç.");
      }
      if (!Number.isInteger(dueOffset) || dueOffset < 0 || dueOffset > 30) {
        setFieldError(form, "dueOffset", "0 ile 30 arasında bir gün gir.");
      }
      if (!name || debt == null) {
        focusFirstError(form);
        return;
      }
      focusFirstError(form);
      if ($(".field.has-error", form)) return;

      const nowIso = new Date().toISOString();
      if (id) {
        const card = data.cards.find((item) => item.id === id);
        if (!card) {
          closeSheet({ animate: false });
          return;
        }
        const debtChanged = card.debt !== debt;
        card.name = name;
        card.cutDay = cutDay;
        card.dueOffset = dueOffset;
        card.debt = debt;
        card.accent = accent;
        if (debtChanged) card.debtUpdatedAt = nowIso;
      } else {
        data.cards.push({
          id: uid("card"),
          name,
          cutDay,
          dueOffset,
          debt,
          accent,
          notify: true,
          createdAt: nowIso,
          debtUpdatedAt: nowIso
        });
      }
      saveData();
      closeSheet();
      render();
      showToast(id ? `${name} güncellendi.` : `${name} eklendi.`, { icon: "checkCircle" });
      return;
    }

    if (kind === "loan") {
      const name = readName(form);
      const remainingRaw = String(form.elements.remaining.value).trim();
      const remaining = Number(remainingRaw);
      const amount = readMoneyField(form, "amount", "amount");
      const nextDate = readDate(form, "nextDate");
      const totalRaw = String(form.elements.totalInstallments.value).trim();
      let total = totalRaw === "" ? null : Number(totalRaw);
      if (!remainingRaw || !Number.isInteger(remaining) || remaining < 0 || remaining > 600) {
        setFieldError(form, "remaining", "0 ile 600 arasında bir taksit sayısı gir.");
      } else if (!id && remaining < 1) {
        setFieldError(form, "remaining", "En az 1 taksit girmelisin.");
      }
      if (totalRaw !== "") {
        if (!Number.isInteger(total) || total < 1 || total > 600) {
          setFieldError(form, "totalInstallments", "1 ile 600 arasında bir sayı gir.");
        } else if (Number.isFinite(remaining) && total < remaining) {
          setFieldError(form, "totalInstallments", "Toplam taksit, kalan taksitten küçük olamaz.");
        }
      } else {
        total = null;
      }
      focusFirstError(form);
      if (!name || amount == null || !nextDate || $(".field.has-error", form)) return;

      const nowIso = new Date().toISOString();
      if (id) {
        const loan = data.loans.find((item) => item.id === id);
        if (!loan) {
          closeSheet({ animate: false });
          return;
        }
        loan.name = name;
        loan.remaining = remaining;
        loan.totalInstallments = total;
        loan.amount = amount;
        loan.nextDate = ymd(nextDate);
        loan.anchorDay = nextDate.getDate();
        loan.completedAt = remaining === 0 ? loan.completedAt || nowIso : null;
      } else {
        data.loans.push({
          id: uid("loan"),
          name,
          remaining,
          totalInstallments: total,
          amount,
          nextDate: ymd(nextDate),
          anchorDay: nextDate.getDate(),
          notify: true,
          createdAt: nowIso,
          completedAt: remaining === 0 ? nowIso : null
        });
      }
      saveData();
      closeSheet();
      render();
      showToast(id ? `${name} güncellendi.` : `${name} eklendi.`, { icon: "checkCircle" });
      return;
    }

    if (kind === "recurring") {
      const name = readName(form);
      const amount = readMoneyField(form, "amount", "amount");
      const nextDate = readDate(form, "nextDate");
      const category = readChecked(form, "category", "diger");
      const freq = readChecked(form, "freq", "monthly");
      focusFirstError(form);
      if (!name || amount == null || !nextDate || $(".field.has-error", form)) return;

      if (id) {
        const item = data.recurrings.find((entry) => entry.id === id);
        if (!item) {
          closeSheet({ animate: false });
          return;
        }
        item.name = name;
        item.amount = amount;
        item.category = category;
        item.freq = freq;
        item.nextDate = ymd(nextDate);
        item.anchorDay = nextDate.getDate();
      } else {
        data.recurrings.push({
          id: uid("recurring"),
          name,
          amount,
          category,
          freq,
          nextDate: ymd(nextDate),
          anchorDay: nextDate.getDate(),
          notify: true,
          createdAt: new Date().toISOString()
        });
      }
      saveData();
      closeSheet();
      render();
      showToast(id ? `${name} güncellendi.` : `${name} eklendi.`, { icon: "checkCircle" });
    }
  }

  function submitDebtForm(form) {
    const id = form.dataset.id;
    const card = data.cards.find((item) => item.id === id);
    if (!card) return;
    const error = document.getElementById("debtError");
    const input = form.elements.debt;
    const raw = String(input.value).trim();
    const value = raw === "" ? 0 : parseMoney(raw);
    if (value == null || value < 0) {
      if (error) {
        error.textContent = "Geçerli bir borç tutarı gir.";
        error.classList.add("is-visible");
      }
      input.setAttribute("aria-invalid", "true");
      input.focus();
      return;
    }
    if (error) {
      error.textContent = "";
      error.classList.remove("is-visible");
    }
    input.removeAttribute("aria-invalid");
    card.debt = value;
    card.debtUpdatedAt = new Date().toISOString();
    saveData();
    render();
    refreshDetailIfOpen("card", id);
    showToast("Kart borcu güncellendi.", { icon: "checkCircle" });
  }

  /* ---------------------------------------------------------
     Payments
     --------------------------------------------------------- */

  function refreshDetailIfOpen(type, id) {
    if (ui.sheet && ui.sheet.kind === `${type}-detail` && ui.sheet.id === id) {
      refreshSheet();
    }
  }

  function payLoan(id) {
    const loan = data.loans.find((item) => item.id === id);
    if (!loan || loan.remaining <= 0) return;
    const snapshot = {
      remaining: loan.remaining,
      nextDate: loan.nextDate,
      completedAt: loan.completedAt
    };
    loan.remaining = Math.max(0, loan.remaining - 1);
    loan.nextDate = advanceLoan(loan);
    loan.completedAt = loan.remaining === 0 ? new Date().toISOString() : null;
    saveData();
    render();
    refreshDetailIfOpen("loan", id);
    const complete = loan.remaining === 0;
    const message = complete
      ? `${loan.name} tamamlandı. Tüm taksitler ödendi.`
      : `${loan.name} ödendi. ${loan.remaining} taksit kaldı.`;
    showToast(message, {
      icon: "checkCircle",
      actionLabel: "Geri al",
      onAction: () => {
        const current = data.loans.find((item) => item.id === id);
        if (!current) return;
        Object.assign(current, snapshot);
        saveData();
        render();
        refreshDetailIfOpen("loan", id);
        showToast("Taksit ödemesi geri alındı.", { icon: "info" });
      }
    });
  }

  function payRecurring(id) {
    const item = data.recurrings.find((entry) => entry.id === id);
    if (!item) return;
    const snapshot = { nextDate: item.nextDate };
    item.nextDate = advanceRecurring(item);
    saveData();
    render();
    refreshDetailIfOpen("recurring", id);
    const next = parseYMD(item.nextDate);
    showToast(`${item.name} ödendi. Sonraki: ${next ? formatShort(next) : "—"}.`, {
      icon: "checkCircle",
      actionLabel: "Geri al",
      onAction: () => {
        const current = data.recurrings.find((entry2) => entry2.id === id);
        if (!current) return;
        current.nextDate = snapshot.nextDate;
        saveData();
        render();
        refreshDetailIfOpen("recurring", id);
        showToast("Ödeme geri alındı.", { icon: "info" });
      }
    });
  }

  function zeroCardDebt(id) {
    const card = data.cards.find((item) => item.id === id);
    if (!card) return;
    if (card.debt === 0) {
      showToast("Kart borcu zaten 0.", { icon: "info" });
      return;
    }
    const snapshot = { debt: card.debt, debtUpdatedAt: card.debtUpdatedAt };
    card.debt = 0;
    card.debtUpdatedAt = new Date().toISOString();
    saveData();
    render();
    refreshDetailIfOpen("card", id);
    showToast("Kart borcu sıfırlandı.", {
      icon: "checkCircle",
      actionLabel: "Geri al",
      onAction: () => {
        const current = data.cards.find((item) => item.id === id);
        if (!current) return;
        current.debt = snapshot.debt;
        current.debtUpdatedAt = snapshot.debtUpdatedAt;
        saveData();
        render();
        refreshDetailIfOpen("card", id);
        showToast("Borç geri yüklendi.", { icon: "info" });
      }
    });
  }

  /* ---------------------------------------------------------
     Delete & clear
     --------------------------------------------------------- */

  function requestDelete(type, id) {
    const config = {
      card: { collection: "cards", title: "Kart", message: "Bu kart ve borç bilgisi kalıcı olarak silinecek." },
      loan: { collection: "loans", title: "Taksit kaydı", message: "Taksit planı ve kalan taksit bilgisi kalıcı olarak silinecek." },
      recurring: { collection: "recurrings", title: "Düzenli ödeme", message: "Bu düzenli ödeme kaydı kalıcı olarak silinecek." }
    }[type];
    if (!config) return;
    const item = data[config.collection].find((entry) => entry.id === id);
    if (!item) return;
    showDialog({
      title: `${item.name} silinsin mi?`,
      message: config.message,
      confirmLabel: "Sil",
      cancelLabel: "Vazgeç",
      icon: "trash",
      danger: true,
      onConfirm: () => {
        data[config.collection] = data[config.collection].filter((entry) => entry.id !== id);
        saveData();
        closeSheet({ animate: false });
        render();
        showToast(`${item.name} silindi.`, { icon: "trash" });
      }
    });
  }

  function requestClearAll() {
    if (recordCount() === 0) {
      showToast("Silinecek kayıt yok.", { icon: "info" });
      return;
    }
    showDialog({
      title: "Tüm veriler silinsin mi?",
      message: `${data.cards.length} kart, ${data.loans.length} taksit ve ${data.recurrings.length} düzenli ödeme kaydı silinecek. Bu işlemden sonra kısa süre geri alabilirsin.`,
      confirmLabel: "Tümünü sil",
      cancelLabel: "Vazgeç",
      icon: "trash",
      danger: true,
      onConfirm: () => {
        const previous = data;
        data = emptyData();
        saveData();
        closeSheet({ animate: false });
        ui.tab = "genel";
        ui.expandedUpcoming = false;
        try {
          history.replaceState(null, "", "#genel");
        } catch (error) {
          /* sessizce geç */
        }
        render({ animate: true, scrollTop: true });
        showToast("Tüm veriler silindi.", {
          icon: "trash",
          actionLabel: "Geri al",
          duration: 10000,
          onAction: () => {
            data = previous;
            saveData();
            render({ animate: true });
            showToast("Veriler geri yüklendi.", { icon: "checkCircle" });
          }
        });
      }
    });
  }

  /* ---------------------------------------------------------
     Backup
     --------------------------------------------------------- */

  function downloadTextFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function exportBackup() {
    const payload = {
      app: "kese",
      schema: SCHEMA_VERSION,
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      data
    };
    downloadTextFile(`kese-yedek-${ymd(today())}.json`, JSON.stringify(payload, null, 2), "application/json");
    showToast("Yedek dosyası indiriliyor.", { icon: "download" });
  }

  async function importBackupFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const normalized = normalizeData(parsed, true);
      const counts = {
        cards: normalized.cards.length,
        loans: normalized.loans.length,
        recurrings: normalized.recurrings.length
      };
      showDialog({
        title: "Yedek geri yüklensin mi?",
        message: `${counts.cards} kart, ${counts.loans} taksit ve ${counts.recurrings} düzenli ödeme bulundu. Mevcut verilerin bu yedekle değiştirilecek.`,
        confirmLabel: "Geri yükle",
        cancelLabel: "Vazgeç",
        icon: "upload",
        danger: false,
        onConfirm: () => {
          data = normalized;
          saveData();
          closeSheet({ animate: false });
          ui.tab = "genel";
          ui.expandedUpcoming = false;
          try {
            history.replaceState(null, "", "#genel");
          } catch (error) {
            /* sessizce geç */
          }
          render({ animate: true, scrollTop: true });
          showToast("Yedek geri yüklendi.", { icon: "checkCircle" });
        }
      });
    } catch (error) {
      console.warn("Kese: yedek okunamadı", error);
      showToast("Bu dosya geçerli bir Kese yedeği değil.", { icon: "alert" });
    }
  }

  /* ---------------------------------------------------------
     Actions
     --------------------------------------------------------- */

  function handleAction(action, target) {
    if (!action) return;
    const id = target.dataset.id || null;
    switch (action) {
      case "go-tab":
        switchTab(target.dataset.tab);
        break;
      case "open-settings":
        openSettings();
        break;
      case "toggle-notifications":
        setNotificationsEnabled(!settings.notifications.enabled);
        break;
      case "toggle-notify-cut":
        toggleNotifyType("cut");
        break;
      case "toggle-notify-payment":
        toggleNotifyType("payment");
        break;
      case "test-notification":
        sendTestNotification();
        break;
      case "export-calendar":
        exportCalendar();
        break;
      case "toggle-entity-notify":
        if (id) toggleEntityNotify(target.dataset.type, id);
        break;
      case "close-sheet":
        closeSheet();
        break;
      case "close-dialog":
        closeDialog();
        break;
      case "confirm-dialog":
        confirmDialog();
        break;
      case "add-card":
        openSheet("card-form");
        break;
      case "add-loan":
        openSheet("loan-form");
        break;
      case "add-recurring":
        openSheet("recurring-form");
        break;
      case "open-card":
        if (id) openSheet("card-detail", id);
        break;
      case "open-loan":
        if (id) openSheet("loan-detail", id);
        break;
      case "open-recurring":
        if (id) openSheet("recurring-detail", id);
        break;
      case "edit-card":
        if (id) openSheet("card-form", id);
        break;
      case "edit-loan":
        if (id) openSheet("loan-form", id);
        break;
      case "edit-recurring":
        if (id) openSheet("recurring-form", id);
        break;
      case "delete-card":
        if (id) requestDelete("card", id);
        break;
      case "delete-loan":
        if (id) requestDelete("loan", id);
        break;
      case "delete-recurring":
        if (id) requestDelete("recurring", id);
        break;
      case "pay-loan":
        if (id) payLoan(id);
        break;
      case "pay-recurring":
        if (id) payRecurring(id);
        break;
      case "zero-debt":
        if (id) zeroCardDebt(id);
        break;
      case "toggle-upcoming":
        ui.expandedUpcoming = !ui.expandedUpcoming;
        render();
        break;
      case "export-backup":
        exportBackup();
        break;
      case "import-backup": {
        const input = document.getElementById("importFile");
        if (input) input.click();
        break;
      }
      case "delete-all":
        requestClearAll();
        break;
      default:
        break;
    }
  }

  /* ---------------------------------------------------------
     Events
     --------------------------------------------------------- */

  function trapFocus(event) {
    const layer = document.getElementById("dialogLayer") || document.getElementById("sheetOverlay");
    if (!layer) return;
    const items = focusableElements(layer);
    if (!items.length) {
      event.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first || !layer.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !layer.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("[data-action]");
      if (!target) return;
      handleAction(target.dataset.action, target);
    });

    document.addEventListener("submit", (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.dataset.form === "debt") {
        event.preventDefault();
        submitDebtForm(form);
        return;
      }
      if (["card", "loan", "recurring"].includes(form.dataset.form)) {
        event.preventDefault();
        saveEntityForm(form);
      }
    });

    const onInput = (event) => {
      const field = event.target.closest(".field.has-error");
      if (field) {
        field.classList.remove("has-error");
        const error = $(".field-error", field);
        if (error) {
          error.classList.remove("is-visible");
          error.textContent = "";
        }
        event.target.removeAttribute("aria-invalid");
      }
      if (event.target.id === "debtInput" || event.target.closest(".debt-form")) {
        const error = document.getElementById("debtError");
        if (error) {
          error.classList.remove("is-visible");
          error.textContent = "";
        }
        event.target.removeAttribute("aria-invalid");
      }
      const form = event.target.closest("form[data-form]");
      if (form && ["card", "loan", "recurring"].includes(form.dataset.form)) {
        updateFormPreview(form);
      }
    };
    document.addEventListener("input", onInput);
    document.addEventListener("change", onInput);

    document.addEventListener("change", (event) => {
      if (event.target && event.target.id === "importFile") {
        const file = event.target.files && event.target.files[0];
        const input = event.target;
        importBackupFile(file).finally(() => {
          input.value = "";
        });
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (document.getElementById("dialogLayer")) closeDialog();
        else if (document.getElementById("sheetOverlay")) closeSheet();
        return;
      }
      if (event.key === "Tab") {
        trapFocus(event);
        return;
      }
      if ((event.key === "Enter" || event.key === " ") && event.target.matches('[role="button"][data-action]')) {
        event.preventDefault();
        event.target.click();
      }
    });
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || !/^https?:$/.test(window.location.protocol)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        console.warn("Kese: service worker kaydedilemedi", error);
      });
    });
  }

  function listenForServiceWorkerMessages() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.addEventListener("message", (event) => {
      const payload = event.data;
      if (!payload || payload.type !== "kese:notification-click") return;
      const tab = payload.tab;
      if (["genel", "kartlar", "taksitler", "duzenli"].includes(tab) && tab !== ui.tab) {
        ui.tab = tab;
        ui.expandedUpcoming = false;
        render({ animate: true, scrollTop: true });
      }
      if (payload.entityType && payload.entityId) {
        const kind = `${payload.entityType}-detail`;
        if (sheetInfo(kind, payload.entityId)) {
          openSheet(kind, payload.entityId);
        }
      }
    });
  }

  function applyHashTab() {
    const hash = window.location.hash.replace("#", "");
    if (!["genel", "kartlar", "taksitler", "duzenli"].includes(hash) || hash === ui.tab) return;
    ui.tab = hash;
    ui.expandedUpcoming = false;
    render({ animate: true, scrollTop: true });
    view.focus({ preventScroll: true });
  }

  function init() {
    if (initialized) return;
    initialized = true;
    data = loadData();
    settings = loadSettings();
    notifyLog = loadNotifyLog();
    const hash = window.location.hash.replace("#", "");
    if (["genel", "kartlar", "taksitler", "duzenli"].includes(hash)) ui.tab = hash;
    bindEvents();
    listenForServiceWorkerMessages();
    render({ animate: true });
    registerServiceWorker();
    checkNotifications();
    window.setTimeout(checkNotifications, 1800);
    window.setInterval(() => {
      if (ymd(today()) !== lastRenderDay) render();
      checkNotifications();
    }, NOTIFICATION_CHECK_MS);
    window.addEventListener("hashchange", applyHashTab);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        if (ymd(today()) !== lastRenderDay) render();
        checkNotifications();
      }
    });
  }

  init();
})();
