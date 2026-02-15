/**
 * Market Pulse - ECharts 렌더링 (4종 차트: Trend, Correlation, Regime, Sectors)
 * Cyberpunk HUD Edition - Internal Optimization
 */

/* globals echarts */

const COLORS = {
  primary: '#7C3AED',   /* Purple */
  cyan: '#00F0FF',      /* Neon Cyan */
  pink: '#FF3366',      /* Neon Pink (Up) */
  blue: '#3388FF',      /* Neon Blue (Down) */
  yellow: '#FFD600',    /* Neon Yellow */
  green: '#00FF88',     /* Neon Green */
  muted: '#64748B',     /* Slate */
  bg: '#0A0A1A',        /* Dark BG */
  text: '#E2E8F0',      /* Light Text */
};

const METRIC_COLORS = {
  SPX: '#00F0FF',
  NDX: '#7C3AED',
  DJI: '#34d399',
  VIX: '#f87171',
  BTC: '#fbbf24',
  USDKRW: '#06b6d4',
  GOLD: '#eab308',
  OIL: '#a8a29e',
  US10Y: '#f472b6',
};

function isDarkMode() {
  // Strictly check for class presence to respect manual toggle
  return document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark');
}

function isMobile() {
  return window.innerWidth <= 640;
}

function getTheme() {
  const dark = isDarkMode();
  return {
    bg: 'transparent',
    text: dark ? '#E2E8F0' : '#1E1E3A',
    axis: dark ? 'rgba(124, 58, 237, 0.25)' : '#cbd5e1',
    grid: dark ? 'rgba(124, 58, 237, 0.1)' : '#f1f5f9',
    success: dark ? COLORS.pink : '#DC2626',
    danger: dark ? COLORS.blue : '#2563EB',
  };
}

function getTooltipStyle() {
  const dark = isDarkMode();
  return {
    backgroundColor: dark ? 'rgba(10, 10, 26, 0.92)' : 'rgba(255, 255, 255, 0.98)',
    borderColor: dark ? 'rgba(0, 240, 255, 0.4)' : 'rgba(124, 58, 237, 0.3)',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    textStyle: { 
      color: dark ? '#E2E8F0' : '#1E1E3A', 
      fontSize: 12,
      fontFamily: 'JetBrains Mono, monospace',
      lineHeight: 18
    },
    extraCssText: dark
      ? 'box-shadow: 0 0 20px rgba(0, 240, 255, 0.15), inset 0 0 10px rgba(0, 240, 255, 0.05); backdrop-filter: blur(10px);'
      : 'box-shadow: 0 8px 24px rgba(0,0,0,0.12);',
  };
}

function createChart(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const existing = echarts.getInstanceByDom(el);
  if (existing) existing.dispose();
  return echarts.init(el, isDarkMode() ? 'dark' : null);
}

