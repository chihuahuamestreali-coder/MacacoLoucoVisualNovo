// Trata o redirecionamento do 404.html para SPAs no GitHub Pages
(function() {
  var q = window.location.search;
  if (q && q.indexOf('?p=/') !== -1) {
    var match = q.match(/\?p=([^&]*)/);
    if (match && match[1]) {
      var decoded = decodeURIComponent(match[1]);
      var basePath = window.location.pathname.replace(/\/$/, '');
      window.history.replaceState(null, '', basePath + decoded + (window.location.hash || ''));
    }
  }
})();
