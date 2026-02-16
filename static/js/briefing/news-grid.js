(function() {
  'use strict';

  var ns = window.MPBriefing = window.MPBriefing || {};

  ns.transformNewsSection = function(newsSection) {
    if (!newsSection) return;

    var config = window.MP_CONFIG || {};
    var labels = config.labels || {};
    var originalSourcePrefix = labels.original_source || '원문:';

    var subHeaders = newsSection.querySelectorAll('h3');
    var newsContainer = document.createElement('div');

    subHeaders.forEach(function(h3) {
      var categoryLabel = (h3.textContent || '').trim();
      var ol = h3.nextElementSibling;
      if (!ol || ol.tagName !== 'OL') return;

      var label = document.createElement('div');
      label.className = 'mp-news-section-label';
      label.textContent = categoryLabel;
      newsContainer.appendChild(label);

      var grid = document.createElement('div');
      grid.className = 'mp-news-grid';

      var items = ol.querySelectorAll('li');
      items.forEach(function(li) {
        var card = document.createElement('div');
        card.className = 'mp-news-card';

        var link = li.querySelector('a');
        var strong = li.querySelector('strong');
        var headline = strong ? strong.textContent : (link ? link.textContent : '');
        var href = link ? link.getAttribute('href') : '#';

        var blockquote = li.querySelector('blockquote');
        var liClone = li.cloneNode(true);
        var bqClone = liClone.querySelector('blockquote');
        if (bqClone) bqClone.remove();

        var textContent = liClone.textContent || '';
        var originalHeadline = '';
        var originalIdx = textContent.indexOf(originalSourcePrefix);
        if (originalIdx !== -1) {
          var afterOriginal = textContent.substring(originalIdx + originalSourcePrefix.length).trim();
          var nextMeta = afterOriginal.search(/[\s\S]*?\u00B7/);
          if (nextMeta === -1) {
            originalHeadline = afterOriginal;
          } else {
            var lines = afterOriginal.split(/\n/);
            originalHeadline = (lines[0] || '').trim();
          }
          textContent = textContent.substring(0, originalIdx);
        }

        var headlineEnd = textContent.indexOf(headline) + headline.length;
        var metaText = textContent.substring(headlineEnd).trim();

        var metaParts = metaText.split('\u00B7').map(function(s) { return s.trim(); });
        var source = metaParts[0] || '';
        var time = metaParts[1] || '';
        var category = metaParts[2] || '';
        var excerpt = blockquote ? (blockquote.textContent || '').trim() : '';

        card.innerHTML =
          (source ? '<div class="mp-news-card__source">' + source + '</div>' : '') +
          '<div class="mp-news-card__headline"><a href="' + href + '" target="_blank" rel="noopener">' + headline + '</a></div>' +
          (originalHeadline ? '<div class="mp-news-card__original"><span class="mp-news-card__en-tag">' + (labels.en_tag || 'EN') + '</span>' + originalHeadline + '</div>' : '') +
          '<div class="mp-news-card__meta">' + [time, category].filter(Boolean).join(' \u00B7 ') + '</div>' +
          (excerpt ? '<div class="mp-news-card__excerpt"><span class="mp-news-card__kr-tag">' + (labels.kr_tag || 'KR') + '</span>' + excerpt + '</div>' : '');

        grid.appendChild(card);
      });

      newsContainer.appendChild(grid);
    });

    if (newsContainer.children.length === 0) return;

    var newsH2 = newsSection.querySelector('h2');
    if (!newsH2) return;
    while (newsH2.nextSibling) {
      newsSection.removeChild(newsH2.nextSibling);
    }
    newsSection.appendChild(newsContainer);
  };
})();
