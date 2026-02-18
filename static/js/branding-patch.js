(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var config = window.MP_CONFIG || {};
    var branding = config.branding || {};

    var headerTitleText = branding.header_title || 'MARKET PULSE';
    var headerFontFamily = branding.header_font_family || "'Noto Sans KR', sans-serif";
    var headerTextTransform = branding.header_text_transform || 'uppercase';
    var headerFontWeight = branding.header_font_weight || '700';
    var headerLetterSpacing = branding.header_letter_spacing || '0.05em';
    var colorDark = branding.header_color_dark || '#A78BFA';
    var colorLight = branding.header_color_light || '#7C3AED';
    var shadowDark = branding.header_shadow_dark || '0 0 15px rgba(124, 58, 237, 0.4)';
    var shadowLight = branding.header_shadow_light || 'none';

    // Fix Header Branding
    var headerTitle = document.querySelector('.main-menu > a.text-base');
    if (headerTitle) {
      headerTitle.textContent = headerTitleText;
      headerTitle.style.fontFamily = headerFontFamily;
      headerTitle.style.textTransform = headerTextTransform;
      headerTitle.style.fontWeight = headerFontWeight;
      headerTitle.style.letterSpacing = headerLetterSpacing;

      // Initial color set
      var isDark = document.documentElement.classList.contains('dark');
      headerTitle.style.color = isDark ? colorDark : colorLight;
      headerTitle.style.textShadow = isDark ? shadowDark : shadowLight;

      // Watch for theme changes
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.attributeName === 'class') {
            var isDarkNow = document.documentElement.classList.contains('dark');
            headerTitle.style.color = isDarkNow ? colorDark : colorLight;
            headerTitle.style.textShadow = isDarkNow ? shadowDark : shadowLight;
          }
        });
      });
      observer.observe(document.documentElement, { attributes: true });
    }
  });
})();
