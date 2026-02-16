(function() {
  'use strict';

  var defaultConfig = {
    colors: {
      regime: {
        RISK_ON: '#00FF88',
        CAUTIOUS: '#FFD600',
        RISK_OFF: '#FF3366',
        PANIC: '#FF0040'
      },
      regime_rgb: {
        RISK_ON: '0 255 136',
        CAUTIOUS: '255 214 0',
        RISK_OFF: '255 51 102',
        PANIC: '255 0 64'
      }
    },
    sections: {
      news: '주요 뉴스',
      calendar: ['주요 일정', '오늘의 일정', '이벤트 캘린더'],
      key_data: '핵심 수치',
      sector: '섹터 상대강도'
    },
    labels: {
      original_source: '원문:',
      en_tag: 'EN',
      kr_tag: 'KR',
      market_calendar_title: 'Market Calendar',
      upcoming_events_title: '주요 일정 (최근)',
      empty_events: '표시할 주요 일정 데이터가 없습니다.',
      empty_filtered: '필터 조건에 맞는 일정이 없습니다.',
      holiday_label: '🇰🇷 KR 휴장 (국내 증시 휴장)'
    },
    calendar: {
      timezone: 'Asia/Seoul',
      weekdays: ['일', '월', '화', '수', '목', '금', '토']
    }
  };

  // Deep merge function
  function mergeDeep(target, source) {
    if (!source) return target;
    for (var key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  window.MP_CONFIG = mergeDeep(defaultConfig, window.__MP_CONFIG || {});
})();
