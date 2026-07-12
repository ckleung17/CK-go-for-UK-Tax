document.addEventListener("DOMContentLoaded", function () {
  const popupLinks = document.querySelectorAll(".popup-link");

  if (popupLinks.length === 0) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  overlay.innerHTML = `
    <div class="popup-window" id="popup-window">
      <div class="popup-header">
        <span id="popup-title">Popup Window</span>
        <div class="popup-controls">
          <button id="popup-minimize" type="button" title="Minimize">—</button>
          <button id="popup-maximize" type="button" title="Maximize">🗖</button>
          <button id="popup-close" type="button" title="Close">×</button>
        </div>
      </div>
      <iframe id="popup-frame" src=""></iframe>
    </div>
  `;

  document.body.appendChild(overlay);

  const popupWindow = document.getElementById("popup-window");
  const popupTitle = document.getElementById("popup-title");
  const popupFrame = document.getElementById("popup-frame");
  const popupClose = document.getElementById("popup-close");
  const popupMinimize = document.getElementById("popup-minimize");
  const popupMaximize = document.getElementById("popup-maximize");

  popupLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      const page = link.getAttribute("data-page") || link.getAttribute("href");
      const title = link.getAttribute("data-title") || "Popup Window";

      popupTitle.textContent = title;
      popupFrame.src = page;
      
      // Reset window state when opening
      popupWindow.classList.remove("minimized", "maximized");
      overlay.classList.remove("minimized-overlay");
      
      overlay.style.display = "flex";
    });
  });

  // Maximize Toggle
  popupMaximize.addEventListener("click", function () {
    popupWindow.classList.remove("minimized");
    overlay.classList.remove("minimized-overlay");
    popupWindow.classList.toggle("maximized");
  });

  // Minimize Toggle
  popupMinimize.addEventListener("click", function () {
    popupWindow.classList.remove("maximized");
    popupWindow.classList.toggle("minimized");
    overlay.classList.toggle("minimized-overlay");
  });

  popupClose.addEventListener("click", closePopup);

  overlay.addEventListener("click", function (event) {
    // Prevent closing if the window is minimized and user clicks the bottom tray
    if (event.target === overlay && !popupWindow.classList.contains("minimized")) {
      closePopup();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closePopup();
    }
  });

  function closePopup() {
    overlay.style.display = "none";
    popupFrame.src = "";
    popupWindow.classList.remove("minimized", "maximized");
    overlay.classList.remove("minimized-overlay");
  }
});