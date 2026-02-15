(function() {
  'use strict';

  var ns = window.MPBriefing = window.MPBriefing || {};

  ns.wrapBriefingSections = function(content, getZoneByTitle) {
    if (!content) return;
    var resolver = typeof getZoneByTitle === 'function' ? getZoneByTitle : function() { return 'fact'; };

    var h2s = content.querySelectorAll('h2');
    h2s.forEach(function(h2) {
      if (h2.closest('.briefing-section') || h2.classList.contains('hero-subtitle')) return;

      var zone = resolver((h2.textContent || '').trim());
      var section = document.createElement('section');
      section.className = 'briefing-section';
      if (zone === 'opinion') section.classList.add('briefing-section--opinion');
      else section.classList.add('briefing-section--fact');

      h2.parentNode.insertBefore(section, h2);
      section.appendChild(h2);

      var next = section.nextSibling;
      while (next) {
        var current = next;
        next = next.nextSibling;
        if (current.nodeType === 1) {
          var tag = current.tagName;
          if (tag === 'H2' || tag === 'HR' || tag === 'SECTION') break;
        }
        section.appendChild(current);
      }
    });
  };

  ns.wrapOpinionSubsections = function(content) {
    if (!content) return;
    var opinionSections = content.querySelectorAll('.briefing-section--opinion');
    opinionSections.forEach(function(sec) {
      var h3s = Array.prototype.slice.call(sec.querySelectorAll('h3'));
      if (h3s.length === 0) return;

      h3s.forEach(function(h3) {
        var wrapper = document.createElement('div');
        wrapper.className = 'mp-opinion-sub';
        h3.parentNode.insertBefore(wrapper, h3);
        wrapper.appendChild(h3);

        var next = wrapper.nextSibling;
        while (next) {
          var current = next;
          next = next.nextSibling;
          if (current.nodeType === 1) {
            var tag = current.tagName;
            if (tag === 'H2' || tag === 'H3' || tag === 'SECTION') break;
          }
          wrapper.appendChild(current);
        }
      });
    });
  };
})();
