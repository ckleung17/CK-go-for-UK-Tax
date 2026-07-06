function openExample(event, exampleId) {
  const contents = document.querySelectorAll(".example-tab-content");
  const buttons = document.querySelectorAll(".example-tab-button");

  contents.forEach(function(content) {
    content.classList.remove("active");
  });

  buttons.forEach(function(button) {
    button.classList.remove("active");
  });

  document.getElementById(exampleId).classList.add("active");
  event.currentTarget.classList.add("active");
}