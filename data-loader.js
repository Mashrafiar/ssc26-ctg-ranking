/* Makes the pages use the slim files made by build_data.py, with automatic fallback to the raw JSON.
   Ranking / college / school pages  -> data/<name>.list.json
   *-details.html?roll=...           -> data/d/<name>/<roll % 256>.json
   Load this BEFORE the page's own scripts. No page code needs to change. */
(function () {
  'use strict';
  var RAW = { 'data.json': 1, 'business-data.json': 1, 'humanities-data.json': 1, 'hsc26-science-data.json': 1,
              'hsc26-business-data.json': 1, 'hsc26-humanities-data.json': 1 };
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  if (!realFetch) return;
  var qs = new URLSearchParams(location.search);
  var isDetails = /-details\.html$/.test(location.pathname) && /^\d+$/.test(qs.get('roll') || '');

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var name = url.split('?')[0].split('/').pop();
    if (!RAW[name]) return realFetch(input, init);
    var base = name.replace(/\.json$/, '');
    var slim = isDetails ? 'data/d/' + base + '/' + (parseInt(qs.get('roll'), 10) % 256) + '.json'
                         : 'data/' + base + '.list.json';
    return realFetch(slim, init).then(function (r) { return r.ok ? r : realFetch(input, init); },
                                      function () { return realFetch(input, init); });
  };
})();
