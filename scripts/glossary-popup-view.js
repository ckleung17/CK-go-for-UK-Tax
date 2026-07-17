document.addEventListener("DOMContentLoaded", function () {
  if (window.self === window.top || !window.location.hash.startsWith("#glossary-")) {
    return;
  }

  const glossaryEntry = document.querySelector(window.location.hash);

  if (!glossaryEntry || !glossaryEntry.classList.contains("glossary-entry")) {
    return;
  }

  document.body.classList.add("glossary-popup-view");

  const heading = glossaryEntry.querySelector("h4");
  if (heading) {
    document.title = heading.textContent + " - Trust glossary";
  }

  glossaryEntry.focus({ preventScroll: true });
});
