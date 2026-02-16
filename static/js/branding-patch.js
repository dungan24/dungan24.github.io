document.addEventListener('DOMContentLoaded', () => {
  // Fix Header Branding
  const headerTitle = document.querySelector('.main-menu > a.text-base');
  if (headerTitle) {
    headerTitle.textContent = 'MARKET PULSE';
    headerTitle.style.fontFamily = "'Noto Sans KR', sans-serif";
    headerTitle.style.textTransform = "uppercase";
    headerTitle.style.fontWeight = "700";
    headerTitle.style.letterSpacing = "0.05em";
    
    // Initial color set
    const isDark = document.documentElement.classList.contains('dark');
    headerTitle.style.color = isDark ? "#A78BFA" : "#7C3AED";
    headerTitle.style.textShadow = isDark ? "0 0 15px rgba(124, 58, 237, 0.4)" : "none";

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          headerTitle.style.color = isDarkNow ? "#A78BFA" : "#7C3AED";
          headerTitle.style.textShadow = isDarkNow ? "0 0 15px rgba(124, 58, 237, 0.4)" : "none";
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
  }
});
