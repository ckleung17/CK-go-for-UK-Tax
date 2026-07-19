# Global UK tax-rate reference

This folder contains the cross-topic dynamic tax-rate reference. The HTML page,
both datasets, its JavaScript, stylesheet and maintenance notes are kept
together so every study topic can link to the same source-backed register.

## Maintenance rules

- Add a new period record; never overwrite a historical record.
- Record exact effective dates, jurisdiction, legislative status, source identifiers and verification date.
- Use decimal rates such as 0.20 and pound amounts as numbers such as 12570.
- Store income-related reductions explicitly: record the trigger, reduction rate,
  zero point or minimum floor as applicable, rather than relying only on display text.
- A Personal Savings Allowance tier change is not a gradual taper; keep its
  basic-, higher- and additional-rate amounts separate.
- Treat lowerExclusive and upperInclusive as cumulative taxable-income limits after allowances.
- Verify every material figure against enacted legislation and current official publications.
- Label proposed or draft figures explicitly; do not present them as current enacted rates.
- Review the rendered page at narrow and wide widths after changing the schema or records.
- Keep each tax's jurisdiction and effective-date basis explicit.
- Re-test any calculator before changing it to consume either dataset.

The study-pack tax tables informed the reference-page structure only. They are not authority for the values in this dataset.

## Automated source monitoring

The weekly GitHub Actions workflow checks the normalized visible text of every
registered official source against source-fingerprints.json. It can also be run
manually. A difference or fetch failure opens or updates a review issue; it
never changes the datasets or publishes tax figures.

After a human has verified a genuine or harmless source change, refresh the
baseline with:

    python scripts/check-tax-rate-sources.py --update-baseline

Review the resulting fingerprint diff before committing it.
