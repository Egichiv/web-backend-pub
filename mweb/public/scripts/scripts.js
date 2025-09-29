(function () {
  try {
    var loadEls = document.querySelectorAll('#loadTime');
    var t = (performance.now() / 1000).toFixed(2);
    loadEls.forEach(function (el) { el.textContent = t; });
  } catch {}
})();