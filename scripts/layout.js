/*
  LAYOUT.JS
  Adds shared reference launchers, table alignment, and the footer using paths
  resolved relative to this script. Pages provide a header and #global-footer.

  Contents:
  1. Shared asset paths and tax-topic mapping
  2. Header reference launchers
  3. Global table-cell alignment
  4. Shared footer
*/

(() => {
  "use strict";

  /* 1. Shared asset paths and tax-topic mapping */
  const layoutScriptUrl = document.currentScript?.src;
  const siteRootUrl = layoutScriptUrl
    ? new URL("../", layoutScriptUrl)
    : new URL("./", window.location.href);
  const footerUrl = new URL("footer.html", siteRootUrl);
  const taxTableUrl = new URL("reference/tax-rates/index.html", siteRootUrl);
  const glossaryUrl = new URL("reference/glossary/index.html", siteRootUrl);
  const assetVersion = layoutScriptUrl
    ? new URL(layoutScriptUrl).searchParams.get("v")
    : null;

  const taxTopicByPath = [
    { path: "PTAX/ITAX/", tax: "income-tax" },
    { path: "PTAX/CGT/", tax: "capital-gains-tax" },
    { path: "PTAX/PAYE/", tax: "employment-paye" },
    { path: "PTAX/NIC/", tax: "national-insurance" },
    { path: "PTAX/PENTAX/", tax: "pensions-tax" },
    { path: "STTAX/SDLT/", tax: "stamp-duty-land-tax" },
    { path: "INTAX/FIG/", tax: "foreign-income-gains" },
    { path: "TRUST/", tax: "trust-tax" },
    { path: "BTAX/CTAX/", tax: "corporation-tax" },
    { path: "IHT/", tax: "inheritance-tax" },
    { path: "TAXADM/", tax: "tax-administration" }
  ];

  const pagePath = decodeURIComponent(window.location.pathname);
  const rootPath = decodeURIComponent(siteRootUrl.pathname);
  const relativePagePath = pagePath.startsWith(rootPath)
    ? pagePath.slice(rootPath.length)
    : pagePath.replace(/^\//, "");
  const isHomePage = relativePagePath === "" || relativePagePath === "index.html";
  const isTaxTablePage = relativePagePath === "reference/tax-rates/index.html";
  const isGlossaryPage = relativePagePath === "reference/glossary/index.html";
  const pageTaxTopic = isHomePage
    ? null
    : taxTopicByPath.find((record) => relativePagePath.startsWith(record.path));

  if (assetVersion) {
    footerUrl.searchParams.set("v", assetVersion);
  }
  if (pageTaxTopic) {
    taxTableUrl.searchParams.set("tax", pageTaxTopic.tax);
    glossaryUrl.searchParams.set("topic", pageTaxTopic.tax);
  }

  /* 2. Header reference launchers */
  const addHeaderReferenceLaunchers = () => {
    const pageHeader = document.querySelector("header");
    if (!pageHeader || pageHeader.querySelector(".header-reference-links")) {
      return;
    }

    const links = document.createElement("div");
    links.className = "header-reference-links";

    const addPopupBehaviour = (link, windowName) => {
      link.addEventListener("click", (event) => {
        const popup = window.open(
          link.href,
          windowName,
          "popup=yes,width=1100,height=780,resizable=yes,scrollbars=yes"
        );
        if (popup) {
          event.preventDefault();
          popup.focus();
        }
      });
    };

    if (!isHomePage && !isTaxTablePage) {
      const taxLink = document.createElement("a");
      taxLink.className = "tax-table-header-link";
      taxLink.href = taxTableUrl.href;
      taxLink.target = "ck-tax-table";
      taxLink.rel = "noopener";
      taxLink.setAttribute("aria-label", pageTaxTopic
        ? "Open the tax table for this topic"
        : "Open the UK tax table");
      taxLink.title = pageTaxTopic
        ? "Open the tax table for this topic"
        : "Open the UK tax table";
      taxLink.innerHTML = [
        '<svg class="tax-table-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
        '<rect x="3" y="4" width="18" height="16" rx="1.5"></rect>',
        '<path d="M3 8h18M14.8 11.5l-5.6 6"></path>',
        '<circle cx="9" cy="12.5" r="1.2"></circle>',
        '<circle cx="15" cy="16.5" r="1.2"></circle>',
        "</svg>",
        "<span>Tax %</span>"
      ].join("");
      addPopupBehaviour(taxLink, taxLink.target);
      links.appendChild(taxLink);
    }

    if (!isHomePage && !isGlossaryPage) {
      const glossaryLink = document.createElement("a");
      glossaryLink.className = "glossary-header-link";
      glossaryLink.href = glossaryUrl.href;
      glossaryLink.target = "ck-tax-glossary";
      glossaryLink.rel = "noopener";
      glossaryLink.setAttribute("aria-label", "Open the glossary of tax terms");
      glossaryLink.title = "Open the glossary of tax terms";
      glossaryLink.innerHTML = [
        '<svg class="glossary-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">',
        '<rect x="2.5" y="4" width="19" height="16" rx="2"></rect>',
        '<text x="12" y="14.4">ABC</text>',
        "</svg>",
        "<span>Glossary</span>"
      ].join("");
      addPopupBehaviour(glossaryLink, glossaryLink.target);
      links.appendChild(glossaryLink);
    }

    if (links.children.length > 0) {
      pageHeader.classList.add("header-reference-links-host");
      pageHeader.appendChild(links);
    }
  };

  addHeaderReferenceLaunchers();

  /* 3. Global table-cell alignment
     Explicit semantic hooks take priority. Automatic detection is deliberately
     strict: a cell containing any explanatory word remains left aligned. */
  const isPureAmount = (value) => {
    const text = value.trim().toLowerCase();
    if (!text || text.length > 80 || !/\d/.test(text)) {
      return false;
    }

    const remainder = text
      .replace(/£?\d[\d,.]*(?:%|p|k|m)?/g, "")
      .replace(/[\s()\[\]{}/:+×=@.,–—-]/g, "");
    return remainder === "";
  };

  const applyGlobalTableAlignment = () => {
    document.querySelectorAll("table").forEach((table) => {
      const bodyRows = Array.from(table.tBodies).flatMap((body) => Array.from(body.rows));
      bodyRows.forEach((row) => {
        Array.from(row.cells).forEach((cell) => {
          if (
            cell.tagName === "TD"
            && (
              cell.matches(".amount-cell, .numeric-cell, [data-cell-type='amount']")
              || isPureAmount(cell.textContent)
            )
          ) {
            cell.classList.add("amount-cell");
          }
        });
      });
    });
  };

  applyGlobalTableAlignment();

  /* 4. Shared footer */
  const footerHost = document.getElementById("global-footer");
  if (footerHost) {
    fetch(footerUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("The shared footer could not be loaded.");
        }
        return response.text();
      })
      .then((data) => {
        footerHost.innerHTML = data;
      })
      .catch(() => {
        footerHost.textContent = "";
      });
  }
})();
