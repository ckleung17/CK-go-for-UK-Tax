/*
 * Loads, validates, renders and filters reference/glossary/glossary.json.
 * Depends on the controls and table body in reference/glossary/index.html.
 *
 * Contents:
 * 1. DOM and data validation
 * 2. Glossary rendering
 * 3. Data loading and search events
 */

(() => {
  "use strict";

  /* 1. DOM and data validation */
  const search = document.getElementById("global-glossary-search");
  const topic = document.getElementById("global-glossary-topic");
  const status = document.getElementById("global-glossary-status");
  const body = document.getElementById("global-glossary-body");
  let dataset;

  const validateDataset = (candidate) => {
    if (
      candidate.schemaVersion !== 1
      || !candidate.taxTypes
      || !Array.isArray(candidate.entries)
    ) {
      throw new Error("The glossary dataset uses an unsupported schema.");
    }
    candidate.entries.forEach((entry) => {
      if (
        !entry.id
        || !entry.kind
        || !entry.term
        || !entry.meaning
        || !Array.isArray(entry.aliases)
        || !Array.isArray(entry.references)
      ) {
        throw new Error("A glossary entry is incomplete.");
      }
      entry.taxTypeIds.forEach((taxTypeId) => {
        if (!candidate.taxTypes[taxTypeId]) {
          throw new Error(entry.abbreviation + " refers to an unknown tax topic.");
        }
      });
    });
  };

  /* 2. Glossary rendering */
  const appendCell = (row, tagName, text, scope) => {
    const cell = document.createElement(tagName);
    cell.textContent = text;
    if (scope) {
      cell.scope = scope;
    }
    row.appendChild(cell);
    return cell;
  };

  const matchesSearchTerm = (searchable, term) => {
    if (term.length > 3) {
      return searchable.includes(term);
    }
    const escapedTerm = term.replace(/[.*+?^$()|[\]{}\\]/g, "\\$&");
    return new RegExp("(^|[^a-z0-9])" + escapedTerm + "(?=$|[^a-z0-9])", "u")
      .test(searchable);
  };

  const render = () => {
    const terms = search.value.trim().toLocaleLowerCase("en-GB").split(/\s+/).filter(Boolean);
    const matches = dataset.entries.filter((entry) => {
      const searchable = [
        entry.abbreviation,
        entry.term,
        entry.meaning,
        ...entry.aliases,
        ...entry.taxTypeIds.map((taxTypeId) => dataset.taxTypes[taxTypeId].label)
      ].join(" ").toLocaleLowerCase("en-GB");
      const topicMatches = !topic.value || entry.taxTypeIds.includes(topic.value);
      return topicMatches
        && terms.every((term) => matchesSearchTerm(searchable, term));
    });

    body.replaceChildren();
    matches.forEach((entry) => {
      const row = document.createElement("tr");
      row.id = entry.id;
      row.className = "glossary-entry";
      row.tabIndex = -1;
      const termCell = appendCell(row, "th", entry.term, "row");
      termCell.dataset.label = "Term";
      const abbreviationCell = appendCell(row, "td", entry.abbreviation || "—");
      abbreviationCell.dataset.label = "Abbreviation";
      const meaningCell = appendCell(row, "td", entry.meaning);
      meaningCell.dataset.label = "Meaning";
      if (entry.references.length) {
        const references = document.createElement("div");
        references.className = "glossary-see";
        references.append("See: ");
        entry.references.forEach((reference, index) => {
          const link = document.createElement("a");
          link.href = reference.href;
          link.textContent = reference.label;
          if (index) {
            references.append("; ");
          }
          references.appendChild(link);
        });
        meaningCell.appendChild(references);
      }
      const topicsCell = document.createElement("td");
      topicsCell.dataset.label = "Tax topic";
      entry.taxTypeIds.forEach((taxTypeId, index) => {
        const topic = dataset.taxTypes[taxTypeId];
        const link = document.createElement("a");
        link.href = topic.href;
        link.textContent = topic.label;
        if (index) {
          topicsCell.append(", ");
        }
        topicsCell.appendChild(link);
      });
      row.appendChild(topicsCell);
      body.appendChild(row);
    });

    status.textContent = matches.length
      + (matches.length === 1 ? " glossary entry shown." : " glossary entries shown.");

    const target = window.location.hash
      ? document.getElementById(window.location.hash.slice(1))
      : null;
    if (target) {
      if (window.self !== window.top) {
        document.body.classList.add("global-glossary-popup-view");
        target.classList.add("glossary-popup-target");
      }
      target.focus({ preventScroll: window.self !== window.top });
      if (window.self === window.top) {
        target.scrollIntoView({ block: "center" });
      }
      document.title = target.cells[0].textContent + " — Tax glossary";
    }
  };

  /* 3. Data loading and search events */
  fetch("glossary.json?v=20260719a")
    .then((response) => {
      if (!response.ok) {
        throw new Error("The glossary could not be loaded.");
      }
      return response.json();
    })
    .then((candidate) => {
      validateDataset(candidate);
      dataset = candidate;
      const allTopicsOption = document.createElement("option");
      allTopicsOption.value = "";
      allTopicsOption.textContent = "All tax topics";
      topic.appendChild(allTopicsOption);
      Object.entries(dataset.taxTypes).forEach(([taxTypeId, taxType]) => {
        const option = document.createElement("option");
        option.value = taxTypeId;
        option.textContent = taxType.label;
        topic.appendChild(option);
      });
      const requestedTopic = new URLSearchParams(window.location.search).get("topic");
      if (dataset.taxTypes[requestedTopic]) {
        topic.value = requestedTopic;
      }
      render();
      search.addEventListener("input", render);
      topic.addEventListener("change", render);
      search.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && search.value) {
          search.value = "";
          render();
        }
      });
    })
    .catch((error) => {
      status.textContent = error.message;
    });
})();