function hexToRgba(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ===== 차트 1: 주요 지표 추이 (Precision Line) =====
function renderTimeSeries(data) {
  const chart = createChart('chart-timeseries');
  if (!chart || !data.timeSeries) return;

  const { dates, series } = data.timeSeries;
  const theme = getTheme();
  const dark = isDarkMode();

  function normalizeToPercent(arr) {
    if (!arr || arr.length === 0) return arr;
    const base = arr[0];
    return arr.map(v => +((v - base) / base * 100).toFixed(2));
  }

  const leftKeys = ['SPX', 'NDX', 'DJI'];
  const rightKeys = ['VIX'];
  const originalSeries = {};
  [...leftKeys, ...rightKeys].forEach(k => { if(series[k]) originalSeries[k] = series[k]; });

  const seriesConfig = [];
  
  leftKeys.forEach(key => {
    if (!series[key]) return;
    const normData = normalizeToPercent(series[key]);
    const color = METRIC_COLORS[key];
    
    seriesConfig.push({
      name: key,
      type: 'line',
      data: normData,
      smooth: 0.3,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: false,
      lineStyle: { 
        width: 3, 
        color: color,
        shadowBlur: dark ? 12 : 0,
        shadowColor: color,
      },
      itemStyle: { color: color, borderColor: '#fff', borderWidth: 1 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: hexToRgba(color, 0.18) },
          { offset: 1, color: hexToRgba(color, 0) },
        ]),
      },
      emphasis: {
        focus: 'series',
        lineStyle: { width: 4.5, shadowBlur: 20 },
        itemStyle: { borderWidth: 2 }
      },
      // 마지막 포인트 강조
      markPoint: {
        symbol: 'circle',
        symbolSize: 8,
        data: [{ coord: [dates.length - 1, normData[normData.length - 1]] }],
        itemStyle: { 
          color: color, 
          shadowBlur: 15, 
          shadowColor: color,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false }
      }
    });
  });

  rightKeys.forEach(key => {
    if (!series[key]) return;
    const color = METRIC_COLORS[key];
    seriesConfig.push({
      name: key,
      type: 'line',
      yAxisIndex: 1,
      data: normalizeToPercent(series[key]),
      smooth: 0.3,
      symbol: 'none',
      lineStyle: { width: 1.5, type: 'dashed', color: color, opacity: 0.8 },
      itemStyle: { color: color },
      areaStyle: { color: hexToRgba(color, 0.05) },
    });
  });

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      ...getTooltipStyle(),
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        lineStyle: { color: COLORS.cyan, opacity: 0.3, type: 'dashed' },
        label: { backgroundColor: COLORS.primary, color: '#fff', fontFamily: 'JetBrains Mono', fontSize: 10 }
      },
      formatter: function(params) {
        let html = `<div style="margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:6px;font-family:Orbitron;letter-spacing:1px">
                      <b style="color:${COLORS.cyan}">${params[0].axisValue}</b>
                    </div>`;
        params.sort((a, b) => b.value - a.value).forEach(p => {
          const val = originalSeries[p.seriesName][p.dataIndex];
          const pct = p.value;
          const color = pct >= 0 ? theme.success : theme.danger;
          html += `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;margin:4px 0">
                    <span style="display:flex;align-items:center;gap:6px">
                      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};box-shadow:0 0 5px ${p.color}"></span>
                      <b style="color:${theme.text}">${p.seriesName}</b>
                    </span>
                    <span style="font-family:JetBrains Mono">
                      <span style="color:${dark ? '#94A3B8' : '#64748B'};font-size:11px">${val.toLocaleString(undefined, {maximumFractionDigits:1})}</span>
                      <b style="color:${color};margin-left:6px;font-size:13px">${pct > 0 ? '+' : ''}${pct}%</b>
                    </span>
                   </div>`;
        });
        return html;
      }
    },
    legend: {
      textStyle: { color: theme.text, fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 500 },
      itemWidth: 12, itemHeight: 12, itemGap: 20, top: 0, icon: 'rect'
    },
    grid: { left: '2%', right: '2%', bottom: '5%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: theme.axis } },
      axisLabel: { color: theme.text, fontSize: 10, fontFamily: 'JetBrains Mono', margin: 12 },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: 'INDEX %',
        nameTextStyle: { color: theme.text, fontFamily: 'JetBrains Mono', fontSize: 10, padding: [0, 0, 0, 40] },
        axisLine: { show: false },
        axisLabel: { color: theme.text, fontFamily: 'JetBrains Mono', fontSize: 10, formatter: '{value}%' },
        splitLine: { lineStyle: { color: theme.grid, type: 'dashed', opacity: 0.5 } }
      },
      {
        type: 'value',
        name: 'VIX %',
        nameTextStyle: { color: theme.text, fontFamily: 'JetBrains Mono', fontSize: 10, padding: [0, 40, 0, 0] },
        axisLine: { show: false },
        axisLabel: { color: theme.text, fontFamily: 'JetBrains Mono', fontSize: 10, formatter: '{value}%' },
        splitLine: { show: false }
      }
    ],
    series: seriesConfig,
    dataZoom: [{ 
      type: 'inside', start: 0, end: 100 
    }, {
      type: 'slider', height: 20, bottom: 5,
      handleIcon: 'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      handleSize: '80%',
      dataBackground: { lineStyle: { color: COLORS.cyan }, areaStyle: { color: COLORS.cyan, opacity: 0.1 } },
      selectedDataBackground: { lineStyle: { color: COLORS.pink }, areaStyle: { color: COLORS.pink, opacity: 0.2 } },
      textStyle: { color: theme.text, fontFamily: 'JetBrains Mono' }
    }]
  });

  window.addEventListener('resize', () => chart.resize());
}

