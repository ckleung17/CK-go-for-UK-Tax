/*
  STUDY-MENU.JS
  Coordinates the homepage study-area disclosure menus.
  Uses native details/summary elements and restores keyboard focus after Escape.

  1. Single-open dropdown behaviour
  2. Escape-key dismissal
*/

(() => {
  const dropdowns = Array.from(document.querySelectorAll(".study-area-dropdown"));

  dropdowns.forEach((dropdown) => {
    /* 1. Single-open dropdown behaviour */
    dropdown.addEventListener("toggle", () => {
      if (!dropdown.open) return;

      dropdowns.forEach((otherDropdown) => {
        if (otherDropdown !== dropdown) otherDropdown.open = false;
      });
    });

    /* 2. Escape-key dismissal */
    dropdown.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !dropdown.open) return;

      dropdown.open = false;
      dropdown.querySelector("summary")?.focus();
    });
  });
})();
