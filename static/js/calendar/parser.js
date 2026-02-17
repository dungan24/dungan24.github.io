(function() {
  'use strict';

  var ns = window.MPCalendar = window.MPCalendar || {};

  ns.createParser = function(KRX_PUBLIC_HOLIDAYS) {
    var config = window.MP_CONFIG || {};
    var calConfig = config.calendar || {};
    var timeZone = calConfig.timezone || 'Asia/Seoul';
    var timeZoneLabel = calConfig.timezone_label || 'KST';
    var utcOffset = calConfig.utc_offset || '+09:00';
    var locale = calConfig.locale || 'ko-KR';

    function escapeRegex(text) {
      return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    var escapedTimeZoneLabel = escapeRegex(timeZoneLabel);
    var timeTokenRegex = new RegExp('\\s*' + escapedTimeZoneLabel + '$', 'i');
    var scheduleTimeRegex = new RegExp('시각:\\s*(\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}(?::\\d{2})?)\\s*' + escapedTimeZoneLabel, 'i');
    var legacyScheduleRegex = new RegExp('^\\[([A-Z]{2,5})\\]\\s*(.+?)\\s*\\|\\s*(\\d{4}-\\d{2}-\\d{2}\\s+\\d{2}:\\d{2}(?::\\d{2})?)\\s*' + escapedTimeZoneLabel + '\\s*\\|\\s*중요도:\\s*(high|medium|low)(?:\\s*\\((.*)\\))?$', 'i');

    function parseKstDateTime(text) {
      if (!text) return null;
      var normalized = String(text).trim().replace(' ', 'T');
      if (!/T\d{2}:\d{2}(:\d{2})?$/.test(normalized)) return null;
      return new Date(normalized + utcOffset);
    }

    function pad2(v) {
      return String(v).padStart(2, '0');
    }

    function fmtYmd(year, month, day) {
      return String(year) + '-' + pad2(month) + '-' + pad2(day);
    }

    function kstYmd(date) {
      if (!date || isNaN(date.getTime())) return '';
      var p = new Intl.DateTimeFormat('en-CA', {
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(date).reduce(function(acc, cur) {
        acc[cur.type] = cur.value;
        return acc;
      }, {});
      return p.year + '-' + p.month + '-' + p.day;
    }

    function krxYearEndClosure(year) {
      var d = new Date(Date.UTC(year, 11, 31));
      while (d.getUTCDay() === 0 || d.getUTCDay() === 6) {
        d = new Date(d.getTime() - 86400_000);
      }
      return fmtYmd(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    }

    function getKrxHolidaySet(year) {
      var list = KRX_PUBLIC_HOLIDAYS[year] || [];
      var set = new Set(list);
      set.add(krxYearEndClosure(year));
      return set;
    }

    function formatKst(date) {
      if (!date || isNaN(date.getTime())) return '-';
      var p = new Intl.DateTimeFormat(locale, {
        timeZone: timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).formatToParts(date).reduce(function(acc, cur) {
        acc[cur.type] = cur.value;
        return acc;
      }, {});
      return p.year + '-' + p.month + '-' + p.day + ' ' + p.hour + ':' + p.minute + ' ' + timeZoneLabel;
    }

    function getKstNow() {
      return new Date();
    }

    function normalizeImportanceToken(token) {
      var t = String(token || '').trim().toLowerCase();
      if (t === '상' || t === 'high') return 'high';
      if (t === '중' || t === 'medium') return 'medium';
      if (t === '하' || t === 'low') return 'low';
      return 'medium';
    }

    function hasChartKeyEventsPayload() {
      var chartData = window.__MP_CHART_DATA;
      return !!(chartData && Array.isArray(chartData.keyEvents));
    }

    function parseKeyEventsFromChartData() {
      var chartData = window.__MP_CHART_DATA;
      if (!chartData || !Array.isArray(chartData.keyEvents)) return [];
      return chartData.keyEvents.map(function(item) {
        var eventTimeRaw = String(item.eventTimeKst || '').replace(timeTokenRegex, '').trim();
        var eventTime = parseKstDateTime(eventTimeRaw);
        var name = String(item.eventName || '').trim();
        var bracketCountry = (name.match(/^\[([A-Z]{2,5})\]/) || [])[1] || '';
        return {
          country: String(item.country || bracketCountry || 'GLOBAL').trim(),
          name: name,
          nameKo: String(item.eventNameKo || '').trim(),
          dateTime: eventTime,
          importance: normalizeImportanceToken(item.importance),
          previous: String(item.previousValue || '').trim(),
          consensus: String(item.consensus || '').trim(),
          actual: String(item.actualValue || '').trim(),
          status: String(item.status || '').trim(),
          dday: String(item.dday || '').trim(),
          impact: String(item.impactGuide || '').trim(),
          watchAssets: Array.isArray(item.watchAssets)
            ? item.watchAssets.map(function(v) { return String(v).trim(); }).filter(Boolean)
            : [],
          isHoliday: /휴장|holiday|closed|공휴일|대체휴일/i.test(name),
          raw: name
        };
      }).filter(function(e) {
        return e.name && e.dateTime && !isNaN(e.dateTime.getTime());
      });
    }

    function parseScheduleItem(text) {
      var raw = String(text || '').replace(/\s+/g, ' ').trim();

      var compactHead = raw.match(/^\[(상|중|하|high|medium|low)\]\[([^\]]+)\]\[(D(?:[+\-]\d+|ay))\]\s*(?:\[[A-Z]{2,5}\]\s*)?(.+?)\s+시각:\s*/i);
      var compactTime = raw.match(scheduleTimeRegex);
      if (compactHead && compactTime) {
        var compactImportance = normalizeImportanceToken(compactHead[1]);
        var compactCountry = compactHead[2].trim();
        var compactName = compactHead[4].trim();
        var compactDateTime = parseKstDateTime(compactTime[1]);
        var compactStatusMatch = raw.match(/상태:\s*(예정|발표|마감)/);
        var compactImpactMatch = raw.match(/영향:\s*(.+?)(?:\s+체크:|$)/);
        var compactWatchMatch = raw.match(/체크:\s*(.+?)$/);
        var compactDataMatch = raw.match(/데이터:\s*(.+?)(?:\s+영향:|$)/);
        var compactNameKoMatch = raw.match(/번역:\s*(.+?)(?:\s+데이터:|$)/);
        if (!compactNameKoMatch) {
          compactNameKoMatch = raw.match(/상태:\s*(?:예정|발표|마감)\s+(.+?)\s+데이터:/);
        }

        var compactPrevious = '';
        var compactConsensus = '';
        var compactActual = '';
        if (compactDataMatch) {
          var compactDataText = compactDataMatch[1];
          var compactPrevMatch = compactDataText.match(/이전\s*([^|]+)/);
          var compactConsMatch = compactDataText.match(/예상\s*([^|]+)/);
          var compactActMatch = compactDataText.match(/실제\s*([^|]+)/);
          compactPrevious = compactPrevMatch ? compactPrevMatch[1].trim() : '';
          compactConsensus = compactConsMatch ? compactConsMatch[1].trim() : '';
          compactActual = compactActMatch ? compactActMatch[1].trim() : '';
        }

        return {
          country: compactCountry,
          name: compactName,
          nameKo: compactNameKoMatch ? compactNameKoMatch[1].trim() : '',
          dateTime: compactDateTime,
          importance: compactImportance,
          previous: compactPrevious,
          consensus: compactConsensus,
          actual: compactActual,
          status: compactStatusMatch ? compactStatusMatch[1] : '',
          dday: compactHead[3],
          impact: compactImpactMatch ? compactImpactMatch[1].trim() : '',
          watchAssets: compactWatchMatch
            ? compactWatchMatch[1].split(',').map(function(v) { return v.trim(); }).filter(Boolean)
            : [],
          isHoliday: /휴장|holiday|closed|공휴일|대체휴일/i.test(compactName),
          raw: raw
        };
      }

      var modernHead = raw.match(/\[(상|중|하|high|medium|low)\]\s*\[([^\]]+)\]\s*(?:\[[A-Z]{2,5}\]\s*)?(.+?)\s*\((D(?:[+\-]\d+|ay))\)/i);
      var modernTime = raw.match(scheduleTimeRegex);
      if (modernHead && modernTime) {
        var modernImportance = normalizeImportanceToken(modernHead[1]);
        var modernCountry = modernHead[2].trim();
        var modernName = modernHead[3].trim();
        var modernDateTime = parseKstDateTime(modernTime[1]);
        var statusMatch = raw.match(/상태:\s*(예정|발표|마감)/);
        var impactMatch = raw.match(/영향:\s*(.+?)(?:\s+체크:|$)/);
        var watchMatch = raw.match(/체크:\s*(.+?)$/);
        var dataMatch = raw.match(/데이터:\s*(.+?)(?:\s+영향:|$)/);
        var nameKoMatch = raw.match(/번역:\s*(.+?)(?:\s+데이터:|$)/);
        if (!nameKoMatch) {
          nameKoMatch = raw.match(/상태:\s*(?:예정|발표|마감)\s+(.+?)\s+데이터:/);
        }

        var previous = '';
        var consensus = '';
        var actual = '';
        if (dataMatch) {
          var dataText = dataMatch[1];
          var prevMatch = dataText.match(/이전\s*([^|]+)/);
          var consMatch = dataText.match(/예상\s*([^|]+)/);
          var actMatch = dataText.match(/실제\s*([^|]+)/);
          previous = prevMatch ? prevMatch[1].trim() : '';
          consensus = consMatch ? consMatch[1].trim() : '';
          actual = actMatch ? actMatch[1].trim() : '';
        }

        return {
          country: modernCountry,
          name: modernName,
          nameKo: nameKoMatch ? nameKoMatch[1].trim() : '',
          dateTime: modernDateTime,
          importance: modernImportance,
          previous: previous,
          consensus: consensus,
          actual: actual,
          status: statusMatch ? statusMatch[1] : '',
          dday: modernHead[4],
          impact: impactMatch ? impactMatch[1].trim() : '',
          watchAssets: watchMatch ? watchMatch[1].split(',').map(function(v) { return v.trim(); }).filter(Boolean) : [],
          isHoliday: /휴장|holiday|closed|공휴일|대체휴일/i.test(modernName),
          raw: raw
        };
      }

      var m = raw.match(legacyScheduleRegex);
      if (!m) return null;

      var country = m[1].toUpperCase();
      var name = m[2].trim();
      var dateTime = parseKstDateTime(m[3]);
      var importance = m[4].toLowerCase();
      var extra = (m[5] || '').trim();
      var prev = '';
      var cons = '';
      var act = '';

      if (extra) {
        var prevLegacy = extra.match(/이전:\s*([^,\)]+)/);
        var consLegacy = extra.match(/예상:\s*([^,\)]+)/);
        var actLegacy = extra.match(/실제:\s*([^,\)]+)/);
        prev = prevLegacy ? prevLegacy[1].trim() : '';
        cons = consLegacy ? consLegacy[1].trim() : '';
        act = actLegacy ? actLegacy[1].trim() : '';
      }

      return {
        country: country,
        name: name,
        nameKo: '',
        dateTime: dateTime,
        importance: importance,
        previous: prev,
        consensus: cons,
        actual: act,
        status: '',
        dday: '',
        impact: '',
        watchAssets: [],
        isHoliday: /휴장|holiday|closed|공휴일|대체휴일/i.test(name),
        raw: raw
      };
    }

    return {
      parseKstDateTime: parseKstDateTime,
      kstYmd: kstYmd,
      getKrxHolidaySet: getKrxHolidaySet,
      formatKst: formatKst,
      getKstNow: getKstNow,
      hasChartKeyEventsPayload: hasChartKeyEventsPayload,
      parseKeyEventsFromChartData: parseKeyEventsFromChartData,
      parseScheduleItem: parseScheduleItem
    };
  };
})();
