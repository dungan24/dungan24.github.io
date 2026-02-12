/**
 * Market Pulse - ECharts 렌더링 (4종 차트: Trend, Correlation, Regime, Sectors)
 * chart-data-YYYY-MM-DD.json을 fetch하여 시각화합니다.
 */

/* globals echarts */

const COLORS = {
  primary: '#7C3AED',
  success: '#FF3366',   // 한국식: 상승 = 빨강
  danger: '#3388FF',    // 한국식: 하락 = 파랑
  warning: '#FFD600',
  muted: '#64748B',
  bg: '#0A0A1A',
  text: '#E2E8F0',
};

const METRIC_COLORS = {
  SPX: '#22d3ee',       /* cyan-400 */
  NDX: '#818cf8',       /* indigo-400 */
  DJI: '#34d399',       /* emerald-400 */
  VIX: '#f87171',       /* red-400 */
  BTC: '#fbbf24',       /* amber-400 */
  USDKRW: '#06b6d4',   /* cyan-500 */
  GOLD: '#eab308',      /* yellow-500 */
  OIL: '#a8a29e',       /* stone-400 */
  US10Y: '#f472b6',     /* pink-400 */
};

const GLASS_TOOLTIP = {
  backgroundColor: 'rgba(10, 10, 26, 0.95)',
  borderColor: 'rgba(124, 58, 237, 0.3)',
  borderWidth: 1,
  borderRadius: 4,
  textStyle: { color: '#E2E8F0', fontSize: 13 },
  extraCssText: 'box-shadow:0 0 15px rgba(124,58,237,0.2),0 8px 32px -8px rgba(0,0,0,0.5)',
};

