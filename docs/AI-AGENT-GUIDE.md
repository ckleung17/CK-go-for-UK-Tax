# AI agent guide and acceptance criteria

This is the shared reference standard, review checklist, and working protocol for **CK Go for UK Tax**.

## Project baseline

- Purpose: personal UK tax study notes and CPD records, published as an educational static site.
- Stack: HTML, shared CSS, and small browser-side JavaScript; no build system is currently present.
- Scope: an extensible UK tax knowledge site. The current roadmap in `index.html` includes personal tax, property tax, corporation tax, VAT, Inheritance Tax (IHT), Stamp Duty Land Tax (SDLT), and the Foreign Income and Gains (FIG) regime. More areas may be added whenever the user considers them necessary.
- Follow [`docs/TAX-TOPIC-PATHS.md`](TAX-TOPIC-PATHS.md) as the authoritative abbreviation and folder map when adding, moving or linking study-area HTML files.
- Treat `index.html` as the current high-level content map, not as a closed or exhaustive taxonomy. Do not reject, remove, or force new subject areas into an existing category merely because their pages or navigation entries do not yet exist.
- Apply tax-specific jurisdiction rules to every area. For example, SDLT applies to land transactions in England and Northern Ireland; Scotland and Wales have different transaction taxes. Never assume that a UK-wide label means the underlying rule is uniform across all four nations.
- When adding an area, preserve the site's shared architecture, add clear navigation/indexing, define abbreviations, identify its jurisdiction and tax-year coverage, and extend the authoritative-reference list where specialist sources are needed.
- Existing design and navigation are the baseline. Content correction does not authorise redesign; styling work does not authorise changing tax conclusions.

## Authority hierarchy

Use the highest available source that directly supports the proposition:

