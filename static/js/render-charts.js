/**
 * Market Pulse - ECharts 렌더링 (5종 차트)
 * chart-data-YYYY-MM-DD.json을 fetch하여 시각화합니다.
 */

/* globals echarts */

const COLORS = {
  primary: '#1e90ff',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  muted: '#94a3b8',
  bg: '#1a1a2e',
  text: '#e2e8f0',
};

const METRIC_COLORS = {
  SPX: '#1e90ff',
  NDX: '#8b5cf6',
  DJI: '#22c55e',
  VIX: '#ef4444',
  BTC: '#f59e0b',
  USDKRW: '#06b6d4',
  GOLD: '#eab308',
  OIL: '#78716c',
  US10Y: '#ec4899',
};

function isDarkMode() {
  return document.body.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getTheme() {
  const dark = isDarkMode();
  return {
    bg: dark ? '#1a1a2e' : '#ffffff',
    text: dark ? '#e2e8f0' : '#334155',
    axis: dark ? '#475569' : '#cbd5e1',
    tooltip: dark ? '#1e293b' : '#ffffff',
  };
}

function createChart(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  return echarts.init(el, isDarkMode() ? 'dark' : null);
}

// ===== 차트 1: 주요 지표 추이 (이중 Y축 Line) =====
function renderTimeSeries(data) {
  const chart = createChart('chart-timeseries');
  if (!chart || !data.timeSeries) return;

  const { dates, series } = data.timeSeries;

  // 좌축: 지수 (SPX, NDX, DJI), 우축: VIX
  const leftKeys = ['SPX', 'NDX', 'DJI'];
  const rightKeys = ['VIX'];
  const theme = getTheme();

  const seriesConfig = [];
  for (const key of leftKeys) {
    if (!series[key]) continue;
    seriesConfig.push({
      name: key,
      type: 'line',
      data: series[key],
      yAxisIndex: 0,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: METRIC_COLORS[key] },
      itemStyle: { color: METRIC_COLORS[key] },
    });
  }
  for (const key of rightKeys) {
    if (!series[key]) continue;
    seriesConfig.push({
      name: key,
      type: 'line',
      data: series[key],
      yAxisIndex: 1,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, type: 'dashed', color: METRIC_COLORS[key] },
      itemStyle: { color: METRIC_COLORS[key] },
      areaStyle: { color: 'rgba(239,68,68,0.08)' },
    });
  }

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { data: [...leftKeys, ...rightKeys].filter(k => series[k]), textStyle: { color: theme.text } },
    grid: { left: '8%', right: '8%', bottom: '12%' },
    xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: theme.axis } }, axisLabel: { color: theme.text } },
    yAxis: [
      { type: 'value', name: '지수', axisLine: { lineStyle: { color: theme.axis } }, axisLabel: { color: theme.text }, splitLine: { lineStyle: { color: theme.axis, opacity: 0.3 } } },
      { type: 'value', name: 'VIX', axisLine: { lineStyle: { color: METRIC_COLORS.VIX } }, axisLabel: { color: theme.text }, splitLine: { show: false } },
    ],
    series: seriesConfig,
    dataZoom: [{ type: 'inside', start: 0, end: 100 }],
  });

  window.addEventListener('resize', () => chart.resize());
}

// ===== 차트 2: 상관관계 (Horizontal Bar) =====
function renderCorrelations(data) {
  const chart = createChart('chart-correlations');
  if (!chart || !data.correlations || data.correlations.length === 0) {
    const el = document.getElementById('chart-correlations');
    if (el) el.innerHTML = '<p style="text-align:center;color:gray;padding:2rem">상관관계 데이터 없음 (히스토리 부족)</p>';
    return;
  }

  const theme = getTheme();
  const items = data.correlations;
  const labels = items.map(c => c.labels.join(' ↔ '));
  const values = items.map(c => c.value);
  const colors = values.map(v => v > 0.3 ? COLORS.danger : v < -0.3 ? COLORS.primary : COLORS.muted);

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const idx = params[0].dataIndex;
        const c = items[idx];
        return `<b>${c.labels[0]} ↔ ${c.labels[1]}</b><br/>r = ${c.value}<br/>${c.status}: ${c.meaning}`;
      },
    },
    grid: { left: '25%', right: '10%', top: '5%', bottom: '5%' },
    xAxis: {
      type: 'value', min: -1, max: 1,
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text },
      splitLine: { lineStyle: { color: theme.axis, opacity: 0.3 } },
    },
    yAxis: {
      type: 'category', data: labels, inverse: true,
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text, fontSize: 12 },
    },
    series: [{
      type: 'bar',
      data: values.map((v, i) => ({ value: v, itemStyle: { color: colors[i], borderRadius: [0, 4, 4, 0] } })),
      barWidth: '60%',
      label: { show: true, position: 'right', formatter: '{c}', color: theme.text },
    }],
    // 기준선 (r=0)
    markLine: { data: [{ xAxis: 0 }] },
  });

  window.addEventListener('resize', () => chart.resize());
}

