/**
 * Glossary Auto-Link + Tooltip
 *
 * Scans FACT_ZONE / OPINION_ZONE text nodes for glossary terms,
 * wraps first occurrence of each term with <a class="gl-term">,
 * and shows a hover tooltip with the term description.
 */
(function () {
  "use strict";

  const DATA_URL = "/data/glossary-terms.json";

  // ── Tooltip singleton ──
  let tooltip = null;

  function getTooltip() {
    if (tooltip) return tooltip;
    tooltip = document.createElement("div");
    tooltip.className = "gl-tooltip";
    tooltip.setAttribute("role", "tooltip");
    document.body.appendChild(tooltip);
    return tooltip;
  }

  function showTooltip(anchor) {
    const tt = getTooltip();
    const title = anchor.dataset.glTitle || "";
    const desc = anchor.dataset.glDesc || "";
    tt.innerHTML =
      '<div class="gl-tooltip__title">' + escHtml(title) + "</div>" +
      '<div class="gl-tooltip__desc">' + escHtml(desc) + "</div>";
    tt.classList.add("is-active");

    // Position near anchor
    const rect = anchor.getBoundingClientRect();
    const ttW = 280;
    let left = rect.left + rect.width / 2 - ttW / 2;
    if (left < 8) left = 8;
    if (left + ttW > window.innerWidth - 8) left = window.innerWidth - 8 - ttW;
    let top = rect.bottom + 8;
    // Flip above if near bottom
    if (top + 120 > window.innerHeight) {
      top = rect.top - 8;
      tt.style.transform = "translateY(-100%)";
    } else {
      tt.style.transform = "";
    }
    tt.style.left = left + "px";
    tt.style.top = top + "px";
  }

  function hideTooltip() {
    if (tooltip) tooltip.classList.remove("is-active");
  }

  function escHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ── DOM text node walker ──
  function getTextNodes(root) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        // Skip if inside <a>, <code>, <pre>, <script>, <style>
        let p = node.parentElement;
        while (p && p !== root) {
          const tag = p.tagName;
          if (tag === "A" || tag === "CODE" || tag === "PRE" || tag === "SCRIPT" || tag === "STYLE") {
            return NodeFilter.FILTER_REJECT;
          }
          if (p.classList.contains("gl-term")) return NodeFilter.FILTER_REJECT;
          p = p.parentElement;
        }
        return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  // ── Main ──
  async function init() {
    // Only run on briefing posts (FACT/OPINION zones exist)
    const zones = [];
    const comments = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT);
    let inFact = false, inOpinion = false;
    let factStart = null, opinionStart = null;
    let c;
    while ((c = comments.nextNode())) {
      const v = c.textContent.trim();
      if (v === "FACT_ZONE_START") { inFact = true; factStart = c; }
      if (v === "FACT_ZONE_END" && inFact && factStart) {
        // Collect siblings between start and end comment
        zones.push({ start: factStart, end: c });
        inFact = false;
      }
      if (v === "OPINION_ZONE_START") { inOpinion = true; opinionStart = c; }
      if (v === "OPINION_ZONE_END" && inOpinion && opinionStart) {
        zones.push({ start: opinionStart, end: c });
        inOpinion = false;
      }
    }

    if (zones.length === 0) return;

    let terms;
    try {
      const resp = await fetch(DATA_URL);
      if (!resp.ok) return;
      terms = await resp.json();
    } catch { return; }

    if (!terms || !terms.length) return;

    // Build sorted alias → term map (longer aliases first)
    const aliasMap = [];
    for (const t of terms) {
      for (const a of t.aliases) {
        aliasMap.push({ alias: a, term: t });
      }
    }
    aliasMap.sort((a, b) => b.alias.length - a.alias.length);

    const matched = new Set(); // slug set — each term linked once

    for (const zone of zones) {
      // Collect elements between start/end comments
      const container = zone.start.parentElement;
      if (!container) continue;

      const textNodes = getTextNodes(container);

      for (const node of textNodes) {
        if (matched.size === aliasMap.length) break;

        const text = node.textContent;
        for (const { alias, term } of aliasMap) {
          if (matched.has(term.slug)) continue;

          const idx = text.indexOf(alias);
          if (idx === -1) continue;

          // Split text node and wrap matched portion
          const before = text.substring(0, idx);
          const after = text.substring(idx + alias.length);

          const link = document.createElement("a");
          link.className = "gl-term";
          link.href = "/glossary/" + term.slug + "/";
          link.textContent = alias;
          link.dataset.glTitle = term.title;
          link.dataset.glDesc = term.desc;

          const parent = node.parentNode;
          if (before) parent.insertBefore(document.createTextNode(before), node);
          parent.insertBefore(link, node);
          if (after) parent.insertBefore(document.createTextNode(after), node);
          parent.removeChild(node);

          matched.add(term.slug);
          break; // Move to next text node (this one was split)
        }
      }
    }

    // Event delegation for tooltips
    document.addEventListener("pointerenter", function (e) {
      const a = e.target.closest(".gl-term");
      if (a) showTooltip(a);
    }, true);

    document.addEventListener("pointerleave", function (e) {
      if (e.target.closest(".gl-term")) hideTooltip();
    }, true);
  }

  // Run after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // Delay slightly to let other scripts (section-wrapping) run first
    setTimeout(init, 100);
  }
})();
