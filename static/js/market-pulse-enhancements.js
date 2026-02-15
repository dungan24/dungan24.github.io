document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  var content = document.querySelector('.article-content') || document.querySelector('.prose');
  var ns = window.MPBriefing || {};
  var isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';

  var REGIME_COLOR_MAP = {
    'RISK_ON': '#4ade80',
    'CAUTIOUS': '#fbbf24',
    'RISK_OFF': '#f87171',
    'PANIC': '#ef4444'
  };
  var REGIME_COLOR_RGB_MAP = {
    'RISK_ON': '74 222 128',
    'CAUTIOUS': '251 191 36',
    'RISK_OFF': '248 113 113',
    'PANIC': '239 68 68'
  };

  function findSectionByTitle(titleText) {
    if (typeof ns.findSectionByTitle === 'function') {
      return ns.findSectionByTitle(content, titleText);
    }
    return null;
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

    var newsSection = findSectionByTitle('\uC8FC\uC694 \uB274\uC2A4');
    if (newsSection && typeof ns.transformNewsSection === 'function') {
      try {
        ns.transformNewsSection(newsSection);
      } catch (err) {
        console.warn('News card transformation failed, keeping original:', err);
      }
    }

    var calendarSection =
      findSectionByTitle('\uC8FC\uC694 \uC77C\uC815') ||
      findSectionByTitle('\uC624\uB298\uC758 \uC77C\uC815') ||
      findSectionByTitle('\uC774\uBCA4\uD2B8 \uCE98\uB9B0\uB354');
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

    var keyDataSection = findSectionByTitle('\uD575\uC2EC \uC218\uCE58');
    if (keyDataSection && typeof ns.convertTablesToTickerCards === 'function') {
      try {
        ns.convertTablesToTickerCards(keyDataSection);
      } catch (err) {
        console.warn('Ticker card transformation failed, keeping tables:', err);
      }
    }

    var sectorSection = findSectionByTitle('\uC139\uD130 \uC0C1\uB300\uAC15\uB3C4');
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

  if (convertScheduleToCalendar && typeof ns.transformCalendarShortcodes === 'function') {
    ns.transformCalendarShortcodes(document, convertScheduleToCalendar);
  }
});
