(function() {
  'use strict';

  if (window.__MP_CHARTS_RENDERED) return;
  var config = window.MP_CONFIG || {};
  var labels = config.labels || {};
  var charts = config.charts || {};
  var loadTimeoutMs = Number(charts.load_timeout_ms || 15000);

  var root = document.getElementById('market-charts-root');
  if (!root) return;

  var chartDataUrl = root.getAttribute('data-chart-data-url');
  if (!chartDataUrl) return;

  var statusContainer = document.getElementById('charts-status-container');
  var loadingUI = document.getElementById('charts-loading-ui');
  var content = document.getElementById('charts-content');

  window.__MP_CHARTS_RENDERED = true;

  function buildErrorNode(msg) {
    var wrap = document.createElement('div');
    wrap.className = 'mp-chart-error';

    var title = document.createElement('div');
    title.className = 'mp-chart-error__title';
    title.textContent = labels.chart_data_unavailable || '[ DATA_UNAVAILABLE ]';
    wrap.appendChild(title);

    var body = document.createElement('div');
    body.className = 'mp-chart-error__message';
    body.textContent = msg;
    wrap.appendChild(body);

    return wrap;
  }

  function showError(msg) {
    if (statusContainer) statusContainer.dataset.label = 'Error';
    if (loadingUI) {
      loadingUI.textContent = '';
      loadingUI.appendChild(buildErrorNode(msg));
    }
  }

  var timeoutId = setTimeout(function() {
    if (statusContainer && statusContainer.dataset.label === 'Loading') {
      showError(labels.chart_request_timeout || 'REQUEST TIMEOUT \u2014 RELOAD TO RETRY');
    }
  }, loadTimeoutMs);

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
        showError(labels.chart_renderer_missing || 'CHART RENDERER NOT AVAILABLE');
      }

      if (statusContainer) statusContainer.dataset.label = 'Charts';
    })
    .catch(function(err) {
      clearTimeout(timeoutId);
      console.error('Chart data load failed:', err);
      showError(
        err.message === 'HTTP_404'
          ? (labels.chart_not_published || 'MARKET DATA NOT YET PUBLISHED')
          : (labels.chart_load_failed || 'FAILED TO LOAD MARKET DATA')
      );
    });
})();
