/**
 * Tiltable — dashboard live demo (dashboard.html only).
 * Fully simulated, no backend: a 12-table floor plan spawns "calls" on a
 * random interval, counts elapsed time per call, and auto-resolves each
 * one after a realistic delay unless "Mark served" is clicked first.
 * Tune the constants below to change pacing.
 */
(function () {
  const grid = document.getElementById('demo-floor-grid');
  if (!grid) return;

  const TABLE_COUNT = 12;
  const MAX_CONCURRENT = 4;
  const SPAWN_MIN_MS = 1800;
  const SPAWN_MAX_MS = 4200;
  const AUTO_SERVE_MIN_MS = 4500;
  const AUTO_SERVE_MAX_MS = 9500;
  const HISTORY_LIMIT = 25;

  const avgEl = document.getElementById('stat-avg-response');
  const activeEl = document.getElementById('stat-active-calls');
  const servedEl = document.getElementById('stat-calls-today');

  const tables = [];
  const responseTimes = [];
  let servedCount = 0;
  let timers = []; // all interval/timeout ids, cleared if the demo is torn down

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function fmtClock(ms) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  function buildTable(num) {
    const el = document.createElement('div');
    el.className = 'table-tile';
    el.innerHTML =
      '<span class="ping" aria-hidden="true"></span>' +
      '<span class="t-num tabular">' + num + '</span>' +
      '<span class="t-timer tabular" data-timer></span>' +
      '<button type="button" class="serve-btn">Mark served</button>';
    grid.appendChild(el);

    const table = { num, el, calling: false, startedAt: 0, tickId: null, autoId: null };
    el.querySelector('.serve-btn').addEventListener('click', () => resolveCall(table));
    return table;
  }

  function updateStats() {
    const activeCount = tables.filter((t) => t.calling).length;
    if (activeEl) activeEl.textContent = activeCount;
    if (servedEl) servedEl.textContent = servedCount;
    if (avgEl) {
      avgEl.textContent = responseTimes.length
        ? fmtClock(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : '—';
    }
  }

  function startCall(table) {
    table.calling = true;
    table.startedAt = Date.now();
    table.el.classList.add('is-calling');
    const timerEl = table.el.querySelector('[data-timer]');
    table.tickId = setInterval(() => {
      if (timerEl) timerEl.textContent = fmtClock(Date.now() - table.startedAt);
    }, 1000);
    table.autoId = setTimeout(() => resolveCall(table), rand(AUTO_SERVE_MIN_MS, AUTO_SERVE_MAX_MS));
    timers.push(table.tickId, table.autoId);
    updateStats();
  }

  function resolveCall(table) {
    if (!table.calling) return;
    responseTimes.push(Date.now() - table.startedAt);
    if (responseTimes.length > HISTORY_LIMIT) responseTimes.shift();
    servedCount++;
    table.calling = false;
    clearInterval(table.tickId);
    clearTimeout(table.autoId);
    table.el.classList.remove('is-calling');
    const timerEl = table.el.querySelector('[data-timer]');
    if (timerEl) timerEl.textContent = '';
    updateStats();
  }

  function spawnLoop() {
    const idle = tables.filter((t) => !t.calling);
    const activeCount = tables.length - idle.length;
    if (idle.length && activeCount < MAX_CONCURRENT) {
      startCall(idle[Math.floor(Math.random() * idle.length)]);
    }
    timers.push(setTimeout(spawnLoop, rand(SPAWN_MIN_MS, SPAWN_MAX_MS)));
  }

  for (let i = 1; i <= TABLE_COUNT; i++) tables.push(buildTable(i));
  updateStats();

  // Seed one call immediately so the demo isn't sitting empty on load.
  timers.push(setTimeout(() => startCall(tables[Math.floor(Math.random() * tables.length)]), 600));
  timers.push(setTimeout(spawnLoop, rand(SPAWN_MIN_MS, SPAWN_MAX_MS)));
})();