function isDarkMode() {
  return document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark') ||
    window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function isMobile() {
  return window.innerWidth <= 640;
}

function getTheme() {
  const dark = isDarkMode();
  return {
    bg: dark ? '#0A0A1A' : '#ffffff',
    text: dark ? '#E2E8F0' : '#1E1E3A',
    axis: dark ? '#1E1E3A' : '#cbd5e1',
    tooltip: dark ? '#12122A' : '#ffffff',
    success: dark ? '#FF3366' : '#DC2626',   // 한국식: 상승 = 빨강
    danger: dark ? '#3388FF' : '#2563EB',    // 한국식: 하락 = 파랑
  };
}

function createChart(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  return echarts.init(el, isDarkMode() ? 'dark' : null);
}

// ===== 차트 1: 주요 지표 추이 (이중 Y축 Line, % 변화율 정규화) =====
function renderTimeSeries(data) {
  const chart = createChart('chart-timeseries');
  if (!chart || !data.timeSeries) return;

  const { dates, series } = data.timeSeries;

  // % 변화율 정규화 함수
  function normalizeToPercent(arr) {
    if (!arr || arr.length === 0) return arr;
    const base = arr[0];
    if (base === 0) return arr;
    return arr.map(v => +((v - base) / base * 100).toFixed(2));
  }

  // 좌축: 지수 (SPX, NDX, DJI), 우축: VIX
  const leftKeys = ['SPX', 'NDX', 'DJI'];
  const rightKeys = ['VIX'];
  const theme = getTheme();

  // 원본 데이터 저장 (tooltip용)
  const originalSeries = {};
  for (const key of [...leftKeys, ...rightKeys]) {
    if (series[key]) originalSeries[key] = series[key];
  }

  const seriesConfig = [];
  for (const key of leftKeys) {
    if (!series[key]) continue;
    seriesConfig.push({
      name: key,
      type: 'line',
      data: normalizeToPercent(series[key]),
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
      data: normalizeToPercent(series[key]),
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
    tooltip: {
      ...GLASS_TOOLTIP,
      trigger: 'axis',
      formatter: function(params) {
        if (!params || params.length === 0) return '';
        let html = '<b>' + params[0].axisValue + '</b>';
        params.forEach(p => {
          const key = p.seriesName;
          const idx = p.dataIndex;
          const originalValue = originalSeries[key] ? originalSeries[key][idx] : null;
          const changePct = p.value;
          html += '<br/>' + p.marker + ' ' + key + ': ';
          if (originalValue !== null) {
            html += originalValue.toLocaleString(undefined, {maximumFractionDigits: 2}) + ' ';
          }
          html += '(' + (changePct > 0 ? '+' : '') + changePct + '%)';
        });
        return html;
      }
    },
    legend: {
      data: [...leftKeys, ...rightKeys].filter(k => series[k]),
      textStyle: { color: theme.text, fontSize: isMobile() ? 11 : 13 },
      top: 0,
      itemWidth: isMobile() ? 12 : 25,
      itemGap: isMobile() ? 8 : 15,
    },
    grid: { left: 10, right: 10, bottom: 30, top: isMobile() ? 30 : 40, containLabel: true },
    xAxis: {
      type: 'category', data: dates,
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text, fontSize: isMobile() ? 10 : 12, rotate: isMobile() ? 30 : 0 },
    },
    yAxis: [
      { type: 'value', name: isMobile() ? '' : '변동률(%)', axisLine: { lineStyle: { color: theme.axis } }, axisLabel: { color: theme.text, formatter: '{value}%', fontSize: isMobile() ? 10 : 12 }, splitLine: { lineStyle: { color: theme.axis, opacity: 0.15, type: 'dashed' } } },
      { type: 'value', name: isMobile() ? '' : 'VIX 변동률(%)', axisLine: { lineStyle: { color: METRIC_COLORS.VIX } }, axisLabel: { color: theme.text, formatter: '{value}%', fontSize: isMobile() ? 10 : 12 }, splitLine: { show: false } },
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

  // 5단계 그라데이션 색상 함수
  function getCorrelationColor(v) {
    if (v >= 0.5) return '#FF3366';      // 강한 양의 상관: 네온 핑크
    if (v >= 0.3) return '#FFD600';      // 중간 양의 상관: 네온 옐로우
    if (v > -0.3) return '#64748B';      // 약한/무상관: 뮤트
    if (v > -0.5) return '#00F0FF';      // 중간 음의 상관: 시안
    return '#7C3AED';                     // 강한 음의 상관: 퍼플
  }

  const theme = getTheme();
  const items = data.correlations;
  const labels = items.map(c => isMobile() ? c.labels.join('\n') : c.labels.join(' / '));
  const values = items.map(c => c.value);

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      ...GLASS_TOOLTIP,
      trigger: 'axis',
      formatter: function (params) {
        const idx = params[0].dataIndex;
        const c = items[idx];
        return `<b>${c.labels[0]} ↔ ${c.labels[1]}</b><br/>r = ${c.value}<br/>${c.status}: ${c.meaning}`;
      },
    },
    grid: { left: 10, right: isMobile() ? 35 : 45, top: 10, bottom: 10, containLabel: true },
    xAxis: {
      type: 'value', min: -1, max: 1,
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text },
      splitLine: { lineStyle: { color: theme.axis, opacity: 0.15, type: 'dashed' } },
    },
    yAxis: {
      type: 'category', data: labels, inverse: true,
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text, fontSize: isMobile() ? 10 : 12 },
    },
    series: [{
      type: 'bar',
      data: values.map((v, i) => ({
        value: v,
        itemStyle: { color: getCorrelationColor(v), borderRadius: [0, 4, 4, 0] },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}',
          color: getCorrelationColor(v),
        }
      })),
      barWidth: '60%',
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
      center: ['50%', '55%'],
      radius: '78%',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 3,
      axisLine: {
        lineStyle: {
          width: 18,
          color: [
            [0.2, '#FF3366'],
            [0.4, '#FFD600'],
            [0.7, '#64748B'],
            [1, '#00FF88'],
          ],
        },
      },
      pointer: { itemStyle: { color: 'auto' }, width: 4 },
      axisTick: { show: false },
      splitLine: { length: 10, lineStyle: { color: 'auto', width: 2 } },
      axisLabel: {
        distance: 22,
        color: theme.text,
        fontSize: 10,
        formatter: function (val) {
          if (val <= 10) return 'Panic';
          if (val <= 40) return 'Risk-Off';
          if (val <= 75) return 'Cautious';
          return 'Risk-On';
        },
      },
      title: {
        show: true,
        offsetCenter: [0, '72%'],
        color: theme.text,
        fontSize: 12,
      },
      detail: {
        valueAnimation: true,
        formatter: function () { return regime.icon + ' ' + regime.label; },
        color: theme.text,
        fontSize: 16,
        offsetCenter: [0, '48%'],
      },
      data: [{ value: score, name: regime.summary }],
    }],
  });

  window.addEventListener('resize', () => chart.resize());
}

