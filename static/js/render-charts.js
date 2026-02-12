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

function getTooltipStyle() {
  const dark = isDarkMode();
  return {
    backgroundColor: dark ? 'rgba(10, 10, 26, 0.95)' : 'rgba(255, 255, 255, 0.97)',
    borderColor: dark ? 'rgba(124, 58, 237, 0.3)' : 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderRadius: 4,
    textStyle: { color: dark ? '#E2E8F0' : '#1E1E3A', fontSize: 13 },
    extraCssText: dark
      ? 'box-shadow:0 0 15px rgba(124,58,237,0.2),0 8px 32px -8px rgba(0,0,0,0.5)'
      : 'box-shadow:0 4px 16px -4px rgba(124,58,237,0.1),0 2px 8px rgba(0,0,0,0.06)',
  };
}

// backward compat — lazy reference
const GLASS_TOOLTIP = getTooltipStyle();

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

  // 라인 아래 그라데이션 생성 헬퍼
  function makeGradient(color, opacity) {
    return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: color.replace(')', ',' + opacity + ')').replace('rgb', 'rgba') },
      { offset: 1, color: color.replace(')', ',0)').replace('rgb', 'rgba') },
    ]);
  }

  // hex → rgba 변환 헬퍼
  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  const seriesConfig = [];
  for (const key of leftKeys) {
    if (!series[key]) continue;
    var normData = normalizeToPercent(series[key]);
    seriesConfig.push({
      name: key,
      type: 'line',
      data: normData,
      yAxisIndex: 0,
      smooth: true,
      symbol: 'none',
      showSymbol: false,
      emphasis: { focus: 'series', lineStyle: { width: 3 } },
      lineStyle: { width: 2, color: METRIC_COLORS[key] },
      itemStyle: { color: METRIC_COLORS[key] },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: hexToRgba(METRIC_COLORS[key], 0.15) },
          { offset: 1, color: hexToRgba(METRIC_COLORS[key], 0) },
        ]),
      },
      // 마지막 포인트 강조
      markPoint: {
        symbol: 'circle',
        symbolSize: 6,
        data: [{ type: 'max', name: 'last', coord: [dates.length - 1, normData[normData.length - 1]] }],
        itemStyle: { color: METRIC_COLORS[key], borderColor: '#fff', borderWidth: 1.5 },
        label: { show: false },
      },
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
      showSymbol: false,
      emphasis: { focus: 'series', lineStyle: { width: 3 } },
      lineStyle: { width: 2, type: 'dashed', color: METRIC_COLORS[key] },
      itemStyle: { color: METRIC_COLORS[key] },
      areaStyle: { color: 'rgba(248,113,113,0.06)' },
    });
  }

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      ...getTooltipStyle(),
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        lineStyle: { color: '#7C3AED', opacity: 0.4, type: 'dashed' },
        crossStyle: { color: '#7C3AED', opacity: 0.4 },
        label: { backgroundColor: 'rgba(124,58,237,0.8)', color: '#fff', fontSize: 11 },
      },
      formatter: function(params) {
        if (!params || params.length === 0) return '';
        let html = '<b style="font-family:JetBrains Mono,monospace;font-size:12px">' + params[0].axisValue + '</b>';
        params.forEach(p => {
          const key = p.seriesName;
          const idx = p.dataIndex;
          const originalValue = originalSeries[key] ? originalSeries[key][idx] : null;
          const changePct = p.value;
          const sign = changePct > 0 ? '+' : '';
          html += '<br/>' + p.marker + ' <b>' + key + '</b>: ';
          if (originalValue !== null) {
            html += '<span style="font-family:JetBrains Mono,monospace">' + originalValue.toLocaleString(undefined, {maximumFractionDigits: 2}) + '</span> ';
          }
          var upColor = isDarkMode() ? '#FF3366' : '#DC2626';
          var downColor = isDarkMode() ? '#3388FF' : '#2563EB';
          html += '<span style="color:' + (changePct >= 0 ? upColor : downColor) + ';font-family:JetBrains Mono,monospace">' + sign + changePct + '%</span>';
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
      ...getTooltipStyle(),
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
      data: values.map(function(v) {
        return {
          value: v,
          itemStyle: {
            color: getCorrelationColor(v),
            borderRadius: v >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
          },
          label: {
            show: true,
            position: v >= 0 ? 'right' : 'left',
            formatter: function(p) {
              var val = p.value;
              return (val >= 0 ? '+' : '') + val.toFixed(2);
            },
            color: getCorrelationColor(v),
            fontSize: 11,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: Math.abs(v) >= 0.5 ? 'bold' : 'normal',
          },
        };
      }),
      barWidth: '55%',
      markArea: {
        silent: true,
        data: [[
          { xAxis: -0.3, itemStyle: { color: 'rgba(100,116,139,0.06)', borderColor: 'rgba(100,116,139,0.15)', borderWidth: 1, borderType: 'dashed' } },
          { xAxis: 0.3 },
        ]],
      },
      markLine: {
        silent: true, symbol: 'none',
        lineStyle: { color: theme.text, opacity: 0.3, type: 'solid', width: 1 },
        data: [{ xAxis: 0 }],
        label: { show: false },
      },
    }],
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
      pointer: {
        itemStyle: { color: 'auto' },
        width: 5,
        length: '55%',
        icon: 'triangle',
      },
      anchor: {
        show: true,
        size: 10,
        itemStyle: { borderColor: 'auto', borderWidth: 2, color: theme.bg },
      },
      axisTick: { show: false },
      splitLine: { length: 12, lineStyle: { color: 'auto', width: 2 } },
      axisLabel: {
        distance: 24,
        color: theme.text,
        fontSize: 11,
        fontFamily: 'Orbitron, sans-serif',
        formatter: function (val) {
          if (val <= 10) return 'Panic';
          if (val <= 40) return 'Risk-Off';
          if (val <= 75) return 'Cautious';
          return 'Risk-On';
        },
      },
      title: {
        show: true,
        offsetCenter: [0, '75%'],
        color: theme.text,
        fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace',
      },
      detail: {
        valueAnimation: true,
        formatter: function () { return regime.icon + ' ' + regime.label; },
        color: theme.text,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Orbitron, sans-serif',
        offsetCenter: [0, '50%'],
      },
      data: [{ value: score, name: regime.summary }],
    }],
  });

  window.addEventListener('resize', () => chart.resize());
}

// ===== 차트 4: 섹터 상대강도 (US/KR 분리 차트) =====

// 단일 마켓 섹터 차트 렌더링 (공통 로직)
function renderSingleSectorChart(chartId, items) {
  const el = document.getElementById(chartId);
  if (!el || !items || items.length === 0) {
    if (el) el.innerHTML = '<p style="text-align:center;color:gray;padding:1.5rem">섹터 데이터 없음</p>';
    return;
  }

  // 섹터 수에 따라 높이 동적 계산 (섹터당 40px + 상하 여백)
  const chartHeight = Math.max(200, items.length * 44 + 60);
  el.style.height = chartHeight + 'px';

  const chart = echarts.init(el, isDarkMode() ? 'dark' : null);
  const theme = getTheme();

  const names = items.map(s => s.name);
  const week1 = items.map(s => s.week1);
  const month1 = items.map(s => s.month1);

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      ...getTooltipStyle(),
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params) {
        if (!params || params.length === 0) return '';
        let html = '<b>' + params[0].name + '</b>';
        params.forEach(function(p) {
          const v = p.value;
          const sign = v > 0 ? '+' : '';
          html += '<br/>' + p.marker + ' ' + p.seriesName + ': ' + sign + v.toFixed(1) + '%';
        });
        return html;
      },
    },
    legend: {
      data: [
        { name: '1주', icon: 'roundRect', itemStyle: { color: '#FF3366' } },
        { name: '1개월', icon: 'diamond', itemStyle: { color: '#7C3AED', borderColor: '#7C3AED', borderWidth: 2, opacity: 0.5 } },
      ],
      textStyle: { color: theme.text, fontSize: isMobile() ? 11 : 13 },
      itemWidth: isMobile() ? 12 : 16, itemHeight: 10,
      top: 0,
    },
    grid: { left: 10, right: isMobile() ? 40 : 50, top: 30, bottom: 5, containLabel: true },
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
        data: week1.map(function(v) {
          return {
            value: v,
            itemStyle: {
              color: v != null && v > 0 ? theme.success : theme.danger,
              borderRadius: v > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
            },
          };
        }),
        barGap: '30%',
        barCategoryGap: '40%',
        label: {
          show: true,
          position: 'right',
          formatter: function(p) { return (p.value > 0 ? '+' : '') + p.value.toFixed(1) + '%'; },
          fontSize: 10,
          color: theme.text,
          distance: 4,
        },
        markLine: {
          silent: true, symbol: 'none',
          lineStyle: { color: theme.text, opacity: 0.35, type: 'solid', width: 1 },
          data: [{ xAxis: 0 }],
          label: { show: false },
        },
      },
      {
        name: '1개월',
        type: 'bar',
        data: month1.map(function(v) {
          return {
            value: v,
            itemStyle: {
              color: 'rgba(124,58,237,0.3)',
              borderColor: '#7C3AED',
              borderWidth: 1.5,
              borderRadius: v > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
            },
          };
        }),
        barGap: '30%',
        barCategoryGap: '40%',
        label: {
          show: true,
          position: 'right',
          formatter: function(p) { return (p.value > 0 ? '+' : '') + p.value.toFixed(1) + '%'; },
          fontSize: 10,
          color: theme.text,
          fontStyle: 'italic',
          distance: 4,
        },
      },
    ],
  });

  window.addEventListener('resize', function() { chart.resize(); });
}

function renderSectors(data) {
  if (!data.sectorStrength) {
    var usEl = document.getElementById('chart-sectors-us');
    var krEl = document.getElementById('chart-sectors-kr');
    if (usEl) usEl.innerHTML = '<p style="text-align:center;color:gray;padding:1.5rem">섹터 데이터 없음</p>';
    if (krEl) krEl.innerHTML = '<p style="text-align:center;color:gray;padding:1.5rem">섹터 데이터 없음</p>';
    return;
  }

  var ss = data.sectorStrength;

  // 신 스키마: {us: [...], kr: [...]} 객체
  if (typeof ss === 'object' && !Array.isArray(ss)) {
    var usItems = (ss.us || []).filter(function(s) { return s.week1 != null; });
    var krItems = (ss.kr || []).filter(function(s) { return s.week1 != null; });

    // 한쪽만 데이터가 있으면 해당 카드만 표시, 없는 쪽은 숨김
    var grid = document.getElementById('sector-charts-grid');
    var usCard = document.getElementById('chart-sectors-us');
    var krCard = document.getElementById('chart-sectors-kr');

    if (usItems.length === 0 && usCard) usCard.parentElement.style.display = 'none';
    if (krItems.length === 0 && krCard) krCard.parentElement.style.display = 'none';

    // 둘 다 없으면 그리드 자체 숨김
    if (usItems.length === 0 && krItems.length === 0) {
      if (grid) grid.style.display = 'none';
      return;
    }

    renderSingleSectorChart('chart-sectors-us', usItems);
    renderSingleSectorChart('chart-sectors-kr', krItems);
    return;
  }

  // 구 스키마: 배열 (하위 호환) — US 차트에 표시
  if (Array.isArray(ss) && ss.length > 0) {
    renderSingleSectorChart('chart-sectors-us', ss);
    var krCard2 = document.getElementById('chart-sectors-kr');
    if (krCard2) krCard2.parentElement.style.display = 'none';
  }
}

// ===== 메인 렌더링 함수 =====
var __mpChartData = null;

function renderAllCharts(data) {
  __mpChartData = data;

  // 기존 인스턴스 dispose (테마 전환 시 재생성 필요)
  document.querySelectorAll('.chart-box').forEach(function(el) {
    var inst = echarts.getInstanceByDom(el);
    if (inst) inst.dispose();
  });

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

// ===== 테마 전환 감지 → 차트 리렌더 =====
(function() {
  var observer = new MutationObserver(function(mutations) {
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === 'class' && __mpChartData) {
        // 클래스 변경 후 약간의 딜레이로 CSS 전환 완료 대기
        setTimeout(function() { renderAllCharts(__mpChartData); }, 50);
        return;
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
