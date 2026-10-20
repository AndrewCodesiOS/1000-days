const STORAGE_KEY = "1000-days-v1";
const GOAL = 1000;
const $ = (id) => document.getElementById(id);

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function parseKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}
function shiftKey(key, amount) {
  const d = parseKey(key);
  d.setDate(d.getDate() + amount);
  return localDateKey(d);
}
function formatDate(key, options = { weekday: "short", month: "short", day: "numeric" }) {
  return parseKey(key).toLocaleDateString(undefined, options);
}
function readData() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"entries":{}}');
    if (parsed && parsed.entries && typeof parsed.entries === "object") return parsed;
  } catch (e) {}
  return { entries: {} };
}
let data = readData();
const todayKey = localDateKey();

function getEntry(key) { return data.entries[key] || null; }
function setEntry(key, status) {
  data.entries[key] = { status, updatedAt: new Date().toISOString() };
  save();
  render();
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function ensurePastDaysAreMisses() {
  // A past day without a check-in is a miss. Today remains open until logged.
  let key = data.startDate;
  if (!key) {
    const keys = Object.keys(data.entries).sort();
    if (keys.length) key = keys[0];
    else return;
    data.startDate = key;
  }
  let cursor = key;
  // Guard against corrupt or unexpectedly old data.
  let guard = 0;
  while (cursor < todayKey && guard < 10000) {
    if (!data.entries[cursor]) data.entries[cursor] = { status: "miss", automatic: true };
    cursor = shiftKey(cursor, 1);
    guard++;
  }
  if (guard) save();
}
function sortedKeys() { return Object.keys(data.entries).sort().reverse(); }
function getStats() {
  const entries = Object.entries(data.entries);
  const successes = entries.filter(([, e]) => e.status === "success").length;
  const misses = entries.filter(([, e]) => e.status === "miss").length;
  let streak = 0;
  let cursor = todayKey;
  // If today isn't a success yet, measure the streak from yesterday.
  if (!getEntry(cursor) || getEntry(cursor).status !== "success") cursor = shiftKey(cursor, -1);
  while (getEntry(cursor)?.status === "success" && streak < GOAL) {
    streak++;
    cursor = shiftKey(cursor, -1);
  }
  const progress = Math.min(100, successes / GOAL * 100);
  return {
    successes, misses, streak, progress,
    daysToGo: Math.max(0, GOAL - successes),
    journeyLength: GOAL + misses
  };
}
function render() {
  const stats = getStats();
  $("progressPercent").textContent = `${stats.progress.toFixed(1)}%`;
  $("successCount").textContent = `${stats.successes} / ${GOAL}`;
  $("ringProgress").style.strokeDashoffset = String(515.22 * (1 - stats.progress / 100));
  $("streakCount").textContent = `${stats.streak} ${stats.streak === 1 ? "day" : "days"}`;
  $("journeyLength").textContent = `${stats.journeyLength} days`;
  $("statSuccess").textContent = stats.successes;
  $("daysToGo").textContent = stats.daysToGo;
  $("missCount").textContent = stats.misses;
  $("totalJourney").textContent = stats.journeyLength;
  $("todayHeading").textContent = todayKey === localDateKey() ? "Today" : "Today";
  $("todayDate").textContent = formatDate(todayKey, { month: "short", day: "numeric", year: "numeric" });

  const entry = getEntry(todayKey);
  $("successBtn").classList.toggle("selected", entry?.status === "success");
  $("missBtn").classList.toggle("selected", entry?.status === "miss");
  $("undoBtn").classList.toggle("hidden", !entry);
  if (!entry) $("statusMessage").textContent = "Your day is waiting to be logged.";
  else if (entry.status === "success") $("statusMessage").textContent = "Today counts. You earned +0.1% progress.";
  else $("statusMessage").textContent = "Logged honestly. Your timeline has one extra day.";

  const keys = sortedKeys().slice(0, 7);
  $("historyList").innerHTML = keys.map(key => {
    const e = data.entries[key];
    const good = e.status === "success";
    const label = key === todayKey ? "Today" : key === shiftKey(todayKey, -1) ? "Yesterday" : formatDate(key);
    const detail = e.automatic ? "Automatically marked as missed" : good ? "You showed up for yourself" : "A day to learn from";
    return `<div class="history-item">
      <span class="history-symbol ${good ? "good" : "bad"}">${good ? "✓" : "×"}</span>
      <div class="history-detail"><strong>${label}</strong><small>${detail}</small></div>
      <span class="history-change ${good ? "good" : "bad"}">${good ? "+0.1%" : "+1 day"}</span>
    </div>`;
  }).join("");
  $("emptyHistory").classList.toggle("hidden", keys.length > 0);
}
function downloadData() {
  const blob = new Blob([JSON.stringify({ app: "1000 days", exportedAt: new Date().toISOString(), ...data }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `1000-days-backup-${todayKey}.json`; a.click();
  URL.revokeObjectURL(url);
}
$("successBtn").addEventListener("click", () => {
  if (!data.startDate) data.startDate = todayKey;
  setEntry(todayKey, "success");
});
$("missBtn").addEventListener("click", () => {
  if (!data.startDate) data.startDate = todayKey;
  setEntry(todayKey, "miss");
});
$("undoBtn").addEventListener("click", () => {
  delete data.entries[todayKey];
  save(); render();
});
$("settingsBtn").addEventListener("click", () => $("settingsDialog").showModal());
$("exportBtn").addEventListener("click", downloadData);
$("exportFromSettings").addEventListener("click", downloadData);
$("resetBtn").addEventListener("click", () => {
  if (confirm("Reset all 1000 days progress? This cannot be undone unless you exported a backup.")) {
    data = { entries: {} };
    save(); render(); $("settingsDialog").close();
  }
});

ensurePastDaysAreMisses();
render();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
