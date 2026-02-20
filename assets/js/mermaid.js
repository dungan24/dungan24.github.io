/* Mermaid theme override — Market Pulse cyber aesthetic
   Overrides themes/blowfish/assets/js/mermaid.js */

function initMermaidLight() {
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    look: "handDrawn",
    themeVariables: {
      background: "transparent",
      fontFamily: '"IBM Plex Sans KR", "Pretendard", system-ui, sans-serif',
      fontSize: "18px",

      /* Node colors */
      primaryColor: "#ede9fe",
      primaryTextColor: "#1e1b4b",
      primaryBorderColor: "#7c3aed",

      secondaryColor: "#e0f2fe",
      secondaryTextColor: "#0c4a6e",
      secondaryBorderColor: "#0891b2",

      tertiaryColor: "#f0fdf4",
      tertiaryTextColor: "#14532d",
      tertiaryBorderColor: "#16a34a",

      /* Lines & labels */
      lineColor: "#64748b",
      textColor: "#334155",

      /* Notes & special */
      noteBkgColor: "#fef3c7",
      noteTextColor: "#78350f",
      noteBorderColor: "#d97706",

      /* Sequence diagram */
      actorBkg: "#ede9fe",
      actorTextColor: "#1e1b4b",
      actorBorder: "#7c3aed",
      actorLineColor: "#94a3b8",
      signalColor: "#334155",
      signalTextColor: "#334155",
      labelBoxBkgColor: "#f8fafc",
      labelTextColor: "#334155",
    },
  });
}

function initMermaidDark() {
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    look: "handDrawn",
    themeVariables: {
      background: "transparent",
      fontFamily: '"IBM Plex Sans KR", "Pretendard", system-ui, sans-serif',
      fontSize: "18px",

      /* Node colors — dark glassy */
      primaryColor: "rgba(124, 58, 237, 0.25)",
      primaryTextColor: "#e2e8f0",
      primaryBorderColor: "#7c3aed",

      secondaryColor: "rgba(8, 145, 178, 0.2)",
      secondaryTextColor: "#e2e8f0",
      secondaryBorderColor: "#0891b2",

      tertiaryColor: "rgba(22, 163, 74, 0.15)",
      tertiaryTextColor: "#e2e8f0",
      tertiaryBorderColor: "#16a34a",

      /* Lines & labels */
      lineColor: "#94a3b8",
      textColor: "#e2e8f0",

      /* Notes & special */
      noteBkgColor: "rgba(217, 119, 6, 0.15)",
      noteTextColor: "#fbbf24",
      noteBorderColor: "#d97706",

      /* Sequence diagram */
      actorBkg: "rgba(124, 58, 237, 0.3)",
      actorTextColor: "#e2e8f0",
      actorBorder: "#7c3aed",
      actorLineColor: "#64748b",
      signalColor: "#94a3b8",
      signalTextColor: "#e2e8f0",
      labelBoxBkgColor: "rgba(15, 23, 42, 0.8)",
      labelTextColor: "#e2e8f0",
    },
  });
}
