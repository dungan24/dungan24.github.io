(function () {
  "use strict";

  var ns = (window.MPCalendar = window.MPCalendar || {});

  ns.createRenderer = function (parser, model) {
    function convertScheduleToCalendar(section) {
      var config = window.MP_CONFIG || {};
      var labels = config.labels || {};
      var calConfig = config.calendar || {};
      var locale = calConfig.locale || "ko-KR";
      var defaultImportanceFilter =
        calConfig.default_importance_filter || "high";
      var defaultPeriodFilter = calConfig.default_period_filter || "pm5";
      var defaultCountryFilter = calConfig.default_country_filter || "all";
      var upcomingLimit = Number(calConfig.upcoming_limit || 20);

      var hasChartPayload = parser.hasChartKeyEventsPayload();
      var events = parser.parseKeyEventsFromChartData();

      if (!hasChartPayload && events.length === 0) {
        var listItems = section.querySelectorAll("li");
        if (!listItems || listItems.length === 0) return;
        listItems.forEach(function (li) {
          var parsed = parser.parseScheduleItem(li.textContent || "");
          if (parsed) events.push(parsed);
        });
      }
      if (events.length === 0 && !hasChartPayload) return;

      events.sort(function (a, b) {
        var at = a.dateTime ? a.dateTime.getTime() : 0;
        var bt = b.dateTime ? b.dateTime.getTime() : 0;
        return at - bt;
      });

      var now = parser.getKstNow();
      var anchor = model.getMonthAnchor(events, now);
      var cells = model.buildCalendarModel(
        anchor.year,
        anchor.month,
        events,
        now,
      );
      var weekday = calConfig.weekdays || [
        "일",
        "월",
        "화",
        "수",
        "목",
        "금",
        "토",
      ];

      var calendar = document.createElement("div");
      calendar.className = "mp-calendar mp-glass-card";

      var title = document.createElement("div");
      title.className = "mp-calendar__title mp-section-label";
      title.textContent =
        (labels.market_calendar_title || "Market Calendar") +
        " — " +
        anchor.year +
        "." +
        String(anchor.month).padStart(2, "0");
      calendar.appendChild(title);

      var grid = document.createElement("div");
      grid.className = "mp-calendar__grid";

      weekday.forEach(function (w, idx) {
        var head = document.createElement("div");
        head.className = "mp-calendar__weekday";
        if (idx === 0) head.classList.add("is-sun");
        if (idx === 6) head.classList.add("is-sat");
        head.textContent = w;
        grid.appendChild(head);
      });

      // 공유 툴팁 요소 생성 (없으면 생성)
      var sharedTooltip = document.getElementById("mp-shared-tooltip");
      if (!sharedTooltip) {
        sharedTooltip = document.createElement("div");
        sharedTooltip.id = "mp-shared-tooltip";
        sharedTooltip.className = "mp-calendar__tooltip-shared";
        document.body.appendChild(sharedTooltip);
      }

      function escapeHtml(str) {
        return String(str || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      function updateTooltip(c, e) {
        if (!c.tooltipData || (!c.tooltipData.events.length && !c.isHoliday)) {
          sharedTooltip.classList.remove("is-active");
          return;
        }

        var html =
          '<div class="mp-calendar__tooltip-header">' +
          escapeHtml(c.key) +
          "</div>";

        if (c.isHoliday) {
          html +=
            '<div class="mp-calendar__tooltip-holiday">' +
            escapeHtml(labels.holiday_label || "🇰🇷 KR 휴장 (국내 증시 휴장)") +
            "</div>";
        }

        html += '<div class="mp-calendar__tooltip-list">';

        c.tooltipData.events.forEach(function (ev) {
          html +=
            '<div class="mp-calendar__tooltip-item is-' +
            ev.importance +
            '">' +
            '<div class="mp-calendar__tooltip-top">' +
            '<span class="mp-calendar__tooltip-time">' +
            escapeHtml(ev.time) +
            "</span>" +
            '<span class="mp-calendar__tooltip-country">[' +
            escapeHtml(ev.country) +
            "]</span>" +
            "</div>" +
            '<div class="mp-calendar__tooltip-name">' +
            escapeHtml(ev.nameKo || ev.name) +
            "</div>" +
            '<div class="mp-calendar__tooltip-status">' +
            '<span class="mp-status-chip is-mini is-' +
            model.getStatusBadgeClass(ev.status) +
            '">' +
            escapeHtml(ev.status) +
            "</span>" +
            '<span class="mp-importance is-mini is-' +
            ev.importance +
            '">' +
            escapeHtml(ev.importance.toUpperCase()) +
            "</span>" +
            "</div></div>";
        });
        html += "</div>";

        sharedTooltip.innerHTML = html;
        sharedTooltip.classList.add("is-active");
        moveTooltip(e);
      }

      function moveTooltip(e) {
        var x = e.clientX + 15;
        var y = e.clientY + 15;

        var tw = sharedTooltip.offsetWidth;
        var th = sharedTooltip.offsetHeight;
        var ww = window.innerWidth;
        var wh = window.innerHeight;

        if (x + tw > ww) x = e.clientX - tw - 15;
        if (y + th > wh) y = e.clientY - th - 15;

        sharedTooltip.style.left = x + "px";
        sharedTooltip.style.top = y + "px";
      }

      cells.forEach(function (c) {
        var cell = document.createElement("div");
        cell.className = "mp-calendar__cell";
        if (!c.inCurrent) cell.classList.add("is-outside");
        if (c.dow === 0) cell.classList.add("is-sun");
        if (c.dow === 6) cell.classList.add("is-sat");
        if (c.isHoliday) cell.classList.add("is-holiday");
        if (c.isToday) cell.classList.add("is-today");

        var day = document.createElement("span");
        day.className = "mp-calendar__day";
        day.textContent = String(c.day);
        cell.appendChild(day);

        if (c.eventCount > 0) {
          var markers = document.createElement("div");
          markers.className = "mp-calendar__markers";
          if (c.highCount > 0) cell.classList.add("has-high-importance");
          var displayCount = Math.min(c.eventCount, 3);
          for (var m = 0; m < displayCount; m++) {
            var marker = document.createElement("span");
            marker.className = "mp-calendar__marker";
            if (m < c.highCount) marker.classList.add("is-high");
            markers.appendChild(marker);
          }
          cell.appendChild(markers);
        }

        cell.addEventListener("mouseenter", function (e) {
          updateTooltip(c, e);
        });
        cell.addEventListener("mousemove", function (e) {
          moveTooltip(e);
        });
        cell.addEventListener("mouseleave", function () {
          sharedTooltip.classList.remove("is-active");
        });

        grid.appendChild(cell);
      });

      calendar.appendChild(grid);

      var upcomingWrap = document.createElement("div");
      upcomingWrap.className = "mp-upcoming";

      var upcomingTitle = document.createElement("div");
      upcomingTitle.className = "mp-upcoming__title";
      upcomingTitle.textContent =
        labels.upcoming_events_title || "주요 일정 (최근)";
      upcomingWrap.appendChild(upcomingTitle);

      var upcomingList = document.createElement("div");
      upcomingList.className = "mp-upcoming__list";

      var filterState = {
        importance: defaultImportanceFilter,
        period: defaultPeriodFilter,
        country: defaultCountryFilter,
      };

      var upcomingEvents = events.filter(function (e) {
        return e.dateTime && !isNaN(e.dateTime.getTime());
      });

      var filterBar = document.createElement("div");
      filterBar.className = "mp-upcoming__filters";

      function createFilterGroup(label, options, key) {
        var group = document.createElement("div");
        group.className = "mp-filter-group";

        var labelEl = document.createElement("span");
        labelEl.className = "mp-filter-group__label";
        labelEl.textContent = label;
        group.appendChild(labelEl);

        var pills = document.createElement("div");
        pills.className = "mp-filter-pills";

        options.forEach(function (opt) {
          var pill = document.createElement("button");
          pill.className = "mp-filter-pill";
          if (filterState[key] === opt.value) pill.classList.add("is-active");
          pill.textContent = opt.label;
          pill.addEventListener("click", function () {
            filterState[key] = opt.value;
            group.querySelectorAll(".mp-filter-pill").forEach(function (p) {
              p.classList.remove("is-active");
            });
            pill.classList.add("is-active");
            renderUpcomingList();
          });
          pills.appendChild(pill);
        });
        group.appendChild(pills);
        return group;
      }

      filterBar.appendChild(
        createFilterGroup(
          labels.filter_importance || "중요도",
          [
            { label: labels.filter_high || "상", value: "high" },
            {
              label: labels.filter_high_medium || "상+중",
              value: "high-medium",
            },
            { label: labels.filter_all || "전체", value: "all" },
          ],
          "importance",
        ),
      );

      filterBar.appendChild(
        createFilterGroup(
          labels.filter_period || "기간",
          [
            { label: labels.filter_pm5 || "±5일", value: "pm5" },
            { label: labels.filter_pm10 || "±10일", value: "pm10" },
            { label: labels.filter_pm20 || "±20일", value: "pm20" },
            { label: labels.filter_all || "전체", value: "all" },
          ],
          "period",
        ),
      );

      filterBar.appendChild(
        createFilterGroup(
          labels.filter_country || "국가",
          [
            { label: labels.filter_all || "전체", value: "all" },
            { label: labels.filter_country_us || "미국", value: "us" },
            { label: labels.filter_country_kr || "한국", value: "kr" },
          ],
          "country",
        ),
      );

      upcomingWrap.appendChild(filterBar);

      function renderUpcomingList() {
        upcomingList.innerHTML = "";
        if (upcomingEvents.length === 0) {
          var empty = document.createElement("div");
          empty.className = "mp-upcoming__empty";
          empty.textContent =
            labels.empty_events || "표시할 주요 일정 데이터가 없습니다.";
          upcomingList.appendChild(empty);
          return;
        }

        var filtered = upcomingEvents.filter(function (e) {
          return model.matchesUpcomingFilter(e, filterState, now);
        });
        var visible = model.selectUpcomingEvents(filtered, upcomingLimit);

        if (visible.length === 0) {
          var emptyFiltered = document.createElement("div");
          emptyFiltered.className = "mp-upcoming__empty";
          emptyFiltered.textContent =
            labels.empty_filtered || "필터 조건에 맞는 일정이 없습니다.";
          upcomingList.appendChild(emptyFiltered);
          return;
        }

        var lastDateStr = "";

        visible.forEach(function (e) {
          var currentDateStr = e.dateTime.toLocaleDateString(locale, {
            month: "2-digit",
            day: "2-digit",
            weekday: "short",
            timeZone: calConfig.timezone || "Asia/Seoul",
          });

          if (currentDateStr !== lastDateStr) {
            var dateDivider = document.createElement("div");
            dateDivider.className = "mp-upcoming__date-divider";
            dateDivider.innerHTML =
              '<span class="mp-upcoming__date-text">' +
              escapeHtml(currentDateStr) +
              "</span>";
            upcomingList.appendChild(dateDivider);
            lastDateStr = currentDateStr;
          }

          var card = document.createElement("div");
          card.className = "mp-upcoming__item";
          if (e.importance) {
            card.classList.add("is-" + e.importance);
          }

          var timeAxis = document.createElement("div");
          timeAxis.className = "mp-upcoming__time-axis";
          // WHY: getHours()는 로컬 시간 의존적이므로 parser.formatKst에서 시간 추출 사용 (KST 고정)
          var kstStr =
            typeof parser.formatKst === "function"
              ? parser.formatKst(e.dateTime)
              : "";
          var timePart = kstStr.split(" ")[1] || "00:00";
          var timeStr = timePart === "00:00" ? "--:--" : timePart;
          timeAxis.innerHTML =
            '<span class="mp-upcoming__time">' +
            escapeHtml(timeStr) +
            '</span><span class="mp-upcoming__dot-line"></span>';
          card.appendChild(timeAxis);

          var content = document.createElement("div");
          content.className = "mp-upcoming__content";

          var head = document.createElement("div");
          head.className = "mp-upcoming__head";

          var left = document.createElement("span");
          left.className = "mp-upcoming__event";
          left.textContent = "[" + e.country + "] " + e.name;
          head.appendChild(left);

          var badges = document.createElement("div");
          badges.className = "mp-upcoming__badges";

          var imp = document.createElement("span");
          imp.className = "mp-importance is-" + e.importance;
          imp.textContent = e.importance.toUpperCase();
          badges.appendChild(imp);

          var status = model.getEventStatus(e, now);
          card.classList.add("is-status-" + model.getStatusBadgeClass(status));
          var statusBadge = document.createElement("span");
          statusBadge.className =
            "mp-status-chip is-" + model.getStatusBadgeClass(status);
          statusBadge.textContent = status;
          badges.appendChild(statusBadge);

          if (e.dday) {
            var ddayBadge = document.createElement("span");
            ddayBadge.className = "mp-dday-chip";
            ddayBadge.textContent = e.dday;
            badges.appendChild(ddayBadge);
          }

          head.appendChild(badges);
          content.appendChild(head);

          var meta = document.createElement("div");
          meta.className = "mp-upcoming__meta";
          var pieces = [];
          if (e.previous) pieces.push("이전: " + e.previous);
          if (e.consensus) pieces.push("예상: " + e.consensus);
          if (e.actual) pieces.push("실제: " + e.actual);
          meta.textContent = pieces.join(" · ");
          if (pieces.length > 0) content.appendChild(meta);

          if (e.nameKo && e.nameKo !== e.name) {
            var translation = document.createElement("div");
            translation.className = "mp-upcoming__translation";
            translation.textContent = e.nameKo;
            content.appendChild(translation);
          }

          var impact = document.createElement("div");
          impact.className = "mp-upcoming__impact";
          impact.textContent = e.impact || "발표 전후 시장 반응 점검";
          content.appendChild(impact);

          card.appendChild(content);
          upcomingList.appendChild(card);
        });
      }

      renderUpcomingList();
      upcomingWrap.appendChild(upcomingList);

      var h2 = section.querySelector("h2");
      if (!h2) return;
      while (h2.nextSibling) section.removeChild(h2.nextSibling);
      section.appendChild(calendar);
      section.appendChild(upcomingWrap);
    }

    return {
      convertScheduleToCalendar: convertScheduleToCalendar,
    };
  };
})();
