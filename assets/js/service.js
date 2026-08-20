/**
 * Tiltable — server wearable demo (service.html only).
 * Click "Simulate an incoming call" to show a table number and a subtle
 * vibration animation on the watch mockup; "Tap to clear" acknowledges it.
 * Auto-clears after a few seconds if left untouched, and fires once on
 * its own when the module scrolls into view so passive visitors see it work.
 */
(function () {
  const watch = document.getElementById('service-watch');
  if (!watch) return;

  const trigger = document.getElementById('watch-trigger');
  const tableEl = watch.querySelector('[data-call-table]');
  const ackBtn = watch.querySelector('[data-acknowledge]');
  const AUTO_CLEAR_MS = 6000;

  let calling = false;
  let clearTimer = null;

  function randomTable() {
    return Math.floor(Math.random() * 22) + 1;
  }

  function simulateCall() {
    if (calling) return;
    calling = true;
    tableEl.textContent = randomTable();
    watch.classList.add('is-calling');
    clearTimeout(clearTimer);
    clearTimer = setTimeout(acknowledge, AUTO_CLEAR_MS);
  }

  function acknowledge() {
    if (!calling) return;
    calling = false;
    watch.classList.remove('is-calling');
    clearTimeout(clearTimer);
  }

  if (trigger) trigger.addEventListener('click', simulateCall);
  if (ackBtn) ackBtn.addEventListener('click', acknowledge);

  // Live idle clock, updated every 30s — a small realism touch, not precision timing.
  const clockEl = document.getElementById('watch-clock');
  function updateClock() {
    if (clockEl) clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  updateClock();
  setInterval(updateClock, 30000);

  // Fire the demo once automatically when it scrolls into view.
  if (!(window.Tiltable && window.Tiltable.prefersReducedMotion) && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(simulateCall, 800);
          io.disconnect();
        }
      });
    }, { threshold: 0.6 });
    io.observe(watch);
  }
})();
