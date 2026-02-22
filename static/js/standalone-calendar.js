/**
 * standalone-calendar.js
 * 독립 캘린더 페이지(/market-calendar/)용 데이터 로더 + 월 네비게이션 + 모바일 터치
 *
 * WHY: 기존 캘린더는 개별 브리핑 포스트 내에서만 렌더링됨.
 *      독립 페이지에서는 chart-data JSON들을 직접 fetch하여
 *      기존 파이프라인(parser/model/renderer)에 데이터를 공급함.
 *
 * 의존: mp-config.js, calendar/parser.js, calendar/model.js, calendar/renderer.js,
 *       market-pulse-calendar.js, briefing/calendar-loader.js
 */
(function () {
  "use strict";

  // ── 자가 가드: #mp-standalone-calendar가 있을 때만 실행 ──
  var container = document.getElementById("mp-standalone-calendar");
  if (!container) return;

  var config = window.MP_CONFIG || window.__MP_CONFIG || {};
  var paths = config.paths || {};
  var calendar = config.calendar || {};
  var labels = config.labels || {};
  var timeZone = calendar.timezone || "Asia/Seoul";
  var chartDataPrefix = paths.chart_data_prefix || "data/chart-data-";
  if (chartDataPrefix.charAt(0) !== "/")
    chartDataPrefix = "/" + chartDataPrefix;

  var LOOKBACK_DAYS = 14;
  var MOBILE_BP = (calendar && calendar.mobile_breakpoint) || 768;

  // ── 유틸 ──
  function fmtDate(d) {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  }

  // ── 날짜 URL 생성 (주말 스킵) ──
  function buildUrls() {
    var now = new Date();
    var urls = [];
    var i = 0;
    while (urls.length <= LOOKBACK_DAYS) {
      var d = new Date(now.getTime() - 86400000 * i);
      i++;
      // 주말 스킵 — KST 기준 요일 확인
      var dayStr = new Intl.DateTimeFormat("en-US", {
        timeZone: timeZone,
        weekday: "short",
      }).format(d);
      if (dayStr === "Sat" || dayStr === "Sun") continue;
      urls.push(chartDataPrefix + fmtDate(d) + ".json");
    }
    return urls;
  }

  // ── 중복 제거 키 ──
  function eventKey(ev) {
    return (ev.eventName || "") + "|" + (ev.eventTimeKst || "");
  }

  // ── HTML 이스케이프 (renderer.js의 ns.escapeHtml 재사용, fallback 포함) ──
  var escapeHtml =
    (window.MPCalendar && window.MPCalendar.escapeHtml) ||
    function (str) {
      return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    };

  // ── 병렬 fetch + 중복 제거 ──
  // WHY: 최신→과거 14영업일 JSON을 한번에 가져와 병합.
  // 404는 조용히 무시 (파이프라인이 아직 없는 과거 날짜).
  function fetchAndMerge() {
    var urls = buildUrls();
    var seen = new Set();
    var merged = [];

    var promises = urls.map(function (url, idx) {
      return fetch(url)
        .then(function (r) {
          if (!r.ok) return null;
          return r.json();
        })
        .catch(function () {
          return null;
        })
        .then(function (data) {
          // idx를 함께 반환하여 순서 보존
          return { idx: idx, data: data };
        });
    });

    return Promise.all(promises).then(function (results) {
      // 최신(idx 0) 우선 정렬 후 중복 제거
      results.sort(function (a, b) {
        return a.idx - b.idx;
      });
      results.forEach(function (r) {
        if (r.data && Array.isArray(r.data.keyEvents)) {
          r.data.keyEvents.forEach(function (ev) {
            var key = eventKey(ev);
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(ev);
            }
          });
        }
      });
      return merged;
    });
  }

  // ── 로딩 UI ──
  function showLoading() {
    container.innerHTML =
      '<div class="mp-standalone-loading">' +
      '<div class="mp-standalone-loading__spinner"></div>' +
      '<div class="mp-standalone-loading__text">' +
      (labels.chart_data_unavailable || "캘린더 데이터를 불러오는 중...") +
      "</div></div>";
  }

  function showError(msg) {
    container.innerHTML =
      '<div class="mp-standalone-empty">' +
      (msg || labels.empty_events || "표시할 주요 일정 데이터가 없습니다.") +
      "</div>";
  }

  // ── 메인 실행 ──
  showLoading();

  fetchAndMerge()
    .then(function (mergedEvents) {
      if (mergedEvents.length === 0) {
        showError();
        return;
      }

      // WHY: 기존 파이프라인은 window.__MP_CHART_DATA.keyEvents를 읽음
      window.__MP_CHART_DATA = { keyEvents: mergedEvents };

      // 기존 파이프라인에 데이터 준비 알림
      document.dispatchEvent(new CustomEvent("mp:chart-data-ready"));

      // standalone 페이지에서는 직접 렌더 시도, 기존 파이프라인이 이미 처리했으면 스킵
      var existingGrid = document.querySelector(".mp-calendar__grid");
      if (existingGrid) {
        container.innerHTML = "";
        onCalendarRendered();
      } else {
        // 기존 파이프라인에 한 프레임 여유를 준 뒤 직접 렌더
        requestAnimationFrame(function () {
          if (document.querySelector(".mp-calendar__grid")) {
            container.innerHTML = "";
            onCalendarRendered();
          } else {
            renderCalendarDirectly();
          }
        });
      }
    })
    .catch(function (err) {
      console.warn("Standalone calendar: fetch failed", err);
      showError();
    });

  function renderCalendarDirectly() {
    // WHY: enhancements.js가 캘린더 섹션을 못 찾은 경우 직접 렌더
    var ns = window.MPCalendar || {};
    if (typeof ns.createParser !== "function") {
      showError("캘린더 모듈이 로드되지 않았습니다.");
      return;
    }

    var KRX_PUBLIC_HOLIDAYS = {};
    var calLoader = window.MPBriefing || {};
    // calendar-loader.js에서 KRX_PUBLIC_HOLIDAYS를 가져오려면 createCalendarConverter 사용
    if (typeof calLoader.createCalendarConverter === "function") {
      var converter = calLoader.createCalendarConverter();
      if (converter) {
        // 캘린더 섹션 wrapper 생성
        var wrapper = document.createElement("div");
        var h2 = document.createElement("h2");
        h2.textContent = "이벤트 캘린더";
        wrapper.appendChild(h2);
        container.innerHTML = "";
        container.appendChild(wrapper);

        try {
          converter(wrapper);
          onCalendarRendered();
        } catch (err) {
          console.warn("Standalone calendar: direct render failed", err);
          showError();
        }
        return;
      }
    }

    showError("캘린더 초기화에 실패했습니다.");
  }

  // ── 캘린더 렌더 완료 후 기능 추가 ──
  function onCalendarRendered() {
    addMonthNavigation();
    addMobileTouchSupport();
    addSurpriseIndicators();
  }

  // ══════════════════════════════════════════════
  // Step 4: 월 네비게이션
  // ══════════════════════════════════════════════

  function addMonthNavigation() {
    var titleEl = document.querySelector(".mp-calendar__title");
    if (!titleEl || titleEl.querySelector(".mp-cal-nav")) return;

    // 현재 타이틀에서 year.month 파싱
    var match = titleEl.textContent.match(/(\d{4})\.(\d{2})/);
    if (!match) return;

    var currentYear = parseInt(match[1], 10);
    var currentMonth = parseInt(match[2], 10);

    // 네비게이션 컨테이너
    var nav = document.createElement("div");
    nav.className = "mp-cal-nav";

    var prevBtn = document.createElement("button");
    prevBtn.className = "mp-cal-nav__btn";
    prevBtn.textContent = "\u25C0";
    prevBtn.setAttribute("aria-label", "이전 달");

    var nextBtn = document.createElement("button");
    nextBtn.className = "mp-cal-nav__btn";
    nextBtn.textContent = "\u25B6";
    nextBtn.setAttribute("aria-label", "다음 달");

    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);

    // 타이틀 요소를 flex container로 만들기
    titleEl.classList.add("mp-cal-title--navigable");
    titleEl.appendChild(nav);

    prevBtn.addEventListener("click", function () {
      currentMonth--;
      if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
      }
      rebuildGrid(currentYear, currentMonth);
    });

    nextBtn.addEventListener("click", function () {
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
      rebuildGrid(currentYear, currentMonth);
    });

    function rebuildGrid(year, month) {
      var ns = window.MPCalendar || {};
      if (typeof ns.createParser !== "function") return;

      var KRX_HOLIDAYS =
        (window.MPBriefing && window.MPBriefing.KRX_PUBLIC_HOLIDAYS) || {};

      var parser = ns.createParser(KRX_HOLIDAYS);
      var model = ns.createModel(parser);

      // 기존 이벤트 데이터 파싱
      var events = parser.parseKeyEventsFromChartData();
      var now = parser.getKstNow();
      var cells = model.buildCalendarModel(year, month, events, now);

      // 그리드만 교체
      var grid = document.querySelector(".mp-calendar__grid");
      if (!grid) return;

      // 요일 헤더 유지, 셀만 교체
      var weekdayCount = 7;
      while (grid.children.length > weekdayCount) {
        grid.removeChild(grid.lastChild);
      }

      var calConfig = config.calendar || {};
      var sharedTooltip = document.getElementById("mp-shared-tooltip");

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

        // 데스크탑 툴팁 (기존 로직 재사용)
        cell.addEventListener("mouseenter", function (e) {
          if (window.innerWidth <= MOBILE_BP) return;
          updateTooltip(c, e, sharedTooltip, model);
        });
        cell.addEventListener("mousemove", function (e) {
          if (window.innerWidth <= MOBILE_BP) return;
          moveTooltip(e, sharedTooltip);
        });
        cell.addEventListener("mouseleave", function () {
          if (sharedTooltip) sharedTooltip.classList.remove("is-active");
        });

        // 모바일 터치
        cell.addEventListener("click", function () {
          if (window.innerWidth > MOBILE_BP) return;
          if (
            c.tooltipData &&
            (c.tooltipData.events.length > 0 || c.isHoliday)
          ) {
            showMobileSheet(c);
          }
        });

        grid.appendChild(cell);
      });

      // 타이틀 업데이트
      var titleBase = labels.market_calendar_title || "Market Calendar";
      titleEl.childNodes[0].textContent =
        titleBase + " \u2014 " + year + "." + String(month).padStart(2, "0");
    }
  }

  function updateTooltip(c, e, sharedTooltip, model) {
    if (!sharedTooltip) return;
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
        escapeHtml(labels.holiday_label || "\uD83C\uDDF0\uD83C\uDDF7 KR 휴장") +
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
        (model ? model.getStatusBadgeClass(ev.status) : "scheduled") +
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
    moveTooltip(e, sharedTooltip);
  }

  function moveTooltip(e, sharedTooltip) {
    if (!sharedTooltip) return;
    var x = e.clientX + 15;
    var y = e.clientY + 15;
    var tw = sharedTooltip.offsetWidth;
    var th = sharedTooltip.offsetHeight;
    if (x + tw > window.innerWidth) x = e.clientX - tw - 15;
    if (y + th > window.innerHeight) y = e.clientY - th - 15;
    sharedTooltip.style.left = x + "px";
    sharedTooltip.style.top = y + "px";
  }

  // ══════════════════════════════════════════════
  // Step 5: 모바일 터치 인터랙션 — Bottom Sheet
  // ══════════════════════════════════════════════

  var mobileSheet = null;
  var mobileBackdrop = null;

  function createMobileSheet() {
    if (mobileSheet) return;

    mobileBackdrop = document.createElement("div");
    mobileBackdrop.className = "mp-mobile-backdrop";
    mobileBackdrop.addEventListener("click", closeMobileSheet);

    mobileSheet = document.createElement("div");
    mobileSheet.className = "mp-mobile-sheet";

    var handle = document.createElement("div");
    handle.className = "mp-mobile-sheet__handle";
    mobileSheet.appendChild(handle);

    var content = document.createElement("div");
    content.className = "mp-mobile-sheet__content";
    mobileSheet.appendChild(content);

    document.body.appendChild(mobileBackdrop);
    document.body.appendChild(mobileSheet);

    // 스와이프 다운으로 닫기
    var startY = 0;
    var currentY = 0;

    mobileSheet.addEventListener(
      "touchstart",
      function (e) {
        startY = e.touches[0].clientY;
        currentY = startY;
        mobileSheet.style.transition = "none";
      },
      { passive: true },
    );

    mobileSheet.addEventListener(
      "touchmove",
      function (e) {
        currentY = e.touches[0].clientY;
        var diff = currentY - startY;
        if (diff > 0) {
          mobileSheet.style.transform = "translateY(" + diff + "px)";
        }
      },
      { passive: true },
    );

    mobileSheet.addEventListener("touchend", function () {
      mobileSheet.style.transition = "";
      var diff = currentY - startY;
      if (diff > 80) {
        closeMobileSheet();
      } else {
        mobileSheet.style.transform = "";
      }
    });
  }

  function showMobileSheet(cellData) {
    createMobileSheet();

    var content = mobileSheet.querySelector(".mp-mobile-sheet__content");
    if (!content) return;

    var html =
      '<div class="mp-mobile-sheet__header">' +
      escapeHtml(cellData.key) +
      "</div>";

    if (cellData.isHoliday) {
      html +=
        '<div class="mp-mobile-sheet__holiday">\uD83C\uDDF0\uD83C\uDDF7 KR 휴장 (국내 증시 휴장)</div>';
    }

    if (cellData.tooltipData && cellData.tooltipData.events.length > 0) {
      html += '<div class="mp-mobile-sheet__events">';
      cellData.tooltipData.events.forEach(function (ev) {
        var surpriseHtml = buildSurpriseHtml(ev);
        html +=
          '<div class="mp-mobile-sheet__event is-' +
          ev.importance +
          '">' +
          '<div class="mp-mobile-sheet__event-top">' +
          '<span class="mp-mobile-sheet__time">' +
          escapeHtml(ev.time) +
          "</span>" +
          '<span class="mp-mobile-sheet__country">[' +
          escapeHtml(ev.country) +
          "]</span>" +
          '<span class="mp-importance is-mini is-' +
          ev.importance +
          '">' +
          escapeHtml(ev.importance.toUpperCase()) +
          "</span>" +
          "</div>" +
          '<div class="mp-mobile-sheet__event-name">' +
          escapeHtml(ev.nameKo || ev.name) +
          "</div>" +
          surpriseHtml +
          "</div>";
      });
      html += "</div>";
    } else {
      html += '<div class="mp-mobile-sheet__empty">이벤트가 없습니다.</div>';
    }

    content.innerHTML = html;

    mobileBackdrop.classList.add("is-active");
    mobileSheet.classList.add("is-active");
    mobileSheet.style.transform = "";
    document.body.style.overflow = "hidden";
  }

  function closeMobileSheet() {
    if (mobileBackdrop) mobileBackdrop.classList.remove("is-active");
    if (mobileSheet) mobileSheet.classList.remove("is-active");
    document.body.style.overflow = "";
  }

  function addMobileTouchSupport() {
    // 기존 셀들에 클릭 이벤트 추가
    var cells = document.querySelectorAll(".mp-calendar__cell");
    cells.forEach(function (cell, idx) {
      cell.addEventListener("click", function () {
        if (window.innerWidth > MOBILE_BP) return;
        // 셀 데이터는 툴팁에서 가져올 수 없으므로, 툴팁 HTML을 파싱하는 대신
        // 날짜를 기반으로 이벤트 목록을 재구성
        var dayEl = cell.querySelector(".mp-calendar__day");
        if (!dayEl) return;
        triggerMobileSheetFromCell(cell);
      });
    });
  }

  function triggerMobileSheetFromCell(cell) {
    // 날짜 정보를 셀의 tooltip data에서 추출하기 어려우므로,
    // mouseenter 이벤트를 시뮬레이션하여 tooltip HTML을 가져옴
    // 대신, 셀 인덱스와 캘린더 모델에서 직접 접근
    // → 이미 rebuildGrid에서 click 핸들러에 cellData를 직접 바인딩했으므로
    // 초기 렌더의 셀들만 여기서 처리하면 됨

    // 초기 렌더 시에는 renderer.js가 처리했으므로 tooltip 정보가 DOM에 없음
    // 대안: 셀에 마우스 이벤트를 발생시켜 tooltip을 채운 뒤 그 내용을 가져오기
    var tooltip = document.getElementById("mp-shared-tooltip");
    if (!tooltip) return;

    // 임시로 마우스엔터 이벤트 발생
    var rect = cell.getBoundingClientRect();
    var fakeEvent = new MouseEvent("mouseenter", {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
    });
    cell.dispatchEvent(fakeEvent);

    // tooltip 내용이 채워졌으면 bottom sheet로 변환
    setTimeout(function () {
      if (
        !tooltip.classList.contains("is-active") &&
        !cell.classList.contains("is-holiday")
      ) {
        return;
      }

      var headerEl = tooltip.querySelector(".mp-calendar__tooltip-header");
      var dateStr = headerEl ? headerEl.textContent : "";
      var isHoliday = cell.classList.contains("is-holiday");
      var events = [];

      var items = tooltip.querySelectorAll(".mp-calendar__tooltip-item");
      items.forEach(function (item) {
        var timeEl = item.querySelector(".mp-calendar__tooltip-time");
        var countryEl = item.querySelector(".mp-calendar__tooltip-country");
        var nameEl = item.querySelector(".mp-calendar__tooltip-name");
        var impClass = "";
        if (item.classList.contains("is-high")) impClass = "high";
        else if (item.classList.contains("is-medium")) impClass = "medium";
        else if (item.classList.contains("is-low")) impClass = "low";

        events.push({
          time: timeEl ? timeEl.textContent : "",
          country: countryEl
            ? countryEl.textContent.replace(/[\[\]]/g, "")
            : "",
          name: nameEl ? nameEl.textContent : "",
          nameKo: nameEl ? nameEl.textContent : "",
          importance: impClass,
          status: "",
        });
      });

      tooltip.classList.remove("is-active");

      var cellData = {
        key: dateStr,
        isHoliday: isHoliday,
        tooltipData: { events: events },
      };

      showMobileSheet(cellData);
    }, 50);
  }

  // ══════════════════════════════════════════════
  // Step 6: 충격도(서프라이즈) 시각화
  // ══════════════════════════════════════════════

  function buildSurpriseHtml(ev) {
    // ev는 tooltip 이벤트가 아닌, 원본 keyEvent 데이터가 있을 때만 작동
    // mobile sheet에서는 tooltip 기반이라 previous/consensus 정보 없음
    // → upcoming 이벤트 카드에서만 활용
    return "";
  }

  function addSurpriseIndicators() {
    // WHY: 캘린더 렌더 후 upcoming 이벤트 카드에 이전→예상 변화 표시 추가
    var chartData = window.__MP_CHART_DATA;
    if (!chartData || !Array.isArray(chartData.keyEvents)) return;

    var eventMap = {};
    chartData.keyEvents.forEach(function (ev) {
      var name = ev.eventName || "";
      eventMap[name] = ev;
    });

    // upcoming 카드의 meta 영역에 서프라이즈 배지 추가
    var metaElements = document.querySelectorAll(".mp-upcoming__meta");
    metaElements.forEach(function (meta) {
      var card = meta.closest(".mp-upcoming__item");
      if (!card) return;

      var eventNameEl = card.querySelector(".mp-upcoming__event");
      if (!eventNameEl) return;

      var eventText = eventNameEl.textContent || "";
      // [USD] ISM Services PMI 형태에서 이벤트명 추출
      var nameMatch = eventText.match(/\[.+?\]\s*(.+)/);
      var cleanName = nameMatch ? nameMatch[1].trim() : eventText.trim();

      // eventMap에서 매칭
      var ev = null;
      Object.keys(eventMap).forEach(function (key) {
        if (
          key.indexOf(cleanName) >= 0 ||
          cleanName.indexOf(key.replace(/^\[.+?\]\s*/, "")) >= 0
        ) {
          ev = eventMap[key];
        }
      });

      if (!ev) return;

      var prev = parseFloat(ev.previousValue);
      var cons = parseFloat(ev.consensus);
      var actual = parseFloat(ev.actualValue);

      // actual이 있으면 서프라이즈 표시
      if (!isNaN(actual) && !isNaN(cons) && cons !== 0) {
        var surprise = ((actual - cons) / Math.abs(cons)) * 100;
        if (Math.abs(surprise) >= 5) {
          var badge = document.createElement("span");
          badge.className = "mp-surprise-badge";
          if (surprise > 0) {
            badge.classList.add("is-above");
            badge.textContent = "\u25B2 " + surprise.toFixed(1) + "%";
          } else {
            badge.classList.add("is-below");
            badge.textContent = "\u25BC " + Math.abs(surprise).toFixed(1) + "%";
          }
          badge.title = "실제 vs 예상 서프라이즈";
          meta.appendChild(badge);
        }
      }
      // actual이 없고 prev, cons 모두 있으면 "기대 변화" 표시
      else if (!isNaN(prev) && !isNaN(cons) && prev !== cons) {
        var change = cons - prev;
        var pctChange = (change / Math.abs(prev)) * 100;
        if (Math.abs(pctChange) >= 2) {
          var expectBadge = document.createElement("span");
          expectBadge.className = "mp-expect-badge";
          var arrow = change > 0 ? "\u2191" : "\u2193";
          expectBadge.textContent = arrow + " " + prev + " \u2192 " + cons;
          expectBadge.title = "이전값 → 예상값 변화";
          meta.appendChild(expectBadge);
        }
      }
    });
  }
})();
