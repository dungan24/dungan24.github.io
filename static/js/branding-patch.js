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

    function toRgbTriplet(hex, fallback) {
      if (typeof hex !== 'string') return fallback;
      var normalized = hex.trim().replace('#', '');
      if (normalized.length === 3) {
        normalized = normalized.split('').map(function (ch) { return ch + ch; }).join('');
      }
      if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return fallback;
      var r = parseInt(normalized.slice(0, 2), 16);
      var g = parseInt(normalized.slice(2, 4), 16);
      var b = parseInt(normalized.slice(4, 6), 16);
      return r + ' ' + g + ' ' + b;
    }

    var lightRgb = toRgbTriplet(colorLight, '124 58 237');
    var darkRgb = toRgbTriplet(colorDark, '167 139 250');

    function applyBrandVars(isDarkMode) {
      var rootStyle = document.documentElement.style;
      rootStyle.setProperty('--mp-brand-color-light', colorLight);
      rootStyle.setProperty('--mp-brand-color-dark', colorDark);
      rootStyle.setProperty('--mp-brand-color', isDarkMode ? colorDark : colorLight);
      rootStyle.setProperty('--mp-brand-color-rgb', isDarkMode ? darkRgb : lightRgb);
    }

    var isDark = document.documentElement.classList.contains('dark');
    applyBrandVars(isDark);

    // Fix Header Branding
    var headerTitle = document.querySelector('.main-menu > a.text-base');
    if (headerTitle) {
      headerTitle.textContent = headerTitleText;
      headerTitle.style.fontFamily = headerFontFamily;
      headerTitle.style.textTransform = headerTextTransform;
      headerTitle.style.fontWeight = headerFontWeight;
      headerTitle.style.letterSpacing = headerLetterSpacing;

      // Initial color set
      headerTitle.style.color = isDark ? colorDark : colorLight;
      headerTitle.style.textShadow = isDark ? shadowDark : shadowLight;

      // Watch for theme changes
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.attributeName === 'class') {
            var isDarkNow = document.documentElement.classList.contains('dark');
            applyBrandVars(isDarkNow);
            headerTitle.style.color = isDarkNow ? colorDark : colorLight;
            headerTitle.style.textShadow = isDarkNow ? shadowDark : shadowLight;
          }
        });
      });
      observer.observe(document.documentElement, { attributes: true });
    } else {
      var observerFallback = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.attributeName === 'class') {
            applyBrandVars(document.documentElement.classList.contains('dark'));
          }
        });
      });
      observerFallback.observe(document.documentElement, { attributes: true });
    }
  });
})();
