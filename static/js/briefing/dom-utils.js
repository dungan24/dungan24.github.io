(function () {
  "use strict";

  var ns = (window.MPBriefing = window.MPBriefing || {});
  var OPINION_TITLES = [
    "\uD575\uC2EC \uC694\uC57D",
    "\uC624\uB298\uC758 \uD574\uC11D",
  ];

  ns.getZoneByTitle = function (titleText) {
    var normalized = String(titleText || "");
    for (var i = 0; i < OPINION_TITLES.length; i++) {
      if (normalized.indexOf(OPINION_TITLES[i]) !== -1) return "opinion";
    }
    return "fact";
  };

  ns.findSectionByTitle = function (content, titleText) {
    if (!content) return null;
    var sections = content.querySelectorAll(".briefing-section");
    for (var i = 0; i < sections.length; i++) {
      var h2 = sections[i].querySelector("h2");
      if (h2 && h2.textContent.indexOf(titleText) !== -1) {
        return sections[i];
      }
    }
    return null;
  };

  ns.colorizeTableCells = function (content) {
    if (!content) return;
    var cells = content.querySelectorAll("td");
    cells.forEach(function (td) {
      var text = (td.textContent || "").trim();
      if (/^\+\d/.test(text) || /\u2191/.test(text)) {
        td.classList.add("num-up");
      } else if (
        /^-\d/.test(text) ||
        (/\u2193/.test(text) && !/^-$/.test(text))
      ) {
        td.classList.add("num-down");
      }
      if (/\u26A1/.test(text)) td.classList.add("stat-highlight");
      if (
        /^[+\-]?[\d,]+\.?\d*%?(\s|$)/.test(text) ||
        /^\d[\d,.]*%?$/.test(text)
      ) {
        td.classList.add("num-cell");
      }
    });
  };

  ns.wrapTables = function (content) {
    if (!content) return;
    var tables = content.querySelectorAll("table");
    tables.forEach(function (table) {
      if (
        !table.parentElement ||
        table.parentElement.classList.contains("table-wrapper")
      )
        return;
      var wrapper = document.createElement("div");
      wrapper.className = "table-wrapper";
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  };

  /**
   * 테이블의 tbody 셀이 전부 대시/공백인지 판별합니다.
   * 장중 파이프라인이 아직 데이터를 채우지 않은 경우 true를 반환합니다.
   */
  ns.isAllDashTable = function (table) {
    if (!table) return false;
    var cells = table.querySelectorAll("tbody td");
    if (cells.length === 0) return false;
    var dashPattern = /^[\-\u2013\u2014\s]*$/;
    for (var i = 0; i < cells.length; i++) {
      var text = (cells[i].textContent || "").trim();
      if (text !== "" && !dashPattern.test(text)) return false;
    }
    return true;
  };

  /**
   * all-dash 테이블에 "데이터 준비 중" 오버레이를 적용합니다.
   * innerHTML을 사용하지 않고 DOM API만으로 구성합니다.
   */
  ns.markPendingTables = function (content) {
    if (!content) return;
    var tables = content.querySelectorAll("table");
    tables.forEach(function (table) {
      if (!ns.isAllDashTable(table)) return;

      var wrapper = table.closest(".table-wrapper") || table.parentElement;
      if (!wrapper || wrapper.classList.contains("mp-table-pending")) return;

      wrapper.classList.add("mp-table-pending");
      table.style.display = "none";

      var overlay = document.createElement("div");
      overlay.className = "mp-table-pending__overlay";

      var icon = document.createElement("span");
      icon.className = "mp-table-pending__icon";
      icon.textContent = "\u23F3";

      var msg = document.createElement("span");
      msg.className = "mp-table-pending__msg";
      msg.textContent = "\uB370\uC774\uD130 \uC900\uBE44 \uC911";

      overlay.appendChild(icon);
      overlay.appendChild(msg);
      wrapper.appendChild(overlay);
    });
  };

  /** HTML 특수문자 이스케이프 */
  ns.escapeHtml = function (str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  /** javascript: 프로토콜 차단 */
  ns.sanitizeHref = function (url) {
    var u = String(url || "").trim();
    return /^javascript:/i.test(u) ? "#" : u;
  };
})();
