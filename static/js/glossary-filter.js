/**
 * glossary-filter.js — 주식사전 필터링 로직
 * 초성/알파벳, 카테고리, 난이도 필터 + 검색
 */
(function () {
  "use strict";

  const grid = document.getElementById("gl-grid");
  if (!grid) return;

  const searchInput = document.getElementById("gl-search");
  const countEl = document.getElementById("gl-count");
  const emptyEl = document.getElementById("gl-empty");
  const cards = Array.from(grid.querySelectorAll(".gl-card"));
  const chips = Array.from(document.querySelectorAll(".gl-chip"));

  // 현재 활성 필터
  const activeFilters = {
    consonant: null,
    letter: null,
    category: null,
    difficulty: null,
  };

  // 칩 클릭 핸들러
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var type = chip.dataset.filterType;
      var value = chip.dataset.filterValue;

      if (chip.classList.contains("is-active")) {
        chip.classList.remove("is-active");
        activeFilters[type] = null;
      } else {
        // 같은 타입의 다른 칩 비활성화 (단일 선택)
        // consonant/letter는 서로 배타적
        if (type === "consonant" || type === "letter") {
          chips.forEach(function (c) {
            if (
              c.dataset.filterType === "consonant" ||
              c.dataset.filterType === "letter"
            ) {
              c.classList.remove("is-active");
            }
          });
          activeFilters.consonant = null;
          activeFilters.letter = null;
        } else {
          chips.forEach(function (c) {
            if (c.dataset.filterType === type) {
              c.classList.remove("is-active");
            }
          });
        }
        chip.classList.add("is-active");
        activeFilters[type] = value;
      }

      applyFilters();
    });
  });

  // 검색 입력 핸들러
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  function applyFilters() {
    var query = (searchInput ? searchInput.value : "").toLowerCase().trim();
    var visibleCount = 0;

    cards.forEach(function (card) {
      var show = true;

      // 초성 필터
      if (activeFilters.consonant) {
        if (card.dataset.consonant !== activeFilters.consonant) show = false;
      }

      // 알파벳 필터
      if (activeFilters.letter) {
        if (card.dataset.letter !== activeFilters.letter) show = false;
      }

      // 카테고리 필터
      if (activeFilters.category) {
        if (card.dataset.category !== activeFilters.category) show = false;
      }

      // 난이도 필터
      if (activeFilters.difficulty) {
        if (card.dataset.difficulty !== activeFilters.difficulty) show = false;
      }

      // 텍스트 검색
      if (query) {
        var title = (card.dataset.title || "").toLowerCase();
        var desc = (card.dataset.description || "").toLowerCase();
        if (title.indexOf(query) === -1 && desc.indexOf(query) === -1) {
          show = false;
        }
      }

      card.setAttribute("data-hidden", show ? "false" : "true");
      if (show) visibleCount++;
    });

    // 카운트 업데이트
    if (countEl) {
      countEl.textContent = visibleCount + "개 용어";
    }

    // 빈 상태
    if (emptyEl) {
      emptyEl.style.display = visibleCount === 0 ? "block" : "none";
    }
    grid.style.display = visibleCount === 0 ? "none" : "";
  }

  // URL hash에서 초기 필터 복원
  function restoreFromHash() {
    var hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (!hash) return;

    // 초성인지 알파벳인지 판별
    var consonants = "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ";
    var type = consonants.indexOf(hash) !== -1 ? "consonant" : "letter";

    chips.forEach(function (chip) {
      if (
        chip.dataset.filterType === type &&
        chip.dataset.filterValue === hash
      ) {
        chip.click();
      }
    });
  }

  restoreFromHash();

  // 필터 변경 시 URL hash 업데이트
  function updateHash() {
    var val = activeFilters.consonant || activeFilters.letter || "";
    if (val) {
      history.replaceState(null, "", "#" + encodeURIComponent(val));
    } else {
      history.replaceState(null, "", window.location.pathname);
    }
  }

  // applyFilters에 hash 업데이트 추가
  var _origApply = applyFilters;
  applyFilters = function () {
    _origApply();
    updateHash();
  };
})();
