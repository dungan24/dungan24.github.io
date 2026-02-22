/**
 * investment-strategy.js — 스크롤 스토리텔링 애니메이션 + 진행률
 */
(function () {
  "use strict";

  // 챕터 요소들
  var chapters = document.querySelectorAll(".is-chapter");
  var dots = document.querySelectorAll(".is-progress__dot");
  var reveals = document.querySelectorAll(".is-reveal");

  if (!chapters.length) return;

  // IntersectionObserver: reveal animation
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
  );

  reveals.forEach(function (el) {
    revealObserver.observe(el);
  });

  // IntersectionObserver: chapter progress dots
  if (dots.length) {
    var chapterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var idx = Array.from(chapters).indexOf(entry.target);
            dots.forEach(function (d, i) {
              d.classList.toggle("is-active", i === idx);
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    chapters.forEach(function (ch) {
      chapterObserver.observe(ch);
    });
  }

  // Smooth scroll for progress dots
  dots.forEach(function (dot) {
    dot.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.querySelector(dot.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