// ===== 차트 4: 섹터 상대강도 (Lollipop Chart) =====
function renderSectors(data) {
  const chart = createChart('chart-sectors');
  if (!chart || !data.sectorStrength) {
    const el = document.getElementById('chart-sectors');
    if (el) el.innerHTML = '<p style="text-align:center;color:gray;padding:2rem">섹터 데이터 없음</p>';
    return;
  }

  const ss = data.sectorStrength;

  // 신 스키마: {us: [...], kr: [...]} 객체
  if (typeof ss === 'object' && !Array.isArray(ss)) {
    renderSectorsV2(chart, ss);
    return;
  }

  // 구 스키마: 배열 (하위 호환)
  if (!Array.isArray(ss) || ss.length === 0) {
    const el = document.getElementById('chart-sectors');
    if (el) el.innerHTML = '<p style="text-align:center;color:gray;padding:2rem">섹터 데이터 없음</p>';
    return;
  }

  const theme = getTheme();
  const sectors = ss;
  const names = sectors.map(s => s.name);
  const week1 = sectors.map(s => s.week1);
  const month1 = sectors.map(s => s.month1);

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { ...GLASS_TOOLTIP, trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['1주', '1개월'], textStyle: { color: theme.text, fontSize: isMobile() ? 11 : 13 }, itemWidth: isMobile() ? 12 : 16, itemHeight: 10 },
    grid: { left: 10, right: isMobile() ? 40 : 55, top: 35, bottom: 10, containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text, formatter: '{value}%', fontSize: isMobile() ? 10 : 12 },
      splitLine: { lineStyle: { color: theme.axis, opacity: 0.15, type: 'dashed' } },
    },
    yAxis: {
      type: 'category', data: names, inverse: true,
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text, fontSize: isMobile() ? 11 : 12 },
    },
    series: [
      {
        name: '1주',
        type: 'bar',
        data: week1.map(v => ({
          value: v,
          itemStyle: {
            color: v != null && v > 0 ? theme.success : theme.danger,
            borderRadius: v > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4]
          },
        })),
        barWidth: '45%',
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: theme.text, opacity: 0.35, type: 'solid', width: 1 },
          data: [{ xAxis: 0 }],
          label: { show: false },
        },
      },
      {
        name: '1개월',
        type: 'scatter',
        data: month1,
        symbol: 'diamond',
        symbolSize: 16,
        itemStyle: {
          color: function(params) {
            return params.value > 0 ? '#FF3366CC' : '#3388FFCC';
          },
          borderColor: function(params) {
            return params.value > 0 ? '#FF3366' : '#3388FF';
          },
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'right',
          formatter: function(p) { return p.value > 0 ? '+' + p.value.toFixed(1) + '%' : p.value.toFixed(1) + '%'; },
          fontSize: 10,
          color: theme.text,
          distance: 4,
        },
      },
    ],
  });

  window.addEventListener('resize', () => chart.resize());
}

