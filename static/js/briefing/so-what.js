(function () {
  "use strict";

  var ns = (window.MPBriefing = window.MPBriefing || {});

  // Regime keyword → config key mapping
  var REGIME_KEYWORD_MAP = {
    cautious: "CAUTIOUS",
    "risk on": "RISK_ON",
    "risk-on": "RISK_ON",
    "risk off": "RISK_OFF",
    "risk-off": "RISK_OFF",
    panic: "PANIC",
    neutral: "CAUTIOUS",
  };

  var FALLBACK_COLOR = "#7C3AED"; // brand purple

  function resolveRegimeColor(text) {
    var lower = (text || "").toLowerCase();
    var keys = Object.keys(REGIME_KEYWORD_MAP);
    for (var i = 0; i < keys.length; i++) {
      if (lower.indexOf(keys[i]) !== -1) {
        var configKey = REGIME_KEYWORD_MAP[keys[i]];
        var colors =
          (window.MP_CONFIG &&
            window.MP_CONFIG.colors &&
            window.MP_CONFIG.colors.regime) ||
          {};
        return { key: configKey, color: colors[configKey] || FALLBACK_COLOR };
      }
    }
    return { key: "NEUTRAL", color: FALLBACK_COLOR };
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "124, 58, 237";
    return (
      parseInt(result[1], 16) +
      ", " +
      parseInt(result[2], 16) +
      ", " +
      parseInt(result[3], 16)
    );
  }

  /**
   * Transform a .mp-opinion-sub element that contains a SO WHAT section.
   * @param {Element} opinionSubEl - The .mp-opinion-sub wrapper
   */
  ns.transformSoWhatSection = function (opinionSubEl) {
    if (!opinionSubEl) return;

    // 1. Detect by h3 title
    var h3 = opinionSubEl.querySelector("h3");
    if (!h3) return;
    var title = (h3.textContent || "").trim();
    if (title.indexOf("전략 시나리오") === -1) return;

    // Mark as SO WHAT section
    opinionSubEl.classList.add("mp-so-what");

    // 2. Find and transform Market Regime line
    var paragraphs = opinionSubEl.querySelectorAll("p");
    for (var i = 0; i < paragraphs.length; i++) {
      var p = paragraphs[i];
      var strongs = p.querySelectorAll("strong");
      for (var j = 0; j < strongs.length; j++) {
        var strongText = strongs[j].textContent || "";
        if (strongText.indexOf("Market Regime") !== -1) {
          var regime = resolveRegimeColor(strongText);
          var rgb = hexToRgb(regime.color);

          // Create badge element
          var badge = document.createElement("div");
          badge.className = "mp-so-what-regime";
          badge.style.setProperty("--so-what-regime-color", regime.color);
          badge.style.setProperty("--so-what-regime-rgb", rgb);
          badge.setAttribute("data-regime", regime.key);

          // Move the paragraph content into the badge
          badge.innerHTML = p.innerHTML;
          p.parentNode.replaceChild(badge, p);
          break;
        }
      }
    }

    // 3-4. Find confirmation/invalidation lists and add icons
    var allStrongs = opinionSubEl.querySelectorAll("strong");
    for (var k = 0; k < allStrongs.length; k++) {
      var st = allStrongs[k];
      var stText = st.textContent || "";

      var isConfirm =
        stText.indexOf("확인 조건") !== -1 ||
        stText.indexOf("Confirmation Triggers") !== -1;
      var isInvalid =
        stText.indexOf("무효화 기준") !== -1 ||
        stText.indexOf("Invalidation Rules") !== -1;

      if (!isConfirm && !isInvalid) continue;

      // Find the next <ul> after this strong's parent element
      var parentEl = st.closest("p") || st.parentNode;
      var sibling = parentEl.nextElementSibling;
      while (sibling) {
        if (sibling.tagName === "UL") break;
        if (sibling.tagName === "H3" || sibling.tagName === "H2") {
          sibling = null;
          break;
        }
        sibling = sibling.nextElementSibling;
      }

      if (!sibling) continue;

      if (isConfirm) {
        sibling.classList.add("mp-so-what-confirm");
        var confirmItems = sibling.querySelectorAll("li");
        for (var ci = 0; ci < confirmItems.length; ci++) {
          if (!confirmItems[ci].querySelector(".mp-so-what-icon")) {
            var checkIcon = document.createElement("span");
            checkIcon.className = "mp-so-what-icon";
            checkIcon.setAttribute("aria-hidden", "true");
            checkIcon.textContent = "\u2705";
            confirmItems[ci].insertBefore(
              checkIcon,
              confirmItems[ci].firstChild,
            );
          }
        }
      }

      if (isInvalid) {
        sibling.classList.add("mp-so-what-invalid");
        var invalidItems = sibling.querySelectorAll("li");
        for (var ii = 0; ii < invalidItems.length; ii++) {
          if (!invalidItems[ii].querySelector(".mp-so-what-icon")) {
            var crossIcon = document.createElement("span");
            crossIcon.className = "mp-so-what-icon";
            crossIcon.setAttribute("aria-hidden", "true");
            crossIcon.textContent = "\u274C";
            invalidItems[ii].insertBefore(
              crossIcon,
              invalidItems[ii].firstChild,
            );
          }
        }
      }
    }
  };
})();