// ===== 차트 2: 상관관계 (Threshold Zones) =====
function renderCorrelations(data) {
  const chart = createChart('chart-correlations');
  if (!chart || !data.correlations) return;

  const theme = getTheme();
  const items = data.correlations;
  const labels = items.map(c => isMobile() ? c.labels.join('\n') : c.labels.join(' / '));
  const values = items.map(c => c.value);

  function getCorrColor(v) {
    if (Math.abs(v) >= 0.5) return v > 0 ? COLORS.pink : COLORS.primary;
    if (Math.abs(v) >= 0.2) return COLORS.yellow;
    return COLORS.muted;
  }

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { 
      ...getTooltipStyle(), 
      trigger: 'axis',
      formatter: function(params) {
        const d = items[params[0].dataIndex];
        return `<b style="color:${COLORS.cyan}">${d.labels[0]} ↔ ${d.labels[1]}</b><br/>
                <span style="font-family:JetBrains Mono;font-size:14px">Correlation: <b>${d.value > 0 ? '+' : ''}${d.value}</b></span><br/>
                <div style="margin-top:4px;color:#94A3B8;font-size:11px">${d.status}: ${d.meaning}</div>`;
      }
    },
    grid: { left: '4%', right: '10%', top: '5%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'value', min: -1, max: 1, interval: 0.5,
      axisLine: { show: false },
      axisLabel: { color: theme.text, fontFamily: 'JetBrains Mono', fontSize: 10 },
      splitLine: { lineStyle: { color: theme.grid, type: 'dashed' } }
    },
    yAxis: {
      type: 'category', data: labels, inverse: true,
      axisLine: { lineStyle: { color: theme.axis } },
      axisTick: { show: false },
      axisLabel: { color: theme.text, fontSize: 11, fontFamily: 'JetBrains Mono', margin: 15 }
    },
    series: [{
      type: 'bar',
      data: values.map(v => ({
        value: v,
        itemStyle: {
          color: getCorrColor(v),
          borderRadius: v > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
          shadowBlur: isDarkMode() ? 10 : 0,
          shadowColor: getCorrColor(v)
        }
      })),
      barWidth: '50%',
      label: {
        show: true,
        position: 'right',
        fontFamily: 'JetBrains Mono',
        fontWeight: 'bold',
        fontSize: 12,
        formatter: p => (p.value > 0 ? '+' : '') + p.value.toFixed(2),
        distance: 10
      },
      // 가이드라인 (임계치 영역)
      markArea: {
        silent: true,
        data: [[
          { xAxis: -0.2, itemStyle: { color: 'rgba(100,116,139,0.05)' } },
          { xAxis: 0.2 }
        ]]
      }
    }]
  });
}