// ===== 차트 4b: 섹터 상대강도 V2 (US/KR 듀얼 그리드, 통일 week1/month1 스키마) =====
function renderSectorsV2(chart, ss) {
  const theme = getTheme();
  // week1이 null인 항목 제외 (데이터 미수신)
  const usRaw = (ss.us || []).filter(s => s.week1 != null);
  const krRaw = (ss.kr || []).filter(s => s.week1 != null);

  if (usRaw.length === 0 && krRaw.length === 0) {
    const el = document.getElementById('chart-sectors');
    if (el) el.innerHTML = '<p style="text-align:center;color:gray;padding:2rem">섹터 데이터 없음</p>';
    return;
  }

  const hasUS = usRaw.length > 0;
  const hasKR = krRaw.length > 0;

  // 마켓별 그리드 빌더 (US/KR 동일 구조)
  const grids = [];
  const xAxes = [];
  const yAxes = [];
  const seriesList = [];

  function addMarketGrid(items, topPos, bottomPos) {
    const names = items.map(s => s.name);
    const week1 = items.map(s => s.week1);
    const month1 = items.map(s => s.month1);
    const gridIdx = grids.length;

    grids.push({ left: 10, right: isMobile() ? 40 : 55, top: topPos, bottom: bottomPos, containLabel: true });
    xAxes.push({
      type: 'value', gridIndex: gridIdx,
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text, formatter: '{value}%', fontSize: isMobile() ? 10 : 12 },
      splitLine: { lineStyle: { color: theme.axis, opacity: 0.15, type: 'dashed' } },
    });
    yAxes.push({
      type: 'category', data: names, inverse: true, gridIndex: gridIdx,
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text, fontSize: isMobile() ? 11 : 12 },
    });
    seriesList.push({
      name: '1주', type: 'bar', xAxisIndex: gridIdx, yAxisIndex: gridIdx,
      data: week1.map(v => ({
        value: v,
        itemStyle: {
          color: v != null && v > 0 ? theme.success : theme.danger,
          borderRadius: v > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
        },
      })),
      barWidth: '45%',
      markLine: { silent: true, symbol: 'none', lineStyle: { color: theme.text, opacity: 0.35, type: 'solid', width: 1 }, data: [{ xAxis: 0 }], label: { show: false } },
    });
    seriesList.push({
      name: '1개월', type: 'scatter', xAxisIndex: gridIdx, yAxisIndex: gridIdx,
      data: month1, symbol: 'diamond', symbolSize: 16,
      itemStyle: {
        color: function(p) { return p.value > 0 ? '#FF3366CC' : '#3388FFCC'; },
        borderColor: function(p) { return p.value > 0 ? '#FF3366' : '#3388FF'; },
        borderWidth: 2,
      },
      label: {
        show: true, position: 'right',
        formatter: function(p) { return p.value != null ? (p.value > 0 ? '+' : '') + p.value.toFixed(1) + '%' : ''; },
        fontSize: 10, color: theme.text, distance: 4,
      },
    });
  }

  if (hasUS && hasKR) {
    addMarketGrid(usRaw, 35, '55%');
    addMarketGrid(krRaw, '52%', 10);
  } else if (hasUS) {
    addMarketGrid(usRaw, 35, 10);
  } else {
    addMarketGrid(krRaw, 35, 10);
  }

  const titleConfig = [];
  if (hasUS && hasKR) {
    titleConfig.push({ text: 'US', left: '3%', top: 15, textStyle: { color: theme.text, fontSize: 12, fontFamily: 'Orbitron' } });
    titleConfig.push({ text: 'KR', left: '3%', top: '48%', textStyle: { color: theme.text, fontSize: 12, fontFamily: 'Orbitron' } });
  } else if (hasUS) {
    titleConfig.push({ text: 'US Sectors', left: '3%', top: 10, textStyle: { color: theme.text, fontSize: 12, fontFamily: 'Orbitron' } });
  } else {
    titleConfig.push({ text: 'KR Sectors', left: '3%', top: 10, textStyle: { color: theme.text, fontSize: 12, fontFamily: 'Orbitron' } });
  }

  chart.setOption({
    backgroundColor: 'transparent',
    title: titleConfig,
    tooltip: { ...GLASS_TOOLTIP, trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['1주', '1개월'], textStyle: { color: theme.text, fontSize: isMobile() ? 11 : 13 }, itemWidth: isMobile() ? 12 : 16, itemHeight: 10 },
    grid: grids,
    xAxis: xAxes,
    yAxis: yAxes,
    series: seriesList,
  });

  window.addEventListener('resize', () => chart.resize());
}

// ===== 메인 렌더링 함수 =====
function renderAllCharts(data) {
  renderTimeSeries(data);
  renderCorrelations(data);
  renderRegime(data);
  renderSectors(data);

  // hidden→visible 전환 직후 레이아웃 안정화를 위한 resize safety net
  requestAnimationFrame(function() {
    document.querySelectorAll('.chart-box').forEach(function(el) {
      var inst = echarts.getInstanceByDom(el);
      if (inst) inst.resize();
    });
  });
}
