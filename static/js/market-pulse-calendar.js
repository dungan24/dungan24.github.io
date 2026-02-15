(function() {
  'use strict';

  function createCalendarConverter(KRX_PUBLIC_HOLIDAYS) {
    var ns = window.MPCalendar || {};
    if (typeof ns.createParser !== 'function' || typeof ns.createModel !== 'function' || typeof ns.createRenderer !== 'function') {
      console.warn('MPCalendar modules are not fully loaded.');
      return null;
    }

    var parser = ns.createParser(KRX_PUBLIC_HOLIDAYS || {});
    var model = ns.createModel(parser);
    var renderer = ns.createRenderer(parser, model);
    return renderer.convertScheduleToCalendar;
  }

  window.MPCreateCalendarConverter = createCalendarConverter;
})();
