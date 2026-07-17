/*
  POPUP-WINDOW.JS
  Builds and controls the reusable iframe popup used by .popup-link elements.
  Contract: each link supplies href or data-page; data-title is optional.

  1. Popup shell
  2. Link activation and opening state
  3. Window state controls
  4. Closing interactions and cleanup
*/

document.addEventListener("DOMContentLoaded", function () {
  /* 1. Popup shell */
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

  /* 2. Link activation and opening state */
  popupLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      const page = link.getAttribute("data-page") || link.getAttribute("href");
      const title = link.getAttribute("data-title") || "Popup Window";

      popupTitle.textContent = title;
      popupFrame.src = page;
      
      /* Opening always restores the normal window state. */
      popupWindow.classList.remove("minimized", "maximized");
      overlay.classList.remove("minimized-overlay");
      
      overlay.style.display = "flex";
    });
  });

  /* 3. Window state controls */
  popupMaximize.addEventListener("click", function () {
    popupWindow.classList.remove("minimized");
    overlay.classList.remove("minimized-overlay");
    popupWindow.classList.toggle("maximized");
  });

  popupMinimize.addEventListener("click", function () {
    popupWindow.classList.remove("maximized");
    popupWindow.classList.toggle("minimized");
    overlay.classList.toggle("minimized-overlay");
  });

  /* 4. Closing interactions and cleanup */
  popupClose.addEventListener("click", closePopup);

  overlay.addEventListener("click", function (event) {
    /* A minimized popup remains open when its pass-through overlay is clicked. */
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