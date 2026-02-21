(function () {
  "use strict";

  var ns = (window.MPBriefing = window.MPBriefing || {});

  function getZoneInfo(nameText, priceText, changeText) {
    var val = parseFloat((priceText || "").replace(/[^0-9.]/g, ""));

    // --- 고유 임계값이 있는 종목 ---
    // VIX
    if (
      /VIX|공포지수/.test(nameText) &&
      !/공포탐욕/.test(nameText) &&
      !isNaN(val)
    ) {
      if (val < 20) return { tone: "ok", label: "안전" };
      if (val <= 25) return { tone: "warn", label: "주의" };
      return { tone: "danger", label: "위험" };
    }
    // 원/달러
    if (/원\/달러|USDKRW/.test(nameText) && !isNaN(val)) {
      if (val < 1350) return { tone: "ok", label: "안전" };
      if (val < 1400) return { tone: "info", label: "보통" };
      if (val < 1450) return { tone: "warn", label: "주의" };
      return { tone: "danger", label: "위험" };
    }
    // DXY
    if (/DXY|달러인덱스/.test(nameText) && !isNaN(val)) {
      if (val < 100) return { tone: "ok", label: "약달러" };
      if (val <= 105) return { tone: "neutral", label: "보통" };
      return { tone: "warn", label: "강달러" };
    }
    // 공포탐욕지수
    if (/공포탐욕/.test(nameText) && !isNaN(val)) {
      if (val <= 25) return { tone: "danger", label: "극단적 공포" };
      if (val <= 46) return { tone: "warn", label: "공포" };
      if (val <= 54) return { tone: "neutral", label: "중립" };
      if (val <= 74) return { tone: "ok", label: "탐욕" };
      return { tone: "accent", label: "극단적 탐욕" };
    }
    // 미국 10년물
    if (/10년물/.test(nameText) && !isNaN(val)) {
      if (val < 4.0) return { tone: "ok", label: "안전" };
      if (val <= 4.5) return { tone: "warn", label: "주의" };
      return { tone: "danger", label: "위험" };
    }

    // --- 변동률 기반 (나머지 전체) ---
    var chg = parseFloat((changeText || "").replace(/[^0-9.\-+]/g, ""));
    if (isNaN(chg)) return { tone: "neutral", label: "보합" };
    if (chg >= 2) return { tone: "ok", label: "강세" };
    if (chg >= 0.5) return { tone: "ok", label: "상승" };
    if (chg >= 0.2) return { tone: "ok", label: "강보합" };
    if (chg > -0.2) return { tone: "neutral", label: "보합" };
    if (chg > -0.5) return { tone: "warn", label: "약보합" };
    if (chg > -2) return { tone: "warn", label: "하락" };
    return { tone: "danger", label: "약세" };
  }

  function parseAssessmentStatus(text, context) {
    if (!text) return null;
    var cleaned = String(text)
      .trim()
      .replace(/^\-\s*/, "");
    var m = cleaned.match(/^(✅|⚠️?|❌|🟢|🟡|🔴|⚪)\s*(.*)$/);
    if (!m) return null;

    var token = m[1];
    var label = (m[2] || "").trim();
    var tone = "neutral";

    if (token === "✅" || token === "🟢") tone = "ok";
    else if (token === "⚠" || token === "⚠️" || token === "🟡") tone = "warn";
    else if (token === "❌" || token === "🔴") tone = "danger";

    var finalLabel =
      label || cleaned.replace(/^(✅|⚠️?|❌|🟢|🟡|🔴|⚪)\s*/, "");
    if (tone === "warn") {
      var metricName =
        context && context.metricName ? String(context.metricName) : "";
      var valueText =
        context && context.valueText ? String(context.valueText) : "";
      if (
        /완화 기대/.test(finalLabel) ||
        (/US10Y/.test(metricName) && /^-/.test(valueText))
      ) {
        tone = "info";
      } else if (/횡보/.test(finalLabel)) {
        tone = "neutral";
      } else if (/극단적 공포|contrarian|탐욕|괴리/.test(finalLabel)) {
        tone = "accent";
      }
    }

    return { tone: tone, label: finalLabel };
  }

  function buildStatusBadge(status) {
    var badge = document.createElement("span");
    badge.className = "mp-status-badge is-" + status.tone;

    var dot = document.createElement("span");
    dot.className = "mp-status-dot";
    badge.appendChild(dot);

    var label = document.createElement("span");
    label.className = "mp-status-label";
    label.textContent = status.label || "-";
    badge.appendChild(label);

    return badge;
  }

  function enhanceAssessmentCells(root) {
    if (!root) return;
    var tables = root.querySelectorAll("table");
    tables.forEach(function (table) {
      var headers = table.querySelectorAll("thead th");
      if (!headers || headers.length === 0) return;

      var assessmentIdx = -1;
      for (var i = 0; i < headers.length; i++) {
        var h = (headers[i].textContent || "").trim();
        if (h === "\uD310\uB2E8" || h.indexOf("\uD310\uB2E8") !== -1) {
          assessmentIdx = i;
          break;
        }
      }
      if (assessmentIdx < 0) return;

      var rows = table.querySelectorAll("tbody tr");
      rows.forEach(function (tr) {
        var cells = tr.querySelectorAll("td");
        if (!cells || cells.length <= assessmentIdx) return;

        var cell = cells[assessmentIdx];
        var raw = (cell.textContent || "").trim();
        var metricName = cells[0] ? (cells[0].textContent || "").trim() : "";
        var valueText = cells[1] ? (cells[1].textContent || "").trim() : "";
        var status = parseAssessmentStatus(raw, {
          metricName: metricName,
          valueText: valueText,
        });
        if (!status) return;

        cell.textContent = "";
        cell.classList.add("mp-assessment-cell");
        cell.appendChild(buildStatusBadge(status));
      });
    });
  }

  function convertTablesToTickerCards(section) {
    if (!section) return;

    var groups = [];
    var currentGroup = null;
    var children = Array.prototype.slice.call(section.children);

    children.forEach(function (child) {
      if (child.tagName === "H2") {
        currentGroup = {
          label: "\uBBF8\uAD6D \uC9C0\uC218",
          tables: [],
          elements: [],
        };
        groups.push(currentGroup);
      } else if (child.tagName === "H3") {
        currentGroup = {
          label: (child.textContent || "").trim().replace(/\s*⚠️.*$/, ""),
          tables: [],
          elements: [child],
        };
        groups.push(currentGroup);
      } else if (child.classList && child.classList.contains("table-wrapper")) {
        var wrappedTable = child.querySelector("table");
        if (wrappedTable && currentGroup) {
          currentGroup.tables.push(wrappedTable);
          currentGroup.elements.push(child);
        }
      } else if (child.tagName === "TABLE" && currentGroup) {
        currentGroup.tables.push(child);
        currentGroup.elements.push(child);
      } else if (child.tagName === "BLOCKQUOTE" && currentGroup) {
        currentGroup.elements.push(child);
      }
    });

    if (groups.length === 0) return;

    var container = document.createElement("div");
    container.className = "mp-ticker-groups";

    groups.forEach(function (group) {
      if (group.tables.length === 0) return;

      var card = document.createElement("div");
      card.className = "mp-ticker-group";

      var title = document.createElement("div");
      title.className = "mp-ticker-group__title";
      title.textContent = group.label;
      card.appendChild(title);

      group.tables.forEach(function (table) {
        var rows = table.querySelectorAll("tbody tr");
        rows.forEach(function (tr) {
          var tds = tr.querySelectorAll("td");
          if (tds.length < 3) return;

          var tickerRow = document.createElement("div");
          tickerRow.className = "mp-ticker-row";

          var name = document.createElement("span");
          name.className = "mp-ticker-name";
          name.textContent = (tds[0].textContent || "").trim();

          var price = document.createElement("span");
          price.className = "mp-ticker-price";
          price.textContent = (tds[1].textContent || "").trim();

          var change = document.createElement("span");
          change.className = "mp-ticker-change";
          var changeText =
            tds.length >= 4
              ? (tds[3].textContent || "").trim()
              : (tds[2].textContent || "").trim();
          var status = parseAssessmentStatus(changeText, {
            metricName: (name.textContent || "").trim(),
            valueText: (price.textContent || "").trim(),
          });

          if (status) {
            change.classList.add("is-status");
            change.appendChild(buildStatusBadge(status));
          } else {
            change.textContent = changeText;
            if (/^\+/.test(changeText) || /\u2191/.test(changeText)) {
              change.classList.add("num-up");
            } else if (/^-/.test(changeText) && changeText !== "-") {
              change.classList.add("num-down");
            }
          }

          var nameText = (name.textContent || "").trim();

          // 공포탐욕지수: price에서 숫자만 추출 ("8 (극단적 공포)" → "8")
          if (/공포탐욕/.test(nameText)) {
            var fgNum = (price.textContent || "").replace(/[^0-9]/g, "");
            price.textContent = fgNum || price.textContent;
          }

          tickerRow.appendChild(name);
          tickerRow.appendChild(price);
          tickerRow.appendChild(change);

          // 4th column: zone badge (임계값 기준 뱃지)
          var zoneSpan = document.createElement("span");
          zoneSpan.className = "mp-ticker-zone";
          var zoneInfo = getZoneInfo(nameText, price.textContent, changeText);
          if (zoneInfo) {
            var zoneBadge = buildStatusBadge(zoneInfo);
            zoneBadge.classList.add("mp-zone-badge");
            zoneSpan.appendChild(zoneBadge);
          } else {
            zoneSpan.classList.add("is-empty");
          }
          tickerRow.appendChild(zoneSpan);

          card.appendChild(tickerRow);
        });
      });

      container.appendChild(card);
    });

    groups.forEach(function (group) {
      group.elements.forEach(function (el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
    });

    var h2 = section.querySelector("h2");
    if (h2 && h2.nextSibling) {
      h2.parentNode.insertBefore(container, h2.nextSibling);
    } else if (h2) {
      section.appendChild(container);
    } else {
      section.insertBefore(container, section.firstChild);
    }
  }

  ns.parseAssessmentStatus = parseAssessmentStatus;
  ns.buildStatusBadge = buildStatusBadge;
  ns.enhanceAssessmentCells = enhanceAssessmentCells;
  ns.convertTablesToTickerCards = convertTablesToTickerCards;
})();
