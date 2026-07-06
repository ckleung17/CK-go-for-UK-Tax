document.addEventListener("DOMContentLoaded", function () {
  const popupLinks = document.querySelectorAll(".popup-link");

  if (popupLinks.length === 0) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";
  overlay.innerHTML = `
    <div class="popup-window">
      <div class="popup-header">
        <span id="popup-title">Popup Window</span>
        <button id="popup-close" type="button">×</button>
      </div>
      <iframe id="popup-frame" src=""></iframe>
    </div>
  `;

  document.body.appendChild(overlay);

  const popupTitle = document.getElementById("popup-title");
  const popupFrame = document.getElementById("popup-frame");
  const popupClose = document.getElementById("popup-close");

  popupLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      const page = link.getAttribute("data-page") || link.getAttribute("href");
      const title = link.getAttribute("data-title") || "Popup Window";

      popupTitle.textContent = title;
      popupFrame.src = page;
      overlay.style.display = "flex";
    });
  });

  popupClose.addEventListener("click", closePopup);

  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
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
  }
});