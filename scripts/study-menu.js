(() => {
  const dropdowns = Array.from(document.querySelectorAll(".study-area-dropdown"));

  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("toggle", () => {
      if (!dropdown.open) return;

      dropdowns.forEach((otherDropdown) => {
        if (otherDropdown !== dropdown) otherDropdown.open = false;
      });
    });

    dropdown.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !dropdown.open) return;

      dropdown.open = false;
      dropdown.querySelector("summary")?.focus();
    });
  });
})();
