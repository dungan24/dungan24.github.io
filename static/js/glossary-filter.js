/**
 * glossary-filter.js — 주식사전 매거진 레이아웃 필터링
 * 초성/알파벳, 카테고리, 난이도 필터 + 검색 + 카테고리 섹션 show/hide
 */
(function () {
  "use strict";

  var searchInput = document.getElementById("gl-search");
  var countEl = document.getElementById("gl-count");
  var emptyEl = document.getElementById("gl-empty");
  var featuredEl = document.getElementById("gl-featured");
  var mainEl = document.getElementById("gl-main");
  var summaryEl = document.getElementById("gl-filter-summary");
  var summaryTextEl = document.getElementById("gl-filter-summary-text");
  var resetBtn = document.getElementById("gl-filter-reset");

  // 모든 카드 (피처드 + 일반)
  var fcards = featuredEl ? Array.from(featuredEl.querySelectorAll(".gl-fcard")) : [];
  var cards = mainEl ? Array.from(mainEl.querySelectorAll(".gl-card")) : [];
  var allCards = fcards.concat(cards);

  // 카테고리 섹션들
  var catSections = mainEl ? Array.from(mainEl.querySelectorAll(".gl-cat-section")) : [];

  // 필터 pills
  var pills = Array.from(document.querySelectorAll(".gl-pill"));

  // 총 용어 수 (중복 제거: 피처드에도 있고 카테고리에도 있는 경우)
  var totalCount = cards.length;

  // 활성 필터
  var activeFilters = {
    consonant: null,
    letter: null,
    category: null,
    difficulty: null
  };

  // pill 클릭 핸들러
  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      var type = pill.dataset.filterType;
      var value = pill.dataset.filterValue;

      if (pill.classList.contains("is-active")) {
        pill.classList.remove("is-active");
        activeFilters[type] = null;
      } else {
        // consonant/letter 배타적
        if (type === "consonant" || type === "letter") {
          pills.forEach(function (p) {
            if (p.dataset.filterType === "consonant" || p.dataset.filterType === "letter") {
              p.classList.remove("is-active");
            }
          });
          activeFilters.consonant = null;
          activeFilters.letter = null;
        } else {
          pills.forEach(function (p) {
            if (p.dataset.filterType === type) {
              p.classList.remove("is-active");
            }
          });
        }
        pill.classList.add("is-active");
        activeFilters[type] = value;
      }

      applyFilters();
    });
  });

  // 검색
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  // 초기화 버튼
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      activeFilters.consonant = null;
      activeFilters.letter = null;
      activeFilters.category = null;
      activeFilters.difficulty = null;
      pills.forEach(function (p) { p.classList.remove("is-active"); });
      if (searchInput) searchInput.value = "";
      applyFilters();
    });
  }

  function applyFilters() {
    var query = (searchInput ? searchInput.value : "").toLowerCase().trim();
    var hasFilter = query || activeFilters.consonant || activeFilters.letter || activeFilters.category || activeFilters.difficulty;
    var visibleCount = 0;

    // 모든 카드에 필터 적용
    allCards.forEach(function (card) {
      var show = true;

      if (activeFilters.consonant && card.dataset.consonant !== activeFilters.consonant) show = false;
      if (activeFilters.letter && card.dataset.letter !== activeFilters.letter) show = false;
      if (activeFilters.category && card.dataset.category !== activeFilters.category) show = false;
      if (activeFilters.difficulty && card.dataset.difficulty !== activeFilters.difficulty) show = false;

      if (query) {
        var title = (card.dataset.title || "").toLowerCase();
        var desc = (card.dataset.description || "").toLowerCase();
        if (title.indexOf(query) === -1 && desc.indexOf(query) === -1) show = false;
      }

      card.setAttribute("data-hidden", show ? "false" : "true");
    });

    // 카테고리 섹션: 보이는 카드가 있으면 표시, 없으면 숨김
    catSections.forEach(function (section) {
      var sectionCards = Array.from(section.querySelectorAll(".gl-card"));
      var anyVisible = sectionCards.some(function (c) { return c.getAttribute("data-hidden") !== "true"; });
      section.setAttribute("data-visible", anyVisible ? "true" : "false");
      if (anyVisible) {
        visibleCount += sectionCards.filter(function (c) { return c.getAttribute("data-hidden") !== "true"; }).length;
      }
    });

    // 피처드 영역: 필터 활성 시 숨김
    if (featuredEl) {
      if (hasFilter) {
        featuredEl.style.display = "none";
      } else {
        featuredEl.style.display = "";
        visibleCount = totalCount;
      }
    }

    // 카운트
    if (countEl) {
      countEl.textContent = visibleCount;
    }

    // 빈 상태
    if (emptyEl) {
      emptyEl.style.display = (hasFilter && visibleCount === 0) ? "block" : "none";
    }

    // 필터 요약
    updateFilterSummary(hasFilter);
    updateHash();
  }

  function updateFilterSummary(hasFilter) {
    if (!summaryEl) return;
    if (!hasFilter) {
      summaryEl.style.display = "none";
      return;
    }

    var parts = [];
    if (activeFilters.consonant) parts.push(activeFilters.consonant);
    if (activeFilters.letter) parts.push(activeFilters.letter);
    if (activeFilters.category) parts.push(activeFilters.category);
    if (activeFilters.difficulty) parts.push(activeFilters.difficulty);

    var query = searchInput ? searchInput.value.trim() : "";
    if (query) parts.push('"' + query + '"');

    if (parts.length > 0) {
      summaryEl.style.display = "";
      if (summaryTextEl) summaryTextEl.textContent = parts.join(" + ");
    } else {
      summaryEl.style.display = "none";
    }
  }

  function updateHash() {
    var val = activeFilters.consonant || activeFilters.letter || "";
    if (val) {
      history.replaceState(null, "", "#" + encodeURIComponent(val));
    } else {
      history.replaceState(null, "", window.location.pathname);
    }
  }

  // URL hash 복원
  function restoreFromHash() {
    var hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (!hash) return;

    var consonants = "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ";
    var type = consonants.indexOf(hash) !== -1 ? "consonant" : "letter";

    pills.forEach(function (pill) {
      if (pill.dataset.filterType === type && pill.dataset.filterValue === hash) {
        pill.click();
      }
    });
  }

  restoreFromHash();
})();
