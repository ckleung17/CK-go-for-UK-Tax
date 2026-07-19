/*
 * Loads global tax-rate datasets and renders the selected published tax topic,
 * period and, for Income Tax, jurisdiction in reference/tax-rates/index.html.
 * Depends on uk-tax-rates.json, published-topic-rates.json and page IDs.
 *
 * Contents:
 * 1. DOM setup
 * 2. Data validation and formatting
 * 3. Table and source rendering
 * 4. Data loading and control events
 */

(() => {
  "use strict";

  /* 1. DOM setup */
  const elements = {
    controls: document.getElementById("tax-rate-controls"),
    search: document.getElementById("tax-rate-search"),
    searchStatus: document.getElementById("tax-rate-search-status"),
    type: document.getElementById("tax-rate-type"),
    year: document.getElementById("tax-rate-year"),
    jurisdiction: document.getElementById("tax-rate-jurisdiction"),
    jurisdictionControl: document.getElementById("tax-rate-jurisdiction-control"),
    status: document.getElementById("tax-rate-status"),
    heading: document.getElementById("selected-tax-year-heading"),
    period: document.getElementById("tax-rate-period"),
    scope: document.getElementById("tax-rate-scope"),
    datasetScope: document.getElementById("tax-rate-dataset-scope"),
    reviewed: document.getElementById("tax-rate-reviewed"),
    nonSavingsNote: document.getElementById("non-savings-note"),
    allowancesBody: document.getElementById("tax-rate-allowances-body"),
    nonSavingsBody: document.getElementById("tax-rate-non-savings-body"),
    savingsBody: document.getElementById("tax-rate-savings-body"),
    dividendBody: document.getElementById("tax-rate-dividend-body"),
    investmentReliefsBody: document.getElementById("tax-rate-investment-reliefs-body"),
    incomeRelatedBody: document.getElementById("tax-rate-income-related-body"),
    sources: document.getElementById("tax-rate-sources"),
    incomePanel: document.getElementById("income-tax-panel"),
    incomeSourcesPanel: document.getElementById("income-tax-sources-panel"),
    topicPanel: document.getElementById("topic-tax-panel"),
    topicHeading: document.getElementById("topic-tax-heading"),
    topicPeriod: document.getElementById("topic-tax-period"),
    topicScope: document.getElementById("topic-tax-scope"),
    topicSections: document.getElementById("topic-tax-sections"),
    topicSources: document.getElementById("topic-tax-sources"),
    topicReviewed: document.getElementById("topic-tax-reviewed"),
    topicLink: document.getElementById("topic-tax-link")
  };

  if (Object.values(elements).some((element) => !element)) {
    return;
  }

  let dataset;
  let topicDataset;
  let glossaryDataset;
  let taxTypeSearchRecords = [];

  /* 2. Data validation and formatting */
  const moneyFormatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  });

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });

  const formatMoney = (amount) => moneyFormatter.format(amount);

  const formatRate = (rate) => (rate * 100).toLocaleString("en-GB", {
    maximumFractionDigits: 2
  }) + "%";

  const formatDate = (date) => dateFormatter.format(
    new Date(date + "T00:00:00Z")
  );

  const formatRange = (band) => {
    if (band.upperInclusive === null) {
      return "Above " + formatMoney(band.lowerExclusive);
    }

    if (band.lowerExclusive === 0) {
      return "Up to " + formatMoney(band.upperInclusive);
    }

    return "Above " + formatMoney(band.lowerExclusive)
      + " to " + formatMoney(band.upperInclusive);
  };

  const validateBands = (bands, label) => {
    if (!Array.isArray(bands) || bands.length === 0) {
      throw new Error(label + " has no rate bands.");
    }

    let previousUpper = 0;
    bands.forEach((band, index) => {
      if (band.lowerExclusive !== previousUpper) {
        throw new Error(label + " has a gap or overlap at band " + (index + 1) + ".");
      }

      if (typeof band.rate !== "number" || band.rate < 0 || band.rate > 1) {
        throw new Error(label + " has an invalid rate.");
      }

      if (band.upperInclusive !== null && band.upperInclusive <= band.lowerExclusive) {
        throw new Error(label + " has an invalid upper limit.");
      }

      previousUpper = band.upperInclusive;
    });

    if (previousUpper !== null) {
      throw new Error(label + " must end with an open-ended band.");
    }
  };

  const validateDataset = (candidate) => {
    if (candidate.schemaVersion !== 1 || !Array.isArray(candidate.taxYears)) {
      throw new Error("The tax-rate dataset uses an unsupported schema.");
    }

    const ids = new Set();
    candidate.taxYears.forEach((taxYear) => {
      if (ids.has(taxYear.id)) {
        throw new Error("The tax-rate dataset contains a duplicate tax year.");
      }
      ids.add(taxYear.id);

      const allowances = taxYear.allowances;
      const married = allowances.marriedCouplesAllowance;
      if (
        allowances.personalAllowanceZeroAt
          !== allowances.personalAllowance
            / allowances.personalAllowanceTaperRate
            + allowances.personalAllowanceTaperThreshold
        || allowances.startingRateForSavingsReductionRate !== 1
        || married.incomeLimit <= 0
        || married.reductionRate !== 0.5
      ) {
        throw new Error(taxYear.id + " has invalid allowance-reduction data.");
      }

      ["englandWalesNorthernIrelandNonSavings", "scotlandNonSavings", "savings", "dividends"]
        .forEach((rateType) => {
          validateBands(taxYear.rates[rateType], taxYear.id + " " + rateType);
        });

      taxYear.sourceIds.forEach((sourceId) => {
        if (!candidate.sources[sourceId]) {
          throw new Error(taxYear.id + " refers to an unknown source.");
        }
      });
    });

    if (!ids.has(candidate.currentTaxYear)) {
      throw new Error("The current tax year is missing from the dataset.");
    }
    candidate.taxYears.forEach((taxYear) => {
      if (!Array.isArray(candidate.investmentReliefsByTaxYear[taxYear.id])) {
        throw new Error(taxYear.id + " has no investment-relief reference.");
      }
      if (!Array.isArray(candidate.incomeRelatedReferencesByTaxYear[taxYear.id])) {
        throw new Error(taxYear.id + " has no care-relief and Child Benefit reference.");
      }
    });
  };

  /* 3. Table and source rendering */
  const appendCell = (row, tagName, text, scope) => {
    const cell = document.createElement(tagName);
    cell.textContent = text;
    if (scope) {
      cell.scope = scope;
    }
    row.appendChild(cell);
  };

  const renderSimpleRows = (tableBody, rows) => {
    tableBody.replaceChildren();
    rows.forEach((rowData) => {
      const row = document.createElement("tr");
      appendCell(row, "th", rowData[0], "row");
      rowData.slice(1).forEach((value) => {
        appendCell(row, "td", value);
      });
      tableBody.appendChild(row);
    });
  };

  const rateRows = (bands) => bands.map((band) => [
    band.name,
    formatRange(band),
    formatRate(band.rate)
  ]);

  const renderAllowances = (taxYear) => {
    const allowances = taxYear.allowances;
    const psa = allowances.personalSavingsAllowance;
    const married = allowances.marriedCouplesAllowance;

    renderSimpleRows(elements.allowancesBody, [
      [
        "Personal Allowance",
        formatMoney(allowances.personalAllowance),
        "Adjusted net income above "
          + formatMoney(allowances.personalAllowanceTaperThreshold)
          + " reduces this by £1 for each £2. It is nil at "
          + formatMoney(allowances.personalAllowanceZeroAt)
          + ". Adjusted net income starts with all taxable income, including earnings, pensions, property income, savings and dividends, then makes specified adjustments."
      ],
      [
        "Starting rate for savings",
        "Up to " + formatMoney(allowances.startingRateForSavingsLimit),
        "The amount available falls by £"
          + allowances.startingRateForSavingsReductionRate
          + " for each £1 of non-savings income above the available Personal Allowance, and reaches nil when that income reaches the Personal Allowance plus "
          + formatMoney(allowances.startingRateForSavingsLimit) + "."
      ],
      [
        "Personal Savings Allowance",
        formatMoney(psa.basicRateTaxpayer) + " / "
          + formatMoney(psa.higherRateTaxpayer) + " / "
          + formatMoney(psa.additionalRateTaxpayer),
        "Basic-rate / higher-rate / additional-rate taxpayer. This changes by tax band rather than reducing gradually."
      ],
      [
        "Dividend allowance",
        formatMoney(allowances.dividendAllowance),
        "A 0% dividend rate; the income still uses tax-band capacity."
      ],
      [
        "Blind Person’s Allowance",
        formatMoney(allowances.blindPersonsAllowance),
        "Eligibility and transfer rules apply."
      ],
      [
        "Married Couple’s Allowance",
        formatMoney(married.minimum) + " to " + formatMoney(married.maximum),
        "Adjusted net income above " + formatMoney(married.incomeLimit)
          + " reduces the maximum by £1 for each £2, but not below "
          + formatMoney(married.minimum) + ". Tax reduction at "
          + formatRate(married.reliefRate) + "; eligibility conditions apply."
      ]
    ]);
  };

  const renderSources = (taxYear) => {
    elements.sources.replaceChildren();
    taxYear.sourceIds.forEach((sourceId) => {
      const source = dataset.sources[sourceId];
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = source.title;
      item.appendChild(link);
      item.append(" — " + source.authority + "; " + source.status + ".");
      elements.sources.appendChild(item);
    });
  };

  const appendSourceList = (list, sourceIds, sources) => {
    list.replaceChildren();
    sourceIds.forEach((sourceId) => {
      const source = sources[sourceId];
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = source.title;
      item.appendChild(link);
      item.append(" — " + source.authority + "; " + source.status + ".");
      list.appendChild(item);
    });
  };

  const renderTopicTax = () => {
    const taxType = topicDataset.taxTypes.find(
      (record) => record.id === elements.type.value
    );
    if (!taxType) {
      throw new Error("The selected tax reference is unavailable.");
    }
    const period = taxType.periods.find(
      (record) => record.id === elements.year.value
    );
    if (!period) {
      throw new Error("The selected tax reference is unavailable.");
    }

    elements.topicHeading.textContent = taxType.label + " — " + period.label;
    elements.topicPeriod.textContent = "Effective period: " + period.effective + ".";
    elements.topicScope.textContent = taxType.scope;
    elements.topicLink.href = taxType.topicPath;
    elements.topicSections.replaceChildren();

    period.sections.forEach((section, sectionIndex) => {
      const heading = document.createElement("h3");
      const headingId = "topic-rate-section-" + sectionIndex;
      heading.id = headingId;
      heading.textContent = section.heading;

      const wrapper = document.createElement("div");
      wrapper.className = "table-wrap tax-rate-table-wrap";
      wrapper.tabIndex = 0;
      wrapper.setAttribute("role", "region");
      wrapper.setAttribute("aria-labelledby", headingId);

      const table = document.createElement("table");
      table.className = "simple-table tax-rate-reference-table tax-rate-topic-table";
      const tableHead = document.createElement("thead");
      const headingRow = document.createElement("tr");
      section.columns.forEach((column) => appendCell(headingRow, "th", column, "col"));
      tableHead.appendChild(headingRow);

      const tableBody = document.createElement("tbody");
      renderSimpleRows(tableBody, section.rows);
      table.append(tableHead, tableBody);
      wrapper.appendChild(table);
      elements.topicSections.append(heading, wrapper);
    });

    appendSourceList(
      elements.topicSources,
      period.sourceIds,
      topicDataset.sources
    );
    elements.topicReviewed.textContent = "Dataset reviewed "
      + formatDate(topicDataset.lastReviewed) + ".";
    elements.status.dataset.state = "ready";
    elements.status.textContent = "Showing " + taxType.label + ", "
      + period.label + " (" + period.status + ").";
  };

  const renderSelected = () => {
    const isIncomeTax = elements.type.value === "income-tax";
    elements.incomePanel.hidden = !isIncomeTax;
    elements.incomeSourcesPanel.hidden = !isIncomeTax;
    elements.topicPanel.hidden = isIncomeTax;
    elements.jurisdictionControl.hidden = !isIncomeTax;
    if (isIncomeTax) {
      renderTaxYear();
    } else {
      renderTopicTax();
    }
  };

  const populateTaxTypeOptions = (records, preferredTaxType) => {
    elements.type.replaceChildren();
    records.forEach((record) => {
      const option = document.createElement("option");
      option.value = record.id;
      option.textContent = record.label;
      elements.type.appendChild(option);
    });

    if (records.some((record) => record.id === preferredTaxType)) {
      elements.type.value = preferredTaxType;
    }
  };

  const matchesSearchTerm = (searchText, term) => {
    if (term.length > 3) {
      return searchText.includes(term);
    }
    const escapedTerm = term.replace(/[.*+?^$()|[\]{}\\]/g, "\\$&");
    return new RegExp("(^|[^a-z0-9])" + escapedTerm + "(?=$|[^a-z0-9])", "u")
      .test(searchText);
  };

  const filterTaxTypes = () => {
    const terms = elements.search.value
      .trim()
      .toLocaleLowerCase("en-GB")
      .split(/\s+/)
      .filter(Boolean);
    const previousTaxType = elements.type.value;
    const matches = taxTypeSearchRecords.filter((record) =>
      terms.every((term) => matchesSearchTerm(record.searchText, term))
    );

    populateTaxTypeOptions(matches, previousTaxType);
    elements.type.disabled = matches.length === 0;
    elements.year.disabled = matches.length === 0;
    elements.jurisdiction.disabled = matches.length === 0;

    if (matches.length === 0) {
      elements.searchStatus.textContent = "No tax topics match “"
        + elements.search.value.trim() + "”.";
      elements.incomePanel.hidden = true;
      elements.incomeSourcesPanel.hidden = true;
      elements.topicPanel.hidden = true;
      return matches;
    }

    elements.searchStatus.textContent = terms.length
      ? matches.length + (matches.length === 1 ? " tax topic matches." : " tax topics match.")
      : "";
    configurePeriodOptions();
    renderSelected();
    return matches;
  };

  const configurePeriodOptions = () => {
    const isIncomeTax = elements.type.value === "income-tax";
    const periods = isIncomeTax
      ? dataset.taxYears
      : topicDataset.taxTypes.find(
        (record) => record.id === elements.type.value
      ).periods;

    elements.year.replaceChildren();
    periods.forEach((period) => {
      const option = document.createElement("option");
      option.value = period.id;
      option.textContent = period.label + " — "
        + (isIncomeTax ? period.displayStatus : period.status);
      elements.year.appendChild(option);
    });
    elements.year.value = isIncomeTax ? dataset.currentTaxYear : periods[0].id;
  };

  const renderTaxYear = () => {
    const taxYear = dataset.taxYears.find((record) => record.id === elements.year.value);
    if (!taxYear) {
      throw new Error("The selected tax year is unavailable.");
    }

    const isScotland = elements.jurisdiction.value === "scotland";
    const nonSavingsRates = isScotland
      ? taxYear.rates.scotlandNonSavings
      : taxYear.rates.englandWalesNorthernIrelandNonSavings;

    elements.heading.textContent = "Income Tax rates and allowances — " + taxYear.label;
    elements.period.textContent = "Effective from " + formatDate(taxYear.effectiveFrom)
      + " to " + formatDate(taxYear.effectiveTo) + ".";
    elements.scope.textContent = isScotland
      ? "Scottish rates shown below apply to non-savings, non-dividend income. Savings and dividend rates are UK-wide."
      : "Non-savings rates shown below apply to taxpayers in England, Wales and Northern Ireland.";
    elements.nonSavingsNote.textContent = isScotland
      ? "Scottish rates apply only to the non-savings, non-dividend income of a Scottish taxpayer."
      : "These rates apply to non-savings income for taxpayers in England, Wales and Northern Ireland.";

    renderAllowances(taxYear);
    renderSimpleRows(elements.nonSavingsBody, rateRows(nonSavingsRates));

    const startingRateRow = [[
      "Starting rate for savings",
      "Up to " + formatMoney(taxYear.allowances.startingRateForSavingsLimit)
        + " (subject to other income)",
      "0%"
    ]];
    renderSimpleRows(
      elements.savingsBody,
      startingRateRow.concat(rateRows(taxYear.rates.savings))
    );
    renderSimpleRows(elements.dividendBody, rateRows(taxYear.rates.dividends));
    renderSimpleRows(
      elements.investmentReliefsBody,
      dataset.investmentReliefsByTaxYear[taxYear.id].map((relief) => [
        relief.name,
        relief.rate,
        relief.limit,
        relief.availability
      ])
    );
    renderSimpleRows(
      elements.incomeRelatedBody,
      dataset.incomeRelatedReferencesByTaxYear[taxYear.id].map((record) => [
        record.category,
        record.item,
        record.amount,
        record.point
      ])
    );
    renderSources(taxYear);

    elements.reviewed.textContent = "Record verified "
      + formatDate(taxYear.verifiedOn) + ".";
    elements.status.dataset.state = "ready";
    elements.status.textContent = "Showing " + taxYear.label + " ("
      + taxYear.displayStatus + ", " + taxYear.legislativeStatus + ").";
  };

  /* 4. Data loading and control events */
  const initialise = async () => {
    try {
      const responses = await Promise.all([
        fetch("uk-tax-rates.json?v=20260719h"),
        fetch("published-topic-rates.json?v=20260719h"),
        fetch("../glossary/glossary.json?v=20260719a")
      ]);
      if (responses.some((response) => !response.ok)) {
        throw new Error("The tax-rate data could not be loaded.");
      }

      const [candidate, topicCandidate, glossaryCandidate] = await Promise.all(
        responses.map((response) => response.json())
      );
      validateDataset(candidate);
      if (
        glossaryCandidate.schemaVersion !== 1
        || !Array.isArray(glossaryCandidate.entries)
      ) {
        throw new Error("The glossary dataset uses an unsupported schema.");
      }
      if (
        topicCandidate.schemaVersion !== 1
        || !Array.isArray(topicCandidate.taxTypes)
      ) {
        throw new Error("The published-topic dataset uses an unsupported schema.");
      }
      topicCandidate.taxTypes.forEach((taxType) => {
        if (!Array.isArray(taxType.periods) || taxType.periods.length === 0) {
          throw new Error(taxType.id + " has no reference periods.");
        }
        taxType.periods.forEach((period) => {
          period.sourceIds.forEach((sourceId) => {
            if (!topicCandidate.sources[sourceId]) {
              throw new Error(period.id + " refers to an unknown source.");
            }
          });
        });
      });
      dataset = candidate;
      topicDataset = topicCandidate;
      glossaryDataset = glossaryCandidate;

      const glossaryAliasesFor = (taxTypeId) => glossaryDataset.entries
        .filter((entry) => entry.taxTypeIds.includes(taxTypeId))
        .flatMap((entry) => [entry.abbreviation, entry.term, ...entry.aliases])
        .join(" ");

      const requestedTaxType = new URLSearchParams(window.location.search).get("tax");
      taxTypeSearchRecords = [
        {
          id: "income-tax",
          label: "Income Tax",
          searchText: ([
            "Income Tax",
            glossaryAliasesFor("income-tax"),
            JSON.stringify(candidate.taxYears),
            JSON.stringify(candidate.investmentReliefsByTaxYear),
            JSON.stringify(candidate.incomeRelatedReferencesByTaxYear)
          ].join(" "))
            .toLocaleLowerCase("en-GB")
        },
        ...topicCandidate.taxTypes.map((taxType) => ({
          id: taxType.id,
          label: taxType.label,
          searchText: ([
            taxType.label,
            glossaryAliasesFor(taxType.id),
            JSON.stringify(taxType.periods.map((period) => ({
              label: period.label,
              effective: period.effective,
              sections: period.sections
            })))
          ].join(" "))
            .toLocaleLowerCase("en-GB")
        }))
      ];
      populateTaxTypeOptions(taxTypeSearchRecords, requestedTaxType);

      elements.datasetScope.textContent = candidate.scopeNote;
      configurePeriodOptions();
      renderSelected();

      elements.type.addEventListener("change", () => {
        try {
          configurePeriodOptions();
          renderSelected();
        } catch (error) {
          elements.status.dataset.state = "error";
          elements.status.textContent = error.message;
        }
      });
      elements.controls.addEventListener("submit", (event) => {
        event.preventDefault();
        const matches = filterTaxTypes();
        if (matches.length === 0) {
          return;
        }

        const selectedLabel = elements.type.options[elements.type.selectedIndex].textContent;
        elements.searchStatus.textContent = "Showing " + selectedLabel + ". "
          + matches.length
          + (matches.length === 1
            ? " tax topic matches."
            : " tax topics match; use Tax type to choose another.");

        const resultHeading = elements.type.value === "income-tax"
          ? elements.heading
          : elements.topicHeading;
        resultHeading.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      elements.search.addEventListener("input", filterTaxTypes);
      elements.search.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && elements.search.value) {
          elements.search.value = "";
          filterTaxTypes();
        }
      });
      elements.year.addEventListener("change", renderSelected);
      elements.jurisdiction.addEventListener("change", renderSelected);
    } catch (error) {
      elements.status.dataset.state = "error";
      elements.status.textContent = error.message;
    }
  };

  initialise();
})();
