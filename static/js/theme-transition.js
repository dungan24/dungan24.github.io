(function () {
  'use strict';
  // Blowfish의 appearance switcher 버튼 감지 (Desktop & Mobile)
  const switchers = document.querySelectorAll('#appearance-switcher, #appearance-switcher-mobile');
  if (!switchers.length) return;

  switchers.forEach(function(switcher) {
    switcher.addEventListener('click', function () {
      document.documentElement.classList.add('theme-transition');
      // transition 끝나면 클래스 제거 (성능)
      setTimeout(function () {
        document.documentElement.classList.remove('theme-transition');
      }, 500);
    });
  });
})();
