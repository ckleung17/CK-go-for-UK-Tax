fetch('../footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('global-footer').innerHTML = data;
  }); 