1. **Enacted legislation:** [legislation.gov.uk](https://www.legislation.gov.uk/), citing the specific section, schedule, or paragraph when material.
2. **Binding judicial decisions:** use the official judgment or reliable official repository; state court and date and preserve the decision's fact-specific scope.
3. **HM Treasury/HMRC official publications:** enacted-measure notes, technical notes, Statements of Practice, Revenue & Customs Briefs, and GOV.UK guidance.
4. **HMRC manuals:** evidence of HMRC interpretation and practice, not law; cite the specific manual reference.
5. **Official rates and operations:** use the relevant service page and [HMRC rates and allowances](https://www.gov.uk/government/collections/rates-and-allowances-hm-revenue-and-customs).
6. **Consultations, policy papers, and draft legislation:** clearly label as proposed or draft.
7. **Professional commentary:** useful for explanation or discovery, but never sole authority for a material proposition.

Starting references:

- [HMRC manuals](https://www.gov.uk/government/collections/hmrc-manuals)
- [Inheritance Tax Manual](https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual)
- [Residence, Domicile and Remittance Basis Manual](https://www.gov.uk/hmrc-internal-manuals/residence-domicile-and-remittance-basis)
- [Stamp Duty Land Tax Manual](https://www.gov.uk/hmrc-internal-manuals/stamp-duty-land-tax-manual)
- [HMRC rates and allowances](https://www.gov.uk/government/collections/rates-and-allowances-hm-revenue-and-customs)
- [GOV.UK accessibility requirements](https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

For substantial revised content, record the proposition, source title and URL, provision/manual reference, publication status, date accessed, and whether it is law, interpretation, proposal, or inference. Deep-link to the page that actually supports the claim.

## Tax-content acceptance criteria

A change passes only when all applicable criteria are satisfied:

- **Scope:** taxpayer, transaction, asset, residence status, and jurisdiction are clear.
- **Time:** tax year, effective date, transition, and enacted/proposed status are clear.
- **Meaning:** statutory terminology is accurate and plain English does not alter it.
- **Authority:** material rules, rates, thresholds, deadlines, and exceptions have current authoritative support.
- **Completeness:** summaries do not hide important conditions, exceptions, elections, claims, interactions, or deadlines.
- **Uncertainty:** treaty, trust, residence, domicile, valuation, anti-avoidance, transitional, disputed, and fact-sensitive matters have suitable caveats.
- **Figures:** calculations state the tax year, assumptions, bands, reliefs, rounding, and reproducible intermediate steps.
- **Examples:** facts are fictional and results are not presented as universal outcomes.
- **Tone:** educational, neutral, and understandable; no promised outcome or personalised advice.
- **Sources:** specific, accessible, and current on the recorded verification date.

Changes affecting liability, filing obligations, time limits, residence, trusts, or relief entitlement require human tax review before publication.

## Technical and editorial acceptance criteria

- Use doctype, `lang`, UTF-8 charset, viewport metadata, a unique title, one logical page heading, and semantic landmarks.
- Use native buttons for actions and links for navigation; all functionality must work by keyboard.
- Provide correct image alternatives, table headers/scope, visible focus, non-colour cues, and WCAG 2.2 AA contrast.
- Use descriptive links. Add `rel="noopener"` to links with `target="_blank"`.
- Check narrow and wide viewports and 200% zoom.
- Prefer existing files under `css/` and `scripts/`; avoid inline CSS, fragile global selectors, and unexplained magic values.
- Keep CSS and JavaScript documentation concise and current: start each file with its purpose and important HTML or file dependencies.
- When a CSS or JavaScript file contains multiple functional groups, include a numbered contents list in the file header and matching numbered section headings. Explain intent, accessibility requirements, coupled values, and non-obvious constraints rather than restating individual lines.
- JavaScript enhancements should fail safely. Add no frameworks, tracking, remote scripts, packages, or build tooling without approval.
- Use British English, define abbreviations, and use exact dates such as “6 April 2025”.
- Preserve UTF-8. Treat mojibake such as `â€”` as a defect, but fix it only within agreed scope.
- Avoid mass formatting and line-ending churn.

## Multi-agent protocol

Before editing, an agent states the task and exact files it owns. If ownership cannot be coordinated, use separate branches or worktrees. Release files only after editing stops and a handoff is supplied. If overlap occurs, stop, preserve both versions, and ask the user how to reconcile them.

- A **research agent** supplies sources and conclusions but does not edit unless authorised.
- A **review agent** reports findings but does not fix them unless authorised.
- An **editing agent** changes only agreed files and does not claim independent review.
- A **committing agent** verifies authorship and scope and never sweeps unrelated changes into a commit.

For material tax work, use separate research/edit and review passes where practical. Reviewers independently verify sources.

### Review severity

- **Critical:** likely materially wrong tax outcome, exposed sensitive data, destructive repository action, or unusable core page.
- **High:** unsupported/outdated material rule, wrong jurisdiction/effective date, broken key navigation, or serious accessibility barrier.
- **Medium:** incomplete caveat, unreproducible example, inconsistent shared behaviour, or notable accessibility/maintenance defect.
- **Low:** local clarity, consistency, or presentation issue without material effect on meaning.

Reports list findings by severity with file/line, consequence, evidence, and recommendation. If none, say so and identify residual testing or tax-review limitations.

## Required verification

Choose proportionate checks and record what actually ran:

1. `git status --short` before and after.
2. `git diff --check` and deliberate review of the complete task diff.
3. HTML structure or validation for changed pages.
4. Internal relative-link and asset checks.
5. Browser inspection at desktop and narrow widths.
6. Keyboard, focus-order, and basic assistive-technology checks for interactions.
7. Independent recalculation of changed examples.
8. Re-open material sources and confirm scope, effective date, and support.
9. Test shared navigation, footer, tabs, and popups after shared CSS/JavaScript changes.

Never claim a check or review was performed when it was not.

## Commit and handoff

Example subjects:

```text
content(iht): clarify long-term residence scope
fix(navigation): correct FIG relative links
style(a11y): improve keyboard focus visibility
docs(agents): define shared review standard
```

Required handoff:

```text
Objective:
Files owned/touched:
Tax years/effective dates:
Sources verified:
Checks run and results:
Known uncertainties or deferred findings:
Human review required:
Commit hash (if any):
```

Work is done only when it matches scope, preserves unrelated work, meets applicable criteria, has a reviewed diff, records sources/checks, and leaves an unambiguous handoff.
