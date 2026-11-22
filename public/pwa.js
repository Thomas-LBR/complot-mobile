/* Capture the browser prompt before React/fonts finish mounting. */
window.addEventListener('beforeinstallprompt', function (event) {
  event.preventDefault();
  window.tableInstallPrompt = event;
  window.dispatchEvent(new Event('table-install-ready'));
});
window.addEventListener('appinstalled', function () {
  window.tableInstallPrompt = null;
});
if ('serviceWorker' in navigator && window.isSecureContext && !['localhost', '127.0.0.1'].includes(location.hostname)) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(function (error) {
      console.warn('Installation hors ligne indisponible.', error);
    });
  });
}
