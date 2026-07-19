# UK tax topic path map

This file is the authoritative folder and abbreviation map for study-area HTML files. Human contributors and AI agents must follow it when adding, moving or linking tax content.

## Rules

- Use uppercase folder codes containing three to seven letters.
- Place every substantive HTML page under the most specific applicable leaf folder.
- Keep HTML filenames descriptive and in lower-case kebab-case; the short codes organise folders, not page titles.
- Keep study note-specific popups and worked examples with their study note unless they become shared resources.
- Do not link to reserved folders until a landing page exists. On the homepage, mark them as `planned` instead.
- When a path changes, update the homepage, index pages, previous/next navigation, popups, scripts, documentation and every cross-topic reference in the same change.
- Validate all local `href` and `src` targets after path changes.

## Folder map

| Main area | Path | Subtopic | Leaf path | Status |
|---|---|---|---|---|
| Personal Tax | `PTAX/` | Income Tax | `PTAX/ITAX/` | Published |
| Personal Tax | `PTAX/` | Capital Gains Tax | `PTAX/CGT/` | Published |
| Personal Tax | `PTAX/` | Employment and PAYE | `PTAX/PAYE/` | Published |
| Personal Tax | `PTAX/` | National Insurance | `PTAX/NIC/` | Published |
| Personal Tax | `PTAX/` | Pensions Tax | `PTAX/PENTAX/` | Published |
| Property and Land Tax | `PLTAX/` | Property Income | `PLTAX/PROPINC/` | Reserved |
| Property and Land Tax | `PLTAX/` | Property Capital Gains | `PLTAX/PROPCGT/` | Reserved |
| Property and Land Tax | `PLTAX/` | Annual Tax on Enveloped Dwellings | `PLTAX/ATED/` | Reserved |
| Property and Land Tax | `PLTAX/` | High Value Council Tax Surcharge | `PLTAX/HVCTS/` | Reserved; planned for England from April 2028, subject to final design and legislation |
| Property and Land Tax | `PLTAX/` | Council Tax and Business Rates | `PLTAX/CTBR/` | Reserved |
| Business Tax | `BTAX/` | Corporation Tax | `BTAX/CTAX/` | Reserved |
| Business Tax | `BTAX/` | Business Income and Partnerships | `BTAX/BIZPAR/` | Reserved |
| Business Tax | `BTAX/` | Capital Allowances | `BTAX/CAPALL/` | Reserved |
| Business Tax | `BTAX/` | Employer Taxes | `BTAX/EMPTAX/` | Reserved |
| Value Added Tax | `VAT/` | — | `VAT/` | Reserved |
| Inheritance Tax and Estates | `IHT/` | — | `IHT/` | Reserved |
| Stamp and Transaction Taxes | `STTAX/` | Stamp Duty Land Tax | `STTAX/SDLT/` | Published; England and Northern Ireland |
| Stamp and Transaction Taxes | `STTAX/` | Land and Buildings Transaction Tax | `STTAX/LBTT/` | Reserved; Scotland |
| Stamp and Transaction Taxes | `STTAX/` | Land Transaction Tax | `STTAX/LTT/` | Reserved; Wales |
| Stamp and Transaction Taxes | `STTAX/` | Stamp Duty on Stocks and Shares | `STTAX/SDSS/` | Reserved |
| Stamp and Transaction Taxes | `STTAX/` | Stamp Duty Reserve Tax | `STTAX/SDRT/` | Reserved |
| International Tax | `INTAX/` | Foreign Income and Gains | `INTAX/FIG/` | Published |
| International Tax | `INTAX/` | Double Taxation Agreements | `INTAX/DTA/` | Reserved for a general treaty study note; FIG-specific treaty material remains in `INTAX/FIG/` |
| International Tax | `INTAX/` | Residence and International Mobility | `INTAX/RESMOB/` | Reserved |
| Trusts | `TRUST/` | — | `TRUST/` | Published |
| Tax Administration and Compliance | `TAXADM/` | Returns, Claims and Elections | `TAXADM/RCE/` | Reserved |
| Tax Administration and Compliance | `TAXADM/` | Payments, Enquiries and Records | `TAXADM/PER/` | Reserved |
| Tax Administration and Compliance | `TAXADM/` | Penalties, Appeals and Disputes | `TAXADM/PAD/` | Reserved |

## Published entry pages


- Income Tax: `PTAX/ITAX/itax-index.html`
- Capital Gains Tax: `PTAX/CGT/cgt-index.html`
- Employment and PAYE: `PTAX/PAYE/paye-index.html`
- National Insurance: `PTAX/NIC/nic-index.html`
- Pensions Tax: `PTAX/PENTAX/pentax-index.html`

- SDLT: `STTAX/SDLT/sdlt-index.html`
- FIG: `INTAX/FIG/fig-index.html`
- Trusts: `TRUST/Trust-index.html`

The existing entry filenames are retained to avoid unnecessary filename churn. New study note entry pages should use the lower-case form `<code>-index.html`.

## Relative-link depth

- A root page links to SDLT as `STTAX/SDLT/sdlt-index.html`.
- A page in `STTAX/SDLT/` or `INTAX/FIG/` reaches root assets with `../../`, for example `../../style.css` and `../../scripts/layout.js`.
- A page in `TRUST/` reaches root assets with `../`.
- Links between pages in the same leaf folder should use filenames only.
- Prefer relative links that work when the site is hosted below a domain subpath; avoid new site-root paths beginning with `/`.

## Global references

- Shared cross-topic reference pages belong under reference/, outside any
  single study-area folder.
- The global UK tax-rate reference is reference/tax-rates/index.html; its
  page-specific datasets, script, stylesheet and maintenance notes are kept
  beside it.
- Topic pages should link to the global reference instead of creating a second
  copy of the same rate register.

## Migration history

- `SDLT/` moved to `STTAX/SDLT/`.
- `FIG/` moved to `INTAX/FIG/`.
- `Trust/` moved to `TRUST/`.
