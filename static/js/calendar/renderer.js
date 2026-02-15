(function() {
  'use strict';

  var ns = window.MPCalendar = window.MPCalendar || {};

  ns.createRenderer = function(parser, model) {
    function convertScheduleToCalendar(section) {
      var hasChartPayload = parser.hasChartKeyEventsPayload();
      var events = parser.parseKeyEventsFromChartData();

      if (!hasChartPayload && events.length === 0) {
        var listItems = section.querySelectorAll('li');
        if (!listItems || listItems.length === 0) return;
        listItems.forEach(function(li) {
          var parsed = parser.parseScheduleItem(li.textContent || '');
          if (parsed) events.push(parsed);
        });
      }
      if (events.length === 0 && !hasChartPayload) return;

      events.sort(function(a, b) {
        var at = a.dateTime ? a.dateTime.getTime() : 0;
        var bt = b.dateTime ? b.dateTime.getTime() : 0;
        return at - bt;
      });

      var now = parser.getKstNow();
      var anchor = model.getMonthAnchor(events, now);
      var cells = model.buildCalendarModel(anchor.year, anchor.month, events, now);
      var weekday = ['일', '월', '화', '수', '목', '금', '토'];

      var calendar = document.createElement('div');
      calendar.className = 'mp-calendar';

      var title = document.createElement('div');
      title.className = 'mp-calendar__title';
      title.textContent = anchor.year + '-' + String(anchor.month).padStart(2, '0');
      calendar.appendChild(title);

      var grid = document.createElement('div');
      grid.className = 'mp-calendar__grid';

      weekday.forEach(function(w, idx) {
        var head = document.createElement('div');
        head.className = 'mp-calendar__weekday';
        if (idx === 0) head.classList.add('is-sun');
        if (idx === 6) head.classList.add('is-sat');
        head.textContent = w;
        grid.appendChild(head);
      });

      cells.forEach(function(c) {
        var cell = document.createElement('div');
        cell.className = 'mp-calendar__cell';
        if (!c.inCurrent) cell.classList.add('is-outside');
        if (c.dow === 0) cell.classList.add('is-sun');
        if (c.dow === 6) cell.classList.add('is-sat');
        if (c.isHoliday) cell.classList.add('is-holiday');
        if (c.isToday) cell.classList.add('is-today');

        var day = document.createElement('span');
        day.className = 'mp-calendar__day';
        day.textContent = String(c.day);
        cell.appendChild(day);

        if (c.eventCount > 0) {
          var dot = document.createElement('span');
          dot.className = 'mp-calendar__dot';
          if (c.highCount > 0) dot.classList.add('is-high');
          dot.textContent = c.highCount > 0 ? ('H' + c.highCount) : String(c.eventCount);
          cell.appendChild(dot);
        }

        if (c.tooltipLines && c.tooltipLines.length > 0) {
          var tip = document.createElement('div');
          tip.className = 'mp-calendar__tooltip';
          c.tooltipLines.forEach(function(line) {
            var tipLine = document.createElement('div');
            tipLine.className = 'mp-calendar__tooltip-line';
            tipLine.textContent = line;
            tip.appendChild(tipLine);
          });
          cell.appendChild(tip);
        }

        grid.appendChild(cell);
      });

      calendar.appendChild(grid);

      var upcomingWrap = document.createElement('div');
      upcomingWrap.className = 'mp-upcoming';

      var upcomingTitle = document.createElement('div');
      upcomingTitle.className = 'mp-upcoming__title';
      upcomingTitle.textContent = '주요 일정 (최근)';
      upcomingWrap.appendChild(upcomingTitle);

      var upcomingList = document.createElement('div');
      upcomingList.className = 'mp-upcoming__list';

      var filterState = {
        importance: 'high',
        period: 'pm10',
        country: 'all'
      };

      var upcomingEvents = events.filter(function(e) {
        return e.dateTime && !isNaN(e.dateTime.getTime());
      });

      var filterBar = document.createElement('div');
      filterBar.className = 'mp-upcoming__filters';

      var importanceSelect = document.createElement('select');
      importanceSelect.className = 'mp-upcoming__filter-select';
      importanceSelect.innerHTML = '<option value="high">중요도: 상</option><option value="high-medium">중요도: 상+중</option><option value="all">중요도: 전체</option>';
      importanceSelect.value = 'high';
      filterBar.appendChild(importanceSelect);

      var periodSelect = document.createElement('select');
      periodSelect.className = 'mp-upcoming__filter-select';
      periodSelect.innerHTML = '<option value="pm10">기간: -10일~+10일</option><option value="pm20">기간: -20일~+20일</option><option value="pm30">기간: -30일~+30일</option><option value="all">기간: 전체</option>';
      periodSelect.value = 'pm10';
      filterBar.appendChild(periodSelect);

      var countrySelect = document.createElement('select');
      countrySelect.className = 'mp-upcoming__filter-select';
      countrySelect.innerHTML = '<option value="all">국가: 전체</option><option value="us">국가: 미국</option><option value="kr">국가: 한국</option>';
      filterBar.appendChild(countrySelect);
      upcomingWrap.appendChild(filterBar);

      function renderUpcomingList() {
        upcomingList.innerHTML = '';
        if (upcomingEvents.length === 0) {
          var empty = document.createElement('div');
          empty.className = 'mp-upcoming__empty';
          empty.textContent = '표시할 주요 일정 데이터가 없습니다.';
          upcomingList.appendChild(empty);
          return;
        }

        var filtered = upcomingEvents.filter(function(e) {
          return model.matchesUpcomingFilter(e, filterState, now);
        });
        var visible = model.selectUpcomingEvents(filtered, 20);

        if (visible.length === 0) {
          var emptyFiltered = document.createElement('div');
          emptyFiltered.className = 'mp-upcoming__empty';
          emptyFiltered.textContent = '필터 조건에 맞는 일정이 없습니다. 기간/국가/중요도 필터를 조정해 보세요.';
          upcomingList.appendChild(emptyFiltered);
          return;
        }

        visible.forEach(function(e) {
          var card = document.createElement('div');
          card.className = 'mp-upcoming__item';

          var head = document.createElement('div');
          head.className = 'mp-upcoming__head';

          var left = document.createElement('span');
          left.className = 'mp-upcoming__event';
          left.textContent = '[' + e.country + '] ' + e.name;
          head.appendChild(left);

          var badges = document.createElement('div');
          badges.className = 'mp-upcoming__badges';

          var imp = document.createElement('span');
          imp.className = 'mp-importance is-' + e.importance;
          imp.textContent = e.importance.toUpperCase();
          badges.appendChild(imp);

          var status = model.getEventStatus(e, now);
          var statusBadge = document.createElement('span');
          statusBadge.className = 'mp-status-chip is-' + model.getStatusBadgeClass(status);
          statusBadge.textContent = status;
          badges.appendChild(statusBadge);

          if (e.dday) {
            var ddayBadge = document.createElement('span');
            ddayBadge.className = 'mp-dday-chip';
            ddayBadge.textContent = e.dday;
            badges.appendChild(ddayBadge);
          }

          head.appendChild(badges);

          var meta = document.createElement('div');
          meta.className = 'mp-upcoming__meta';
          var pieces = [parser.formatKst(e.dateTime), '상태: ' + status];
          if (e.previous) pieces.push('이전: ' + e.previous);
          if (e.consensus) pieces.push('예상: ' + e.consensus);
          if (e.actual) pieces.push('실제: ' + e.actual);
          meta.textContent = pieces.join('  ·  ');

          var translation = null;
          if (e.nameKo && e.nameKo !== e.name) {
            translation = document.createElement('div');
            translation.className = 'mp-upcoming__translation';
            translation.textContent = e.nameKo;
          }

          var impact = document.createElement('div');
          impact.className = 'mp-upcoming__impact';
          impact.textContent = e.impact
            ? ('영향: ' + e.impact)
            : '영향: 발표 전후 금리·달러·지수선물 반응 점검';

          var watch = document.createElement('div');
          watch.className = 'mp-upcoming__watch';
          var watchText = (e.watchAssets && e.watchAssets.length > 0)
            ? e.watchAssets.join(', ')
            : '미국채10년, DXY, 나스닥100선물';
          watch.textContent = '체크: ' + watchText;

          card.appendChild(head);
          card.appendChild(meta);
          if (translation) card.appendChild(translation);
          card.appendChild(impact);
          card.appendChild(watch);
          upcomingList.appendChild(card);
        });
      }

      importanceSelect.addEventListener('change', function() {
        filterState.importance = importanceSelect.value;
        renderUpcomingList();
      });
      periodSelect.addEventListener('change', function() {
        filterState.period = periodSelect.value;
        renderUpcomingList();
      });
      countrySelect.addEventListener('change', function() {
        filterState.country = countrySelect.value;
        renderUpcomingList();
      });

      renderUpcomingList();
      upcomingWrap.appendChild(upcomingList);

      var h2 = section.querySelector('h2');
      if (!h2) return;
      while (h2.nextSibling) section.removeChild(h2.nextSibling);
      section.appendChild(calendar);
      section.appendChild(upcomingWrap);
    }

    return {
      convertScheduleToCalendar: convertScheduleToCalendar
    };
  };
})();
