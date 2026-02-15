(function() {
  function updateFooterClock() {
    const clockEl = document.getElementById('mp-footer-clock');
    if (!clockEl) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `SYS_TIME: ${h}:${m}:${s}`;
  }
  setInterval(updateFooterClock, 1000);
  updateFooterClock();
})();
