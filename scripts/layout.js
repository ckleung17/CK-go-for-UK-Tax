const layoutScriptUrl = document.currentScript?.src;
const footerUrl = layoutScriptUrl
  ? new URL('../footer.html', layoutScriptUrl)
  : 'footer.html';

if (layoutScriptUrl && footerUrl instanceof URL) {
  const assetVersion = new URL(layoutScriptUrl).searchParams.get('v');

  if (assetVersion) {
    footerUrl.searchParams.set('v', assetVersion);
  }
}

fetch(footerUrl)
  .then(response => response.text())
  .then(data => {
    document.getElementById('global-footer').innerHTML = data;
  });