// ===== 차트 3: 시장 국면 (Instrument Style) =====
function renderRegime(data) {
  const chart = createChart('chart-regime');
  if (!chart || !data.regime) return;

  const regime = data.regime;
  const theme = getTheme();
  
  const regimeScore = { 'RISK_ON': 85, 'CAUTIOUS': 55, 'RISK_OFF': 30, 'PANIC': 10 };
  const score = regimeScore[regime.current] || 50;
  const dark = isDarkMode();
  const regimeColor = score >= 75
    ? COLORS.green
    : score >= 50
      ? COLORS.yellow
      : score >= 25
        ? COLORS.pink
        : '#ff0040';
  const gaugeScale = 0.8;
  const mainGaugeRadius = `${Math.round(93 * gaugeScale)}%`;
  const frameGaugeRadius = `${Math.round(100 * gaugeScale)}%`;

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      ...getTooltipStyle(),
      trigger: 'item',
      formatter: function() {
        const signals = (regime.signals || []).slice(0, 3);
        const lines = signals.map(function(s) {
          return `- ${s.name}: ${s.value} (${s.assessment})`;
        }).join('<br/>');
        return `<b style="color:${COLORS.cyan}">${regime.label}</b><br/>
                <span style="font-family:JetBrains Mono">Risk Score: <b>${score}</b>/100</span><br/>
                ${lines ? `<div style="margin-top:6px;color:#94A3B8;font-size:11px">${lines}</div>` : ''}`;
      }
    },
    series: [
      {
        type: 'gauge',
        startAngle: 210, endAngle: -30,
        min: 0, max: 100,
        splitNumber: 4,
        radius: mainGaugeRadius,
        center: ['50%', '65%'],
        axisLine: {
          lineStyle: {
            width: 9,
            color: [
              [0.2, 'rgba(255,51,102,0.55)'],
              [0.4, 'rgba(255,214,0,0.55)'],
              [0.7, 'rgba(100,116,139,0.45)'],
              [1, 'rgba(0,255,136,0.55)']
            ]
          }
        },
        progress: {
          show: true,
          roundCap: true,
          width: 9,
          itemStyle: {
            color: regimeColor,
            shadowBlur: dark ? 6 : 0,
            shadowColor: regimeColor,
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,20.1c0.1,0.2,0,0.4-0.2,0.5c-0.1,0-0.1,0-0.2,0H1.6c-0.2,0-0.4-0.1-0.5-0.3c-0.1-0.1-0.1-0.2,0-0.2l12-20.1C13.2,0.5,13.4,0.5,13.5,0.6C13.5,0.6,13.5,0.7,12.8,0.7z',
          length: '13%',
          width: 14,
          offsetCenter: [0, '-62%'],
          itemStyle: {
            color: regimeColor,
            shadowBlur: dark ? 4 : 0,
            shadowColor: regimeColor,
          }
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 7,
          itemStyle: {
            color: regimeColor,
            shadowBlur: dark ? 4 : 0,
            shadowColor: regimeColor,
          }
        },
        axisTick: { distance: -18, length: 6, lineStyle: { color: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', width: 1 } },
        splitLine: { distance: -20, length: 10, lineStyle: { color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.15)', width: 1 } },
        axisLabel: { 
          distance: -40, color: dark ? '#94A3B8' : '#64748B', fontSize: 9, fontFamily: 'JetBrains Mono',
          formatter: function(v) {
            return v % 25 === 0 ? v : '';
          }
        },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '28%'],
          formatter: () => `{icon|${regime.icon}}\n{label|${regime.label}}\n{score|${score}/100}`,
          rich: {
            icon: { fontSize: 26, padding: [0, 0, 6, 0] },
            label: { 
              fontSize: 16,
              fontWeight: 700,
              color: theme.text,
              fontFamily: 'Orbitron',
              letterSpacing: 1
            },
            score: {
              fontSize: 11,
              fontWeight: 500,
              color: '#94A3B8',
              fontFamily: 'JetBrains Mono',
              padding: [4, 0, 0, 0]
            },
          }
        },
        data: [{ value: score }]
      },
      // 바깥쪽 테두리 장식
      {
        type: 'gauge',
        startAngle: 215, endAngle: -35, radius: frameGaugeRadius, center: ['50%', '65%'],
        axisLine: { lineStyle: { width: 1, color: [[1, dark ? 'rgba(148,163,184,0.2)' : 'rgba(71,85,105,0.18)']] } },
        axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false }
      }
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: 6,
        style: {
          text: 'Regime',
          fill: dark ? '#94A3B8' : '#475569',
          font: '500 11px JetBrains Mono',
          letterSpacing: 0.5,
          opacity: 0.9,
        }
      }
    ]
  });
}

// ===== 차트 4: 섹터 상대강도 (Ghost Bar Style) =====
function renderSingleSectorChart(chartId, items) {
  const el = document.getElementById(chartId);
  if (!el || !items || items.length === 0) return;

  const chartHeight = Math.max(220, items.length * 42 + 60);
  el.style.height = chartHeight + 'px';
  const chart = createChart(chartId);
  const theme = getTheme();
  const dark = isDarkMode();

  const names = items.map(s => s.name);
  const week1 = items.map(s => (s.week1 == null ? null : Number(s.week1)));
  const month1 = items.map((s, i) => {
    if (s.month1 == null) return week1[i];
    return Number(s.month1);
  });

  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { 
      ...getTooltipStyle(), 
      trigger: 'axis', 
      axisPointer: {
        type: 'shadow',
        shadowStyle: { color: dark ? 'rgba(124,58,237,0.09)' : 'rgba(124,58,237,0.05)' }
      },
      formatter: function(params) {
        const week = params.find(function(p) { return p.seriesName === '1주'; }) || params[0];
        const idx = week ? week.dataIndex : 0;
        const name = names[idx] || '';
        const w = week1[idx];
        const m = month1[idx];
        const spread = (w != null && m != null) ? (w - m) : null;
        return `<b style="color:${COLORS.cyan}">${name}</b><br/>
                <span style="font-family:JetBrains Mono">1주: <b>${w != null ? (w > 0 ? '+' : '') + w.toFixed(2) + '%' : '-'}</b></span><br/>
                <span style="font-family:JetBrains Mono">1개월: <b>${m != null ? (m > 0 ? '+' : '') + m.toFixed(2) + '%' : '-'}</b></span><br/>
                <span style="font-family:JetBrains Mono;color:#94A3B8">스프레드: <b>${spread != null ? (spread > 0 ? '+' : '') + spread.toFixed(2) + '%p' : '-'}</b></span>`;
      }
    },
        legend: {
          data: [
            { name: '1주', itemStyle: { color: COLORS.primary } },
            { name: '1개월', itemStyle: { color: dark ? 'rgba(124, 58, 237, 0.3)' : 'rgba(124, 58, 237, 0.2)' } }
          ],
          textStyle: { color: theme.text, fontFamily: 'JetBrains Mono', fontSize: 11 },
          top: 0, right: 10, icon: 'roundRect'
        },
        grid: { left: '4%', right: '14%', top: '15%', bottom: '5%', containLabel: true },
        xAxis: {
          type: 'value',
          axisLine: { show: false },
          axisLabel: { color: theme.text, fontFamily: 'JetBrains Mono', fontSize: 10, formatter: '{value}%' },
          splitLine: { lineStyle: { color: theme.grid, type: 'dashed' } }
        },
        yAxis: {
          type: 'category', data: names, inverse: true,
          axisLine: { lineStyle: { color: theme.axis } },
          axisTick: { show: false },
          axisLabel: { color: theme.text, fontSize: 12, fontWeight: 500, margin: 15 }
        },
        series: [
          {
            name: '1개월',
            type: 'bar',
            data: month1.map(v => ({
              value: v,
              itemStyle: {
                color: dark ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.12)',
                borderColor: dark ? 'rgba(124, 58, 237, 0.3)' : 'rgba(124, 58, 237, 0.2)',
                borderWidth: 1,
                borderRadius: v >= 0 ? [0, 2, 2, 0] : [2, 0, 0, 2],
              }
            })),
            silent: true,
            z: 1,
            barWidth: '60%',
            barGap: '-100%',
          },
          {
            name: '1주',
            type: 'bar',
            data: week1.map(v => ({
              value: v,
              itemStyle: {
                color: v >= 0 ? theme.success : theme.danger,
                borderRadius: v >= 0 ? [0, 4, 4, 0] : [4, 0, 0, 4],
                shadowBlur: dark ? 12 : 0,
                shadowColor: v >= 0 ? theme.success : theme.danger,
              }
            })),
            barWidth: '35%',
            z: 2,
        label: {
          show: true, position: 'right',
          fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 'bold',
          color: theme.text,
          formatter: p => `${p.value > 0 ? '+' : ''}${p.value.toFixed(1)}%`,
          distance: 10
        }
      },
      {
        type: 'line',
        data: [],
        silent: true,
        lineStyle: { opacity: 0 },
        markLine: {
          symbol: 'none',
          label: { show: false },
          lineStyle: { color: 'rgba(148,163,184,0.38)', type: 'dashed', width: 1 },
          data: [{ xAxis: 0 }]
        }
      }
    ]
  });
}

function renderSectors(data) {
  if (!data.sectorStrength) return;
  const ss = data.sectorStrength;
  if (typeof ss === 'object' && !Array.isArray(ss)) {
    renderSingleSectorChart('chart-sectors-us', (ss.us || []).filter(s => s.week1 != null));
    renderSingleSectorChart('chart-sectors-kr', (ss.kr || []).filter(s => s.week1 != null));
  }
}

// ===== 메인 렌더링 함수 =====
let __mpChartData = null;

function renderAllCharts(data) {
  __mpChartData = data;
  renderTimeSeries(data);
  renderCorrelations(data);
  renderRegime(data);
  renderSectors(data);
}

(function() {
  const observer = new MutationObserver(() => {
    if (__mpChartData) {
      setTimeout(() => renderAllCharts(__mpChartData), 150);
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
})();
