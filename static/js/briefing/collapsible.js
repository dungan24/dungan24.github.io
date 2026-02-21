(function () {
  "use strict";

  var ns = (window.MPBriefing = window.MPBriefing || {});

  var DEFAULT_COLLAPSIBLE_TITLES = [
    "\uCD5C\uADFC \uD750\uB984",
    "\uC139\uD130 \uC0C1\uB300\uAC15\uB3C4",
    "\uC774\uBCA4\uD2B8 \uC784\uD329\uD2B8",
    "\uC2DC\uC7A5 \uB3D9\uC870\uD654",
    "\uC2DC\uC7A5 \uAD6D\uBA74",
    "\uC6A9\uC5B4 \uC124\uBA85",
    "\uCD9C\uCC98",
  ];

  ns.enableCollapsibleSections = function (content, titleAllowList) {
    if (!content) return;
    var titles =
      Array.isArray(titleAllowList) && titleAllowList.length > 0
        ? titleAllowList
        : DEFAULT_COLLAPSIBLE_TITLES;

    var allSections = content.querySelectorAll(".briefing-section");
    allSections.forEach(function (sec) {
      var h2 = sec.querySelector("h2");
      if (!h2) return;
      var title = (h2.textContent || "").trim();
      var forceCollapsed = sec.dataset && sec.dataset.mpCollapsed === "true";

      // h2 내 <!-- collapsed --> HTML 코멘트 노드 감지
      if (!forceCollapsed && h2) {
        for (var ci = 0; ci < h2.childNodes.length; ci++) {
          if (
            h2.childNodes[ci].nodeType === 8 &&
            h2.childNodes[ci].nodeValue.trim() === "collapsed"
          ) {
            forceCollapsed = true;
            break;
          }
        }
      }

      var shouldCollapse = titles.some(function (t) {
        return title.indexOf(t) !== -1;
      });
      if (forceCollapsed) shouldCollapse = true;
      if (!shouldCollapse) return;

      var toggleBtn = document.createElement("button");
      toggleBtn.className = "mp-collapse-toggle";
      toggleBtn.type = "button";
      toggleBtn.innerHTML =
        '<span class="mp-collapse-toggle__icon">\u25B8</span>';

      while (h2.firstChild) toggleBtn.appendChild(h2.firstChild);
      h2.appendChild(toggleBtn);

      var collapsible = document.createElement("div");
      collapsible.className = "mp-collapsible";

      var sibling = h2.nextSibling;
      while (sibling) {
        var nextSib = sibling.nextSibling;
        collapsible.appendChild(sibling);
        sibling = nextSib;
      }
      sec.appendChild(collapsible);

      var startOpen = !forceCollapsed;
      collapsible.classList.toggle("is-open", startOpen);
      toggleBtn.classList.toggle("is-open", startOpen);
      if (!startOpen) {
        collapsible.style.maxHeight = "0";
      }

      toggleBtn.addEventListener("click", function () {
        var isOpen = collapsible.classList.toggle("is-open");
        toggleBtn.classList.toggle("is-open", isOpen);
        if (isOpen) {
          collapsible.style.maxHeight = collapsible.scrollHeight + "px";
          setTimeout(function () {
            collapsible.style.maxHeight = "none";
          }, 350);
        } else {
          collapsible.style.maxHeight = collapsible.scrollHeight + "px";
          /* force reflow to enable CSS transition */
          collapsible.offsetHeight;
          collapsible.style.maxHeight = "0";
        }
      });
    });
  };

  ns.enableHashAutoOpen = function () {
    window.addEventListener("hashchange", function () {
      var target = document.getElementById(window.location.hash.slice(1));
      if (!target) return;
      var coll = target.closest(".mp-collapsible");
      if (coll && !coll.classList.contains("is-open")) {
        var btn = coll.parentElement.querySelector(".mp-collapse-toggle");
        if (btn) btn.click();
        setTimeout(function () {
          target.scrollIntoView({ behavior: "smooth" });
        }, 400);
      }
    });
  };
})();
