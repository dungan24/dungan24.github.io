(function () {
  'use strict';
  var config = window.MP_CONFIG || {};
  var behavior = config.behavior || {};
  var transitionDurationMs = Number(behavior.theme_transition_duration_ms || 500);

  // Blowfish의 appearance switcher 버튼 감지 (Desktop & Mobile)
  var switchers = document.querySelectorAll('#appearance-switcher, #appearance-switcher-mobile');
  if (!switchers.length) return;

  switchers.forEach(function(switcher) {
    switcher.addEventListener('click', function () {
      document.documentElement.classList.add('theme-transition');
      // transition 끝나면 클래스 제거 (성능)
      setTimeout(function () {
        document.documentElement.classList.remove('theme-transition');
      }, transitionDurationMs);
    });
  });
})();
