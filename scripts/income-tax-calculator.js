(() => {
  "use strict";

  const calculator = document.getElementById("income-tax-calculator");
  const tableBody = document.getElementById("income-tax-calculation-body");
  const summary = document.getElementById("income-tax-calculation-summary");

  if (!calculator || !tableBody || !summary) {
    return;
  }

  const rules = {
    personalAllowance: 12570,
    personalAllowanceTaperThreshold: 100000,
    personalAllowanceEndThreshold: 125140,
    startingRateBand: 5000,
    basicRateLimit: 37700,
    additionalRateThreshold: 125140,
    dividendAllowance: 500,
    rates: {
      nonSavings: [0.20, 0.40, 0.45],
      savings: [0.20, 0.40, 0.45],
      dividend: [0.1075, 0.3575, 0.3935]
    }
  };

  const inputs = {
    nonSavings: document.getElementById("calculator-non-savings"),
    savings: document.getElementById("calculator-savings"),
    dividend: document.getElementById("calculator-dividend")
  };

  const readAmount = (input) => {
    const amount = Number.parseFloat(input.value);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
  };

  const money = (amount) => amount.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const rateLabel = (rate) => `${(rate * 100).toLocaleString("en-GB", {
    maximumFractionDigits: 2
  })}%`;

  const calculatePersonalAllowance = (adjustedNetIncome) => {
    if (adjustedNetIncome <= rules.personalAllowanceTaperThreshold) {
      return rules.personalAllowance;
    }

    if (adjustedNetIncome >= rules.personalAllowanceEndThreshold) {
      return 0;
    }

    const reduction = Math.floor(
      (adjustedNetIncome - rules.personalAllowanceTaperThreshold) / 2
    );

    return Math.max(0, rules.personalAllowance - reduction);
  };

  const allocateAllowance = (amount, allowanceRemaining) => {
    const allowanceUsed = Math.min(amount, allowanceRemaining);

    return {
      allowanceUsed,
      taxableAmount: amount - allowanceUsed,
      allowanceRemaining: allowanceRemaining - allowanceUsed
    };
  };

  const allocateAcrossRateBands = (amount, startingPosition, rates) => {
    const limits = [rules.basicRateLimit, rules.additionalRateThreshold, Infinity];
    const slices = [];
    let amountRemaining = amount;
    let position = startingPosition;

    for (let index = 0; index < limits.length && amountRemaining > 0; index += 1) {
      const capacity = Math.max(0, limits[index] - position);
      const sliceAmount = Math.min(amountRemaining, capacity);

      if (sliceAmount > 0) {
        slices.push({
          amount: sliceAmount,
          rate: rates[index],
          tax: sliceAmount * rates[index]
        });
        amountRemaining -= sliceAmount;
        position += sliceAmount;
      }
    }

    return {
      slices,
      endingPosition: position
    };
  };

  const addRow = ({
    label,
    rate = "&mdash;",
    nonSavings = "&mdash;",
    savings = "&mdash;",
    dividend = "&mdash;",
    tax = "&mdash;",
    subtotal = false
  }) => {
    const row = document.createElement("tr");

    if (subtotal) {
      row.classList.add("calculation-subtotal");
    }

    const amountCell = (value) => {
      const cellClass = value === "&mdash;"
        ? "calculation-empty"
        : "calculation-amount";

      return `<td class="${cellClass}">${value}</td>`;
    };

    row.innerHTML = `
      <th scope="row">${label}</th>
      <td>${rate}</td>
      ${amountCell(nonSavings)}
      ${amountCell(savings)}
      ${amountCell(dividend)}
      ${amountCell(tax)}
    `;
    tableBody.appendChild(row);
  };

  const calculate = () => {
    const gross = {
      nonSavings: readAmount(inputs.nonSavings),
      savings: readAmount(inputs.savings),
      dividend: readAmount(inputs.dividend)
    };
    const totalIncome = gross.nonSavings + gross.savings + gross.dividend;
    const personalAllowance = calculatePersonalAllowance(totalIncome);

    let allowanceRemaining = personalAllowance;
    const nonSavings = allocateAllowance(gross.nonSavings, allowanceRemaining);
    allowanceRemaining = nonSavings.allowanceRemaining;
    const savings = allocateAllowance(gross.savings, allowanceRemaining);
    allowanceRemaining = savings.allowanceRemaining;
    const dividend = allocateAllowance(gross.dividend, allowanceRemaining);
    allowanceRemaining = dividend.allowanceRemaining;

    const taxableIncome = nonSavings.taxableAmount
      + savings.taxableAmount
      + dividend.taxableAmount;
    const personalSavingsAllowance = taxableIncome <= rules.basicRateLimit
      ? 1000
      : taxableIncome <= rules.additionalRateThreshold
        ? 500
        : 0;
    const startingRateAvailable = Math.max(
      0,
      rules.startingRateBand - nonSavings.taxableAmount
    );
    const startingRateCalculation = nonSavings.taxableAmount
      <= rules.startingRateBand
      ? `£${money(rules.startingRateBand)} − £${money(nonSavings.taxableAmount)} = £${money(startingRateAvailable)}`
      : `£${money(rules.startingRateBand)} − £${money(nonSavings.taxableAmount)}, restricted to nil = £0.00`;
    const savingsAtStartingRate = Math.min(
      savings.taxableAmount,
      startingRateAvailable
    );
    const savingsAfterStartingRate = savings.taxableAmount - savingsAtStartingRate;
    const savingsAtPersonalSavingsAllowance = Math.min(
      savingsAfterStartingRate,
      personalSavingsAllowance
    );
    const savingsAtPositiveRates = savingsAfterStartingRate
      - savingsAtPersonalSavingsAllowance;
    const dividendAtNilRate = Math.min(
      dividend.taxableAmount,
      rules.dividendAllowance
    );
    const dividendAtPositiveRates = dividend.taxableAmount - dividendAtNilRate;

    let position = 0;
    let totalNonSavingsTax = 0;
    let totalSavingsTax = 0;
    let totalDividendTax = 0;

    const nonSavingsRates = allocateAcrossRateBands(
      nonSavings.taxableAmount,
      position,
      rules.rates.nonSavings
    );
    nonSavingsRates.slices.forEach((slice) => {
      totalNonSavingsTax += slice.tax;
    });
    position = nonSavingsRates.endingPosition;

    position += savingsAtStartingRate;
    position += savingsAtPersonalSavingsAllowance;

    const savingsRates = allocateAcrossRateBands(
      savingsAtPositiveRates,
      position,
      rules.rates.savings
    );
    savingsRates.slices.forEach((slice) => {
      totalSavingsTax += slice.tax;
    });
    position = savingsRates.endingPosition;

    position += dividendAtNilRate;

    const dividendRates = allocateAcrossRateBands(
      dividendAtPositiveRates,
      position,
      rules.rates.dividend
    );
    dividendRates.slices.forEach((slice) => {
      totalDividendTax += slice.tax;
    });

    const totalTax = totalNonSavingsTax + totalSavingsTax + totalDividendTax;

    tableBody.replaceChildren();

    addRow({
      label: "Non-savings income",
      nonSavings: money(gross.nonSavings)
    });
    addRow({
      label: "Savings income",
      savings: money(gross.savings)
    });
    addRow({
      label: "Dividend income",
      dividend: money(gross.dividend)
    });
    addRow({
      label: "Total incomes",
      nonSavings: money(gross.nonSavings),
      savings: money(gross.savings),
      dividend: money(gross.dividend),
      subtotal: true
    });

    if (nonSavings.allowanceUsed > 0) {
      addRow({
        label: "Less: Personal Allowance used against non-savings income",
        nonSavings: `(${money(nonSavings.allowanceUsed)})`
      });
    }

    if (savings.allowanceUsed > 0) {
      addRow({
        label: "Less: unused Personal Allowance used against savings income",
        savings: `(${money(savings.allowanceUsed)})`
      });
    }

    if (dividend.allowanceUsed > 0) {
      addRow({
        label: "Less: unused Personal Allowance used against dividend income",
        dividend: `(${money(dividend.allowanceUsed)})`
      });
    }

    if (savingsAtStartingRate > 0) {
      addRow({
        label: `Less: Starting rate for savings available:<br>${startingRateCalculation}`,
        savings: `(${money(savingsAtStartingRate)})`
      });
    }

    if (savingsAtPersonalSavingsAllowance > 0) {
      addRow({
        label: "Less: Personal Savings Allowance",
        savings: `(${money(savingsAtPersonalSavingsAllowance)})`
      });
    }

    if (dividendAtNilRate > 0) {
      addRow({
        label: "Less: Dividend Allowance available",
        dividend: `(${money(dividendAtNilRate)})`
      });
    }

    addRow({
      label: "Amounts assessable at positive rates",
      nonSavings: money(nonSavings.taxableAmount),
      savings: money(savingsAtPositiveRates),
      dividend: money(dividendAtPositiveRates),
      subtotal: true
    });

    addRow({
      label: "Tax thereon:",
      subtotal: true
    });

    nonSavingsRates.slices.forEach((slice) => {
      addRow({
        label: "Non-savings income",
        rate: rateLabel(slice.rate),
        nonSavings: money(slice.tax),
        tax: money(slice.tax)
      });
    });

    savingsRates.slices.forEach((slice) => {
      addRow({
        label: "Savings income",
        rate: rateLabel(slice.rate),
        savings: money(slice.tax),
        tax: money(slice.tax)
      });
    });

    dividendRates.slices.forEach((slice) => {
      addRow({
        label: "Dividend income",
        rate: rateLabel(slice.rate),
        dividend: money(slice.tax),
        tax: money(slice.tax)
      });
    });

    addRow({
      label: "Total Income Tax",
      nonSavings: money(totalNonSavingsTax),
      savings: money(totalSavingsTax),
      dividend: money(totalDividendTax),
      tax: money(totalTax),
      subtotal: true
    });

    summary.textContent = `Personal Allowance: £${money(personalAllowance)}. `
      + `Starting-rate band used: £${money(savingsAtStartingRate)}. `
      + `Personal Savings Allowance used: £${money(savingsAtPersonalSavingsAllowance)}. `
      + `Dividend Allowance used: £${money(dividendAtNilRate)}. `
      + `Total Income Tax: £${money(totalTax)}.`;
  };

  calculator.addEventListener("input", calculate);
  calculator.addEventListener("reset", () => {
    window.setTimeout(calculate, 0);
  });

  calculate();
})();