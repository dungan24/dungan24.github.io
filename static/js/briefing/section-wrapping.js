(function() {
  'use strict';

  var ns = window.MPBriefing = window.MPBriefing || {};

  function parseBlockStartComment(text) {
    var raw = String(text || '').trim();
    if (raw.indexOf('MP_BLOCK_START') === -1) return null;

    var match = raw.match(/MP_BLOCK_START\s+(\{[\s\S]*\})/);
    if (!match) return null;

    try {
      var payload = JSON.parse(match[1]);
      if (!payload || typeof payload !== 'object') return null;
      if (!payload.block_id) return null;
      return payload;
    } catch (_) {
      return null;
    }
  }

  function findBlockMetaInSection(section) {
    if (!section) return null;
    var walker = document.createTreeWalker(section, NodeFilter.SHOW_COMMENT, null);
    var node;
    while ((node = walker.nextNode())) {
      var payload = parseBlockStartComment(node.nodeValue || '');
      if (payload) return payload;
    }
    return null;
  }

  function getZoneByBlockId(blockId) {
    var id = String(blockId || '').toLowerCase();
    if (!id) return null;
    if (id.indexOf('summary') !== -1) return 'opinion';
    if (id.indexOf('narrative') !== -1) return 'opinion';
    if (id.indexOf('watchpoints') !== -1) return 'opinion';
    return 'fact';
  }

  function applyBlockMetadata(section, blockMeta) {
    if (!section || !blockMeta) return;
    if (blockMeta.block_id) section.dataset.mpBlockId = String(blockMeta.block_id);
    if (blockMeta.priority !== undefined) section.dataset.mpPriority = String(blockMeta.priority);
    if (blockMeta.as_of_kst) section.dataset.mpAsOfKst = String(blockMeta.as_of_kst);
    if (blockMeta.max_items !== undefined) section.dataset.mpMaxItems = String(blockMeta.max_items);
    if (blockMeta.collapsed !== undefined) section.dataset.mpCollapsed = String(!!blockMeta.collapsed);
  }

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

      var blockMeta = findBlockMetaInSection(section);
      if (blockMeta) {
        applyBlockMetadata(section, blockMeta);
        var zoneFromMeta = getZoneByBlockId(blockMeta.block_id);
        if (zoneFromMeta) {
          section.classList.remove('briefing-section--opinion', 'briefing-section--fact');
          if (zoneFromMeta === 'opinion') section.classList.add('briefing-section--opinion');
          else section.classList.add('briefing-section--fact');
        }
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
