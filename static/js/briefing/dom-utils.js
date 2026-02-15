(function() {
  'use strict';

  var ns = window.MPBriefing = window.MPBriefing || {};
  var OPINION_TITLES = [
    '\uD575\uC2EC \uC694\uC57D',
    '\uC624\uB298\uC758 \uD574\uC11D'
  ];

  ns.getZoneByTitle = function(titleText) {
    var normalized = String(titleText || '');
    for (var i = 0; i < OPINION_TITLES.length; i++) {
      if (normalized.indexOf(OPINION_TITLES[i]) !== -1) return 'opinion';
    }
    return 'fact';
  };

  ns.findSectionByTitle = function(content, titleText) {
    if (!content) return null;
    var sections = content.querySelectorAll('.briefing-section');
    for (var i = 0; i < sections.length; i++) {
      var h2 = sections[i].querySelector('h2');
      if (h2 && h2.textContent.indexOf(titleText) !== -1) {
        return sections[i];
      }
    }
    return null;
  };

  ns.colorizeTableCells = function(content) {
    if (!content) return;
    var cells = content.querySelectorAll('td');
    cells.forEach(function(td) {
      var text = (td.textContent || '').trim();
      if (/^\+\d/.test(text) || /\u2191/.test(text)) {
        td.classList.add('num-up');
      } else if (/^-\d/.test(text) || (/\u2193/.test(text) && !/^-$/.test(text))) {
        td.classList.add('num-down');
      }
      if (/\u26A1/.test(text)) td.classList.add('stat-highlight');
      if (/^[+\-]?[\d,]+\.?\d*%?(\s|$)/.test(text) || /^\d[\d,.]*%?$/.test(text)) {
        td.classList.add('num-cell');
      }
    });
  };

  ns.wrapTables = function(content) {
    if (!content) return;
    var tables = content.querySelectorAll('table');
    tables.forEach(function(table) {
      if (!table.parentElement || table.parentElement.classList.contains('table-wrapper')) return;
      var wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  };
})();
