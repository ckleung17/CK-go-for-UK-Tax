/*
  PAGE-TABS.JS
  Activates one tab button and its matching content panel.
  Contract: buttons call openExample(event, tabId), and tabId identifies a .page-tab-content element.
*/

/**
 * Activates the requested tab panel and deactivates every other page tab.
 * @param {Event} event Click event from the tab button.
 * @param {string} tabId ID of the content panel to display.
 */
function openExample(event, tabId) {
  const contents = document.querySelectorAll(".page-tab-content");
  const buttons = document.querySelectorAll(".page-tab-button");

  contents.forEach(function(content) {
    content.classList.remove("active");
  });

  buttons.forEach(function(button) {
    button.classList.remove("active");
  });

  document.getElementById(tabId).classList.add("active");
  event.currentTarget.classList.add("active");
}