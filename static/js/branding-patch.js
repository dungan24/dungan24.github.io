document.addEventListener('DOMContentLoaded', () => {
  const config = window.MP_CONFIG || {};
  const branding = config.branding || {};

  const headerTitleText = branding.header_title || 'MARKET PULSE';
  const headerFontFamily = branding.header_font_family || "'Noto Sans KR', sans-serif";
  const headerTextTransform = branding.header_text_transform || 'uppercase';
  const headerFontWeight = branding.header_font_weight || '700';
  const headerLetterSpacing = branding.header_letter_spacing || '0.05em';
  const colorDark = branding.header_color_dark || '#A78BFA';
  const colorLight = branding.header_color_light || '#7C3AED';
  const shadowDark = branding.header_shadow_dark || '0 0 15px rgba(124, 58, 237, 0.4)';
  const shadowLight = branding.header_shadow_light || 'none';

  // Fix Header Branding
  const headerTitle = document.querySelector('.main-menu > a.text-base');
  if (headerTitle) {
    headerTitle.textContent = headerTitleText;
    headerTitle.style.fontFamily = headerFontFamily;
    headerTitle.style.textTransform = headerTextTransform;
    headerTitle.style.fontWeight = headerFontWeight;
    headerTitle.style.letterSpacing = headerLetterSpacing;
    
    // Initial color set
    const isDark = document.documentElement.classList.contains('dark');
    headerTitle.style.color = isDark ? colorDark : colorLight;
    headerTitle.style.textShadow = isDark ? shadowDark : shadowLight;

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          headerTitle.style.color = isDarkNow ? colorDark : colorLight;
          headerTitle.style.textShadow = isDarkNow ? shadowDark : shadowLight;
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
  }
});
