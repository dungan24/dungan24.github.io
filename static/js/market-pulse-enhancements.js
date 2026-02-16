document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  var content = document.querySelector('.article-content') || document.querySelector('.prose');
  var ns = window.MPBriefing || {};
  var isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
  var config = window.MP_CONFIG || {};

  var REGIME_COLOR_MAP = config.colors.regime;
  var REGIME_COLOR_RGB_MAP = config.colors.regime_rgb;

  function findSectionByTitle(titleText) {
    if (typeof ns.findSectionByTitle === 'function') {
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

  if (typeof ns.colorizeTableCells === 'function') ns.colorizeTableCells(content);
  if (typeof ns.wrapTables === 'function') ns.wrapTables(content);

  var convertScheduleToCalendar = null;
  if (typeof ns.createCalendarConverter === 'function') {
    convertScheduleToCalendar = ns.createCalendarConverter();
  }

  if (!content) {
    if (convertScheduleToCalendar && typeof ns.transformCalendarShortcodes === 'function') {
      ns.transformCalendarShortcodes(document, convertScheduleToCalendar);
    }
    return;
  }

  if (!isHomePage) {
    if (typeof ns.wrapBriefingSections === 'function') {
      ns.wrapBriefingSections(content, ns.getZoneByTitle);
    }
    if (typeof ns.wrapOpinionSubsections === 'function') {
      ns.wrapOpinionSubsections(content);
    }

    if (typeof ns.injectRegimeHero === 'function') {
      ns.injectRegimeHero(content, findSectionByTitle, REGIME_COLOR_MAP, REGIME_COLOR_RGB_MAP);
    }

    if (typeof ns.enableCollapsibleSections === 'function') ns.enableCollapsibleSections(content);
    if (typeof ns.enableHashAutoOpen === 'function') ns.enableHashAutoOpen();

    var newsSection = findSection(config.sections.news);
    if (newsSection && typeof ns.transformNewsSection === 'function') {
      try {
        ns.transformNewsSection(newsSection);
      } catch (err) {
        console.warn('News card transformation failed, keeping original:', err);
      }
    }

    var calendarSection = findSection(config.sections.calendar);
    if (calendarSection && convertScheduleToCalendar) {
      if (typeof ns.transformCalendarSection === 'function') {
        ns.transformCalendarSection(calendarSection, convertScheduleToCalendar);
      } else {
        try {
          convertScheduleToCalendar(calendarSection);
        } catch (err) {
          console.warn('Calendar transformation failed, keeping original:', err);
        }
      }
    }

    var keyDataSection = findSection(config.sections.key_data);
    if (keyDataSection && typeof ns.convertTablesToTickerCards === 'function') {
      try {
        ns.convertTablesToTickerCards(keyDataSection);
      } catch (err) {
        console.warn('Ticker card transformation failed, keeping tables:', err);
      }
    }

    var sectorSection = findSection(config.sections.sector);
    if (sectorSection && typeof ns.convertTablesToTickerCards === 'function') {
      try {
        var sectorTarget = sectorSection.querySelector('.mp-collapsible') || sectorSection;
        ns.convertTablesToTickerCards(sectorTarget);
      } catch (err) {
        console.warn('Sector table transformation failed:', err);
      }
    }

    if (typeof ns.enhanceAssessmentCells === 'function') {
      try {
        ns.enhanceAssessmentCells(content);
      } catch (err) {
        console.warn('Assessment badge enhancement failed:', err);
      }
    }

    if (typeof ns.initScrollSpy === 'function') ns.initScrollSpy(content);
  }

  // Phase 4: Scroll Reveal Effect
  if ('IntersectionObserver' in window) {
    var observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    var revealObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    var revealTargets = document.querySelectorAll('.briefing-section, .mp-briefing-card, .market-chart-card, .mp-post-hero');
    revealTargets.forEach(function(target) {
      target.classList.add('reveal-on-scroll');
      revealObserver.observe(target);
    });
  }

  if (convertScheduleToCalendar && typeof ns.transformCalendarShortcodes === 'function') {
    ns.transformCalendarShortcodes(document, convertScheduleToCalendar);
  }
});
