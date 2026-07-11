function openExample(event, tabId) {
  const contents = document.querySelectorAll(".page-tab-content");
  const buttons = document.querySelectorAll(".page-tab-button");

  contents.forEach(function(content) {
    content.classList.remove("active");
  });

  buttons.forEach(function(button) {
    button.classList.remove("active");
  });

  // Show the specific clicked tab content and mark the button as active
  document.getElementById(tabId).classList.add("active");
  event.currentTarget.classList.add("active");
}