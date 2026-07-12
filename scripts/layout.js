/* fetch('/footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('global-footer').innerHTML = data;
  }); */

// Figures out how many folders deep the current webpage is 
// and dynamically builds the path back to the root folder
const depth = window.location.pathname.split('/').filter(Boolean).pop()?.endsWith('.html') 
  ? window.location.pathname.split('/').filter(Boolean).length - 2
  : window.location.pathname.split('/').filter(Boolean).length - 1;

// If inside a subfolder like 'SDLT', this becomes '../footer.html'
// If at the root like 'index.html', this stays 'footer.html'
const relativePrefix = '../'.repeat(Math.max(0, depth));
const footerPath = `${relativePrefix}footer.html`;

fetch(footerPath)
  .then(response => {
    if (!response.ok) throw new Error('Failed to load footer');
    return response.text();
  })
  .then(data => {
    document.getElementById('global-footer').innerHTML = data;
  })
  .catch(error => console.error('Error:', error));

