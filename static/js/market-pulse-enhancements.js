(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", function () {
    var content =
      document.querySelector(".article-content") ||
      document.querySelector(".prose");
    var ns = window.MPBriefing || {};
    var config = window.MP_CONFIG || {};
    var paths = config.paths || {};
    var rawHomePath = paths.home || "/";
    var homePath =
      rawHomePath.charAt(0) === "/" ? rawHomePath : "/" + rawHomePath;
    var normalizedHomePath = homePath.endsWith("/") ? homePath : homePath + "/";
    var normalizedIndexPath = normalizedHomePath + "index.html";
    var isHomePage =
      window.location.pathname === normalizedHomePath ||
      window.location.pathname === normalizedIndexPath;

    var REGIME_COLOR_MAP = config.colors.regime;
    var REGIME_COLOR_RGB_MAP = config.colors.regime_rgb;

    function findSectionByTitle(titleText) {
      if (typeof ns.findSectionByTitle === "function") {
        return ns.findSectionByTitle(content, titleText);
      }
      return null;
    }

    function findSection(aliases) {
      if (!aliases) return null;
      if (Array.isArray(aliases)) {
        for (var i = 0; i < aliases.length; i++) {
          var s = findSectionByTitle(aliases[i]);
          if (s) return s;
        }
        return null;
      }
      return findSectionByTitle(aliases);
    }

    if (typeof ns.colorizeTableCells === "function")
      ns.colorizeTableCells(content);
    if (typeof ns.wrapTables === "function") ns.wrapTables(content);
    if (typeof ns.markPendingTables === "function")
      ns.markPendingTables(content);

    var convertScheduleToCalendar = null;
    if (typeof ns.createCalendarConverter === "function") {
      convertScheduleToCalendar = ns.createCalendarConverter();
    }

    if (!content) {
      if (
        convertScheduleToCalendar &&
        typeof ns.transformCalendarShortcodes === "function"
      ) {
        ns.transformCalendarShortcodes(document, convertScheduleToCalendar);
      }
      return;
    }

    if (!isHomePage) {
      if (typeof ns.wrapBriefingSections === "function") {
        ns.wrapBriefingSections(content, ns.getZoneByTitle);
      }

      // T-603: Scroll Reveal
      var sections = document.querySelectorAll(".briefing-section");
      if (sections.length > 0) {
        var revealObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-revealed");
                revealObserver.unobserve(entry.target);
              }
            });
          },
          { rootMargin: "0px 0px -100px 0px", threshold: 0.1 },
        );

        sections.forEach(function (section) {
          revealObserver.observe(section);
        });
      }

      if (typeof ns.wrapOpinionSubsections === "function") {
        ns.wrapOpinionSubsections(content);
      }

      if (typeof ns.transformSoWhatSection === "function") {
        var opinionSubs = content.querySelectorAll(".mp-opinion-sub");
        opinionSubs.forEach(function (sub) {
          ns.transformSoWhatSection(sub);
        });
      }

      if (typeof ns.injectRegimeHero === "function") {
        ns.injectRegimeHero(
          content,
          findSectionByTitle,
          REGIME_COLOR_MAP,
          REGIME_COLOR_RGB_MAP,
        );
      }

      if (typeof ns.enableCollapsibleSections === "function")
        ns.enableCollapsibleSections(content);
      if (typeof ns.enableHashAutoOpen === "function") ns.enableHashAutoOpen();

      var newsSection = findSection(config.sections.news);
      if (newsSection && typeof ns.transformNewsSection === "function") {
        try {
          // T-602: Add loading skeleton before content is ready if needed,
          // but since this is static site + JS transform, content is already there.
          // We can just add a 'loading' class that gets removed after transform.
          ns.transformNewsSection(newsSection);
        } catch (err) {
          console.warn(
            "News card transformation failed, keeping original:",
            err,
          );
        }
      }

      var calendarSection = findSection(config.sections.calendar);
      if (calendarSection && convertScheduleToCalendar) {
        if (typeof ns.transformCalendarSection === "function") {
          ns.transformCalendarSection(
            calendarSection,
            convertScheduleToCalendar,
          );
        } else {
          try {
            convertScheduleToCalendar(calendarSection);
          } catch (err) {
            console.warn(
              "Calendar transformation failed, keeping original:",
              err,
            );
          }
        }
      }

      var keyDataSection = findSection(config.sections.key_data);
      if (
        keyDataSection &&
        typeof ns.convertTablesToTickerCards === "function"
      ) {
        try {
          ns.convertTablesToTickerCards(keyDataSection);
        } catch (err) {
          console.warn(
            "Ticker card transformation failed, keeping tables:",
            err,
          );
        }
      }

      var sectorSection = findSection(config.sections.sector);
      if (
        sectorSection &&
        typeof ns.convertTablesToTickerCards === "function"
      ) {
        try {
          var sectorTarget =
            sectorSection.querySelector(".mp-collapsible") || sectorSection;
          ns.convertTablesToTickerCards(sectorTarget);
        } catch (err) {
          console.warn("Sector table transformation failed:", err);
        }
      }

      if (typeof ns.enhanceAssessmentCells === "function") {
        try {
          ns.enhanceAssessmentCells(content);
        } catch (err) {
          console.warn("Assessment badge enhancement failed:", err);
        }
      }

      if (typeof ns.initScrollSpy === "function") ns.initScrollSpy(content);
    }

    if (
      convertScheduleToCalendar &&
      typeof ns.transformCalendarShortcodes === "function"
    ) {
      ns.transformCalendarShortcodes(document, convertScheduleToCalendar);
    }

    document
      .querySelectorAll('[data-scroll-top="true"]')
      .forEach(function (link) {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });

    // T-203: Highlight key metrics in briefing summaries (Home)
    function enhanceSummaries() {
      var summaries = document.querySelectorAll(".mp-briefing-card__summary");
      if (!summaries.length) return;

      var re = /(\d+(\.\d+)?%|\d+bp|[+-]\d+(\.\d+)?)/g;

      summaries.forEach(function (el) {
        // Avoid re-processing
        if (el.getAttribute("data-enhanced")) return;

        var text = el.textContent;
        var parts = [];
        var lastIndex = 0;
        var match;
        var count = 0;

        re.lastIndex = 0;
        while ((match = re.exec(text)) !== null) {
          if (count < 2) {
            parts.push(text.slice(lastIndex, match.index));
            parts.push(
              '<span class="mp-summary-highlight">' + match[0] + "</span>",
            );
            lastIndex = re.lastIndex;
            count++;
          } else {
            break;
          }
        }
        parts.push(text.slice(lastIndex));
        el.innerHTML = parts.join("");
        el.setAttribute("data-enhanced", "true");
      });
    }

    enhanceSummaries();

    // T-701: Regime Filter Logic
    var filterWrap = document.getElementById("mp-regime-filter-wrap");
    var filterContainer = document.getElementById("mp-regime-filter");
    var filterNote = document.getElementById("mp-regime-filter-note");
    var cardsContainer = document.getElementById("mp-briefing-cards-container");

    if (filterContainer && cardsContainer) {
      var chips = filterContainer.querySelectorAll(".mp-filter-chip");
      var cards = cardsContainer.querySelectorAll(".mp-briefing-card");

      var uniqueRegimes = new Set();
      cards.forEach(function (card) {
        var regime = card.getAttribute("data-regime");
        if (regime) uniqueRegimes.add(regime);
      });

      var disableFilters = cards.length < 4 || uniqueRegimes.size <= 1;
      if (disableFilters) {
        if (filterWrap) {
          filterWrap.classList.add("is-disabled");
        }
        if (filterNote) {
          filterNote.hidden = false;
        }
        chips.forEach(function (chip) {
          chip.disabled = true;
          chip.setAttribute("aria-disabled", "true");
        });
        return;
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          // Toggle Active State
          chips.forEach(function (c) {
            c.classList.remove("is-active");
          });
          this.classList.add("is-active");

          var filter = this.getAttribute("data-filter");

          // Handle Filtering with Date Groups
          // We need to hide cards, and if a date group becomes empty, hide the date group too.
          var groups = document.querySelectorAll(".mp-date-group");

          groups.forEach(function (group) {
            var groupCards = group.querySelectorAll(".mp-briefing-card");
            var visibleCount = 0;

            groupCards.forEach(function (card) {
              var regime = card.getAttribute("data-regime");
              if (filter === "ALL" || regime === filter) {
                card.style.display = "";
                visibleCount++;
              } else {
                card.style.display = "none";
              }
            });

            // Hide entire group if no cards visible
            if (visibleCount === 0) {
              group.style.display = "none";
            } else {
              group.style.display = "";
            }
          });
        });
      });
    }
  });
})();
