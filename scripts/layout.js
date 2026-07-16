const layoutScriptUrl = document.currentScript?.src;
const footerUrl = layoutScriptUrl
  ? new URL('../footer.html', layoutScriptUrl)
  : 'footer.html';

fetch(footerUrl)
  .then(response => response.text())
  .then(data => {
    document.getElementById('global-footer').innerHTML = data;
  });
