(function() {
  'use strict';

  var ns = window.MPCalendar = window.MPCalendar || {};

  ns.createModel = function(parser) {
    function getEventStatus(event, now) {
      if (event.status === '예정' || event.status === '발표' || event.status === '마감') {
        return event.status;
      }
      if (!event.dateTime || isNaN(event.dateTime.getTime())) return '예정';
      if (event.actual) return '발표';
      return event.dateTime.getTime() <= now.getTime() ? '마감' : '예정';
    }

    function getStatusBadgeClass(status) {
      if (status === '발표') return 'released';
      if (status === '마감') return 'closed';
      return 'scheduled';
    }

    function isKoreanScheduleEvent(event) {
      var country = String(event && event.country ? event.country : '').trim().toUpperCase();
      if (country === 'KR' || country === 'KOR' || country === 'KRW' || country === '한국') return true;
      var raw = String(event && event.raw ? event.raw : '');
      return /^\[(KR|KOR|KRW)\]/i.test(raw) || /\[한국\]/.test(raw);
    }

    function selectUpcomingEvents(events, limit) {
      if (!Array.isArray(events) || events.length <= limit) return events || [];
      var selected = events.slice(0, limit);
      var hasKorean = selected.some(function(e) { return isKoreanScheduleEvent(e); });
      if (!hasKorean) {
        var koreanCandidate = events.find(function(e) { return isKoreanScheduleEvent(e); });
        if (koreanCandidate) {
          selected[selected.length - 1] = koreanCandidate;
          selected.sort(function(a, b) {
            return a.dateTime.getTime() - b.dateTime.getTime();
          });
        }
      }
      return selected;
    }

    function normalizeCountryBucket(country) {
      var c = String(country || '').trim().toUpperCase();
      if (c === '미국' || c === 'USD' || c === 'US') return 'us';
      if (c === '한국' || c === 'KR' || c === 'KOR' || c === 'KRW') return 'kr';
      return 'other';
    }

    function getKstDayDiff(eventDate, now) {
      var eventYmd = parser.kstYmd(eventDate || now);
      var nowYmd = parser.kstYmd(now);
      var e = new Date(eventYmd + 'T00:00:00Z');
      var n = new Date(nowYmd + 'T00:00:00Z');
      return Math.round((e.getTime() - n.getTime()) / (24 * 60 * 60 * 1000));
    }

    function matchesUpcomingFilter(event, filterState, now) {
      if (filterState.importance === 'high' && event.importance !== 'high') return false;
      if (filterState.importance === 'high-medium' && event.importance === 'low') return false;
      var periodDiff = getKstDayDiff(event.dateTime, now);
      if (filterState.period === 'pm10' && (periodDiff < -10 || periodDiff > 10)) return false;
      if (filterState.period === 'pm20' && (periodDiff < -20 || periodDiff > 20)) return false;
      if (filterState.period === 'pm30' && (periodDiff < -30 || periodDiff > 30)) return false;
      if (filterState.country !== 'all' && normalizeCountryBucket(event.country) !== filterState.country) return false;
      return true;
    }

    function getMonthAnchor(events, now) {
      if (!events || events.length === 0) return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
      var valid = events.filter(function(e) { return e.dateTime && !isNaN(e.dateTime.getTime()); });
      if (valid.length === 0) return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };

      var nearest = valid[0];
      var minDiff = Math.abs(nearest.dateTime.getTime() - now.getTime());
      valid.forEach(function(e) {
        var diff = Math.abs(e.dateTime.getTime() - now.getTime());
        if (diff < minDiff) {
          minDiff = diff;
          nearest = e;
        }
      });

      var p = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit'
      }).formatToParts(nearest.dateTime).reduce(function(acc, cur) {
        acc[cur.type] = cur.value;
        return acc;
      }, {});
      return { year: Number(p.year), month: Number(p.month) };
    }

    function buildCalendarModel(year, month, events, now) {
      var firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
      var daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
      var prevMonthDays = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();

      var eventMap = {};
      events.forEach(function(e) {
        if (!e.dateTime || isNaN(e.dateTime.getTime())) return;
        var parts = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).formatToParts(e.dateTime).reduce(function(acc, cur) {
          acc[cur.type] = cur.value;
          return acc;
        }, {});

        var key = parts.year + '-' + parts.month + '-' + parts.day;
        if (!eventMap[key]) eventMap[key] = [];
        eventMap[key].push(e);
      });

      var cells = [];
      for (var i = 0; i < 42; i++) {
        var dayNum = i - firstWeekday + 1;
        var cellYear = year;
        var cellMonth = month;
        var inCurrent = true;

        if (dayNum <= 0) {
          inCurrent = false;
          cellMonth = month - 1;
          if (cellMonth <= 0) {
            cellMonth = 12;
            cellYear -= 1;
          }
          dayNum = prevMonthDays + dayNum;
        } else if (dayNum > daysInMonth) {
          inCurrent = false;
          cellMonth = month + 1;
          if (cellMonth >= 13) {
            cellMonth = 1;
            cellYear += 1;
          }
          dayNum = dayNum - daysInMonth;
        }

        var mm = String(cellMonth).padStart(2, '0');
        var dd = String(dayNum).padStart(2, '0');
        var key = String(cellYear) + '-' + mm + '-' + dd;

        var dayEvents = (eventMap[key] || []).slice().sort(function(a, b) {
          return a.dateTime.getTime() - b.dateTime.getTime();
        });

        var highCount = dayEvents.filter(function(e) { return e.importance === 'high'; }).length;
        var krHolidaySet = parser.getKrxHolidaySet(cellYear);
        var holiday = krHolidaySet.has(key) || dayEvents.some(function(e) { return e.isHoliday; });

        var lines = [];
        if (holiday) lines.push('KR 휴장');
        dayEvents.forEach(function(e) {
          var st = getEventStatus(e, now);
          lines.push('[' + st + '] ' + parser.formatKst(e.dateTime) + ' · [' + e.country + '] ' + e.name + (e.importance ? ' (' + e.importance + ')' : ''));
        });

        cells.push({
          key: key,
          day: dayNum,
          dow: i % 7,
          inCurrent: inCurrent,
          eventCount: dayEvents.length,
          highCount: highCount,
          isHoliday: holiday,
          isToday: key === parser.kstYmd(now),
          tooltipLines: lines
        });
      }

      return cells;
    }

    return {
      getEventStatus: getEventStatus,
      getStatusBadgeClass: getStatusBadgeClass,
      selectUpcomingEvents: selectUpcomingEvents,
      matchesUpcomingFilter: matchesUpcomingFilter,
      getMonthAnchor: getMonthAnchor,
      buildCalendarModel: buildCalendarModel
    };
  };
})();