// ===== 차트 3: 시장 국면 Gauge =====
function renderRegime(data) {
  const chart = createChart('chart-regime');
  if (!chart || !data.regime) {
    const el = document.getElementById('chart-regime');
    if (el) el.innerHTML = '<p style="text-align:center;color:gray;padding:2rem">시장 국면 데이터 없음</p>';
    return;
  }

  const theme = getTheme();
  const regime = data.regime;

  // Regime을 0-100 스코어로 변환
  const regimeScore = { 'RISK_ON': 85, 'CAUTIOUS': 55, 'RISK_OFF': 30, 'PANIC': 10 };
  const score = regimeScore[regime.current] || 50;

  chart.setOption({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 4,
      axisLine: {
        lineStyle: {
          width: 20,
          color: [
            [0.2, COLORS.danger],
            [0.4, COLORS.warning],
            [0.7, '#94a3b8'],
            [1, COLORS.success],
          ],
        },
      },
      pointer: { itemStyle: { color: 'auto' }, width: 5 },
      axisTick: { show: false },
      splitLine: { length: 12, lineStyle: { color: 'auto', width: 2 } },
      axisLabel: {
        distance: 28,
        color: theme.text,
        fontSize: 11,
        formatter: function (val) {
          if (val <= 15) return 'Panic';
          if (val <= 35) return 'Risk-Off';
          if (val <= 65) return 'Cautious';
          return 'Risk-On';
        },
      },
      title: { show: true, offsetCenter: [0, '70%'], color: theme.text },
      detail: {
        valueAnimation: true,
        formatter: function () { return regime.icon + ' ' + regime.label; },
        color: theme.text,
        fontSize: 18,
        offsetCenter: [0, '45%'],
      },
      data: [{ value: score, name: regime.summary }],
    }],
  });

  // 시그널 표시
  if (regime.signals && regime.signals.length > 0) {
    const el = document.getElementById('chart-regime');
    const signalHtml = regime.signals.map(s =>
      `<span style="margin-right:1rem">${s.assessment} <b>${s.name}</b>: ${s.value} (${s.note})</span>`
    ).join('');
    const div = document.createElement('div');
    div.style.cssText = 'text-align:center;padding:0.5rem;font-size:0.85rem;color:' + theme.text;
    div.innerHTML = signalHtml;
    el.appendChild(div);
  }

  window.addEventListener('resize', () => chart.resize());
}

// ===== 차트 4: 섹터 상대강도 (Horizontal Bar) =====
function renderSectors(data) {
  const chart = createChart('chart-sectors');
  if (!chart || !data.sectorStrength || data.sectorStrength.length === 0) {
    const el = document.getElementById('chart-sectors');
    if (el) el.innerHTML = '<p style="text-align:center;color:gray;padding:2rem">섹터 데이터 없음</p>';
    return;
  }

  const theme = getTheme();
  const sectors = data.sectorStrength;
  const names = sectors.map(s => s.name);
  const week1 = sectors.map(s => s.week1);
  const month1 = sectors.map(s => s.month1);

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['1주 초과수익', '1개월 초과수익'], textStyle: { color: theme.text } },
    grid: { left: '18%', right: '5%', top: '12%', bottom: '5%' },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text, formatter: '{value}%' },
      splitLine: { lineStyle: { color: theme.axis, opacity: 0.3 } },
    },
    yAxis: {
      type: 'category', data: names, inverse: true,
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text },
    },
    series: [
      {
        name: '1주 초과수익',
        type: 'bar',
        data: week1.map(v => ({
          value: v,
          itemStyle: { color: v != null && v > 0 ? COLORS.success : COLORS.danger, borderRadius: [0, 4, 4, 0] },
        })),
      },
      {
        name: '1개월 초과수익',
        type: 'bar',
        data: month1.map(v => ({
          value: v,
          itemStyle: { color: v != null && v > 0 ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)', borderRadius: [0, 4, 4, 0] },
        })),
      },
    ],
  });

  window.addEventListener('resize', () => chart.resize());
}

// ===== 차트 5: 5일 변동 비교 (Bar) =====
function renderFiveDay(data) {
  const chart = createChart('chart-5day');
  if (!chart || !data.fiveDayComparison || data.fiveDayComparison.length === 0) {
    const el = document.getElementById('chart-5day');
    if (el) el.innerHTML = '<p style="text-align:center;color:gray;padding:2rem">5일 비교 데이터 없음</p>';
    return;
  }

  const theme = getTheme();
  const items = data.fiveDayComparison;
  const labels = items.map(i => i.metric);
  const values = items.map(i => i.changePct);

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const idx = params[0].dataIndex;
        const item = items[idx];
        return `<b>${item.metric}</b>: ${item.changePct > 0 ? '+' : ''}${item.changePct.toFixed(2)}%<br/>${item.label}`;
      },
    },
    grid: { left: '10%', right: '5%', top: '10%', bottom: '15%' },
    xAxis: {
      type: 'category', data: labels,
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text, formatter: '{value}%' },
      splitLine: { lineStyle: { color: theme.axis, opacity: 0.3 } },
    },
    series: [{
      type: 'bar',
      data: values.map(v => ({
        value: +v.toFixed(2),
        itemStyle: {
          color: v > 0 ? COLORS.success : COLORS.danger,
          borderRadius: v > 0 ? [4, 4, 0, 0] : [0, 0, 4, 4],
        },
      })),
      label: {
        show: true,
        position: 'top',
        formatter: function (p) { return (p.value > 0 ? '+' : '') + p.value + '%'; },
        color: theme.text,
        fontSize: 11,
      },
    }],
  });

  window.addEventListener('resize', () => chart.resize());
}

// ===== 메인 렌더링 함수 =====
function renderAllCharts(data) {
  renderTimeSeries(data);
  renderCorrelations(data);
  renderRegime(data);
  renderSectors(data);
  renderFiveDay(data);
}
