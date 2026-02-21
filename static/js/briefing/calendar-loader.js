(function () {
  "use strict";

  var ns = (window.MPBriefing = window.MPBriefing || {});

  var KRX_PUBLIC_HOLIDAYS = {
    2024: [
      "2024-01-01",
      "2024-02-09",
      "2024-02-10",
      "2024-02-12",
      "2024-03-01",
      "2024-05-06",
      "2024-05-15",
      "2024-06-06",
      "2024-08-15",
      "2024-09-16",
      "2024-09-17",
      "2024-09-18",
      "2024-10-03",
      "2024-10-09",
      "2024-12-25",
    ],
    2025: [
      "2025-01-01",
      "2025-01-28",
      "2025-01-29",
      "2025-01-30",
      "2025-03-01",
      "2025-05-05",
      "2025-06-06",
      "2025-08-15",
      "2025-10-03",
      "2025-10-06",
      "2025-10-07",
      "2025-10-08",
      "2025-10-09",
      "2025-12-25",
    ],
    2026: [
      "2026-01-01",
      "2026-02-16",
      "2026-02-17",
      "2026-02-18",
      "2026-03-01",
      "2026-05-05",
      "2026-05-24",
      "2026-06-06",
      "2026-08-15",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-10-03",
      "2026-10-09",
      "2026-12-25",
    ],
    2027: [
      "2027-01-01",
      "2027-02-06",
      "2027-02-08",
      "2027-02-09",
      "2027-03-01",
      "2027-05-05",
      "2027-05-13",
      "2027-06-06",
      "2027-08-15",
      "2027-09-14",
      "2027-09-15",
      "2027-09-16",
      "2027-10-03",
      "2027-10-09",
      "2027-12-25",
    ],
    2028: [
      "2028-01-01",
      "2028-01-26",
      "2028-01-27",
      "2028-01-28",
      "2028-03-01",
      "2028-05-02",
      "2028-05-05",
      "2028-06-06",
      "2028-08-15",
      "2028-10-02",
      "2028-10-03",
      "2028-10-04",
      "2028-10-09",
      "2028-12-25",
    ],
    2029: [
      "2029-01-01",
      "2029-02-12",
      "2029-02-13",
      "2029-02-14",
      "2029-03-01",
      "2029-05-07",
      "2029-05-20",
      "2029-06-06",
      "2029-08-15",
      "2029-09-21",
      "2029-09-22",
      "2029-09-24",
      "2029-10-03",
      "2029-10-09",
      "2029-12-25",
    ],
    2030: [
      "2030-01-01",
      "2030-02-02",
      "2030-02-04",
      "2030-02-05",
      "2030-03-01",
      "2030-05-06",
      "2030-05-09",
      "2030-06-06",
      "2030-08-15",
      "2030-09-11",
      "2030-09-12",
      "2030-09-13",
      "2030-10-03",
      "2030-10-09",
      "2030-12-25",
    ],
  };

  ns.KRX_PUBLIC_HOLIDAYS = KRX_PUBLIC_HOLIDAYS;

  ns.createCalendarConverter = function () {
    if (typeof window.MPCreateCalendarConverter !== "function") return null;
    return window.MPCreateCalendarConverter(KRX_PUBLIC_HOLIDAYS);
  };

  ns.transformCalendarSection = function (
    calendarSection,
    convertScheduleToCalendar,
  ) {
    if (!calendarSection || typeof convertScheduleToCalendar !== "function")
      return;
    if (
      calendarSection.dataset &&
      calendarSection.dataset.mpCalendarEnhanced === "true"
    )
      return;
    if (calendarSection.dataset)
      calendarSection.dataset.mpCalendarEnhanced = "true";

    try {
      convertScheduleToCalendar(calendarSection);
      document.addEventListener("mp:chart-data-ready", function onChartReady() {
        try {
          convertScheduleToCalendar(calendarSection);
        } catch (innerErr) {
          console.warn(
            "Calendar re-render failed after chart data ready:",
            innerErr,
          );
        }
        document.removeEventListener("mp:chart-data-ready", onChartReady);
      });
    } catch (err) {
      console.warn("Calendar transformation failed, keeping original:", err);
    }
  };

  ns.transformCalendarShortcodes = function (root, convertScheduleToCalendar) {
    if (!root || typeof convertScheduleToCalendar !== "function") return;

    var sections = root.querySelectorAll("[data-mp-calendar-shortcode]");
    sections.forEach(function (section) {
      var h2 = section.querySelector("h2");
      if (!h2) {
        var config = window.MP_CONFIG || {};
        var defaultTitle = "\uC774\uBCA4\uD2B8 \uCE98\uB9B0\uB354";
        if (config.sections && config.sections.calendar) {
          defaultTitle = Array.isArray(config.sections.calendar)
            ? config.sections.calendar[config.sections.calendar.length - 1]
            : config.sections.calendar;
        }
        h2 = document.createElement("h2");
        h2.textContent = defaultTitle;
        section.insertBefore(h2, section.firstChild);
      }
      ns.transformCalendarSection(section, convertScheduleToCalendar);
    });
  };
})();
