(function() {
  function updateFooterClock() {
    var clockEl = document.getElementById('mp-footer-clock');
    if (!clockEl) return;
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    var s = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = 'SYS_TIME: ' + h + ':' + m + ':' + s;
  }
  setInterval(updateFooterClock, 1000);
  updateFooterClock();
})();
