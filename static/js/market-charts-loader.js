(function() {
  'use strict';

  if (window.__MP_CHARTS_RENDERED) return;

  var root = document.getElementById('market-charts-root');
  if (!root) return;

  var chartDataUrl = root.getAttribute('data-chart-data-url');
  if (!chartDataUrl) return;

  var statusContainer = document.getElementById('charts-status-container');
  var loadingUI = document.getElementById('charts-loading-ui');
  var content = document.getElementById('charts-content');

  window.__MP_CHARTS_RENDERED = true;

  function showError(msg) {
    if (statusContainer) statusContainer.dataset.label = 'Error';
    if (loadingUI) {
      loadingUI.innerHTML = '<div style="text-align:center;color:#FF3366">'
        + '<div style="font-weight:700;margin-bottom:0.5rem;font-family:Orbitron,sans-serif;letter-spacing:0.1em">[ DATA_UNAVAILABLE ]</div>'
        + '<div style="font-size:12px;opacity:0.9;font-family:JetBrains Mono,monospace;color:#64748B">' + msg + '</div></div>';
    }
  }

  var timeoutId = setTimeout(function() {
    if (statusContainer && statusContainer.dataset.label === 'Loading') {
      showError('REQUEST TIMEOUT \u2014 RELOAD TO RETRY');
    }
  }, 15000);

  fetch(chartDataUrl)
    .then(function(response) {
      if (!response.ok) throw new Error('HTTP_' + response.status);
      return response.json();
    })
    .then(function(data) {
      window.__MP_CHART_DATA = data;
      document.dispatchEvent(new CustomEvent('mp:chart-data-ready', { detail: data }));
      clearTimeout(timeoutId);

      if (statusContainer) statusContainer.style.display = 'none';
      if (content) {
        content.classList.remove('hidden');
        void content.offsetHeight;
      }

      if (typeof renderAllCharts === 'function') {
        renderAllCharts(data);
      } else {
        console.error('renderAllCharts is not available.');
        showError('CHART RENDERER NOT AVAILABLE');
      }

      if (statusContainer) statusContainer.dataset.label = 'Charts';
    })
    .catch(function(err) {
      clearTimeout(timeoutId);
      console.error('Chart data load failed:', err);
      showError(err.message === 'HTTP_404'
        ? 'MARKET DATA NOT YET PUBLISHED'
        : 'FAILED TO LOAD MARKET DATA');
    });
})();
