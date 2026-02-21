(function () {
  "use strict";

  var ns = (window.MPBriefing = window.MPBriefing || {});

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

          // 공포탐욕지수 → 게이지 카드로 교체
          var nameText = (name.textContent || "").trim();
          if (/공포탐욕/.test(nameText)) {
            var fgVal = parseInt(
              (price.textContent || "").replace(/[^0-9]/g, ""),
              10,
            );
            var fgCard = document.createElement("div");
            fgCard.className = "mp-fg-callout";

            var fgHeader = document.createElement("div");
            fgHeader.className = "mp-fg-callout__header";

            var fgName = document.createElement("span");
            fgName.className = "mp-fg-callout__name";
            fgName.textContent = nameText;

            var fgVal2 = document.createElement("span");
            fgVal2.className = "mp-fg-callout__value";
            fgVal2.textContent = isNaN(fgVal)
              ? (price.textContent || "").trim()
              : fgVal;
            fgHeader.appendChild(fgName);
            fgHeader.appendChild(fgVal2);
            fgCard.appendChild(fgHeader);

            if (!isNaN(fgVal)) {
              var fillClass;
              if (fgVal <= 25) fillClass = "is-extreme-fear";
              else if (fgVal <= 46) fillClass = "is-fear";
              else if (fgVal <= 54) fillClass = "is-neutral";
              else if (fgVal <= 74) fillClass = "is-greed";
              else fillClass = "is-extreme-greed";

              var gauge = document.createElement("div");
              gauge.className = "mp-fg-gauge";
              var fill = document.createElement("div");
              fill.className = "mp-fg-gauge__fill " + fillClass;
              fill.style.width = Math.min(100, Math.max(0, fgVal)) + "%";
              gauge.appendChild(fill);
              fgCard.appendChild(gauge);
            }

            if (change.textContent || change.firstChild) {
              var fgStatus = document.createElement("div");
              fgStatus.className = "mp-fg-callout__status";
              fgStatus.appendChild(change);
              fgCard.appendChild(fgStatus);
            }

            card.appendChild(fgCard);
            return; // forEach 콜백에서 조기 종료
          }

          tickerRow.appendChild(name);
          tickerRow.appendChild(price);
          tickerRow.appendChild(change);

          var flowSpan = document.createElement("span");
          flowSpan.className = "mp-ticker-flow";
          if (tds.length >= 5) {
            var rawFlow = (tds[4].textContent || "").trim();
            var flow = rawFlow.replace(/^\-\s*/, "");
            if (flow && flow !== "-") {
              flowSpan.textContent = flow;
              if (/\u2191/.test(flow)) flowSpan.classList.add("num-up");
              else if (/\u2193/.test(flow)) flowSpan.classList.add("num-down");
            } else {
              flowSpan.classList.add("is-empty");
            }
          } else {
            flowSpan.classList.add("is-empty");
          }
          tickerRow.appendChild(flowSpan);

          // VIX 임계값 뱃지
          if (/VIX/.test(nameText)) {
            var vixVal = parseFloat(
              (price.textContent || "").replace(/[^0-9.]/g, ""),
            );
            if (!isNaN(vixVal)) {
              var zoneTone =
                vixVal < 20 ? "ok" : vixVal <= 25 ? "warn" : "danger";
              var zoneLabel =
                vixVal < 20
                  ? "< 20 안전"
                  : vixVal <= 25
                    ? "20~25 주의"
                    : "> 25 위험";
              var zoneBadge = buildStatusBadge({
                tone: zoneTone,
                label: zoneLabel,
              });
              zoneBadge.classList.add("mp-vix-zone-badge");
              tickerRow.appendChild(zoneBadge);
            }
          }

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
