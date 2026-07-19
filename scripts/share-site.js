/*
  SHARE-SITE.JS
  Shares the canonical GitHub Pages URL from the homepage header.
  Depends on #site-share-button and #site-share-status in index.html.

  1. Share-control setup
  2. Share and clipboard fallback
*/

(() => {
  "use strict";

  /* 1. Share-control setup */
  const siteUrl = "https://ckleung17.github.io/CK-go-for-UK-Tax/";
  const shareButton = document.getElementById("site-share-button");
  const shareStatus = document.getElementById("site-share-status");

  if (!shareButton || !shareStatus) {
    return;
  }

  const setStatus = (message) => {
    shareStatus.textContent = message;
  };

  /* 2. Share and clipboard fallback */
  shareButton.addEventListener("click", async () => {
    const shareData = {
      title: "CK Go for UK Tax",
      text: "UK tax learning notes and CPD material",
      url: siteUrl
    };

    setStatus("");

    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
        await navigator.share(shareData);
        setStatus("Site link shared.");
        return;
      }

      await navigator.clipboard.writeText(siteUrl);
      setStatus("Site link copied to the clipboard.");
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      setStatus("The site link could not be shared.");
    }
  });
})();
