/**
 * about.js — Q&A reveal animation (Q then A with delay)
 */
(function () {
  "use strict";

  var reveals = document.querySelectorAll(".ab-reveal");
  if (!reveals.length) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("ab-visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );

  reveals.forEach(function (el) {
    observer.observe(el);
  });
})();
