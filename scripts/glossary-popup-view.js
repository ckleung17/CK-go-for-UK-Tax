/*
  GLOSSARY-POPUP-VIEW.JS
  Converts a hash-targeted Trust glossary entry into an iframe-friendly view.
  Contract: the hash begins with #glossary- and identifies a .glossary-entry element.
*/

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
