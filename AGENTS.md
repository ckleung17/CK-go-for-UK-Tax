# Instructions for all AI agents

These rules apply to every AI assistant, reviewer, and automation tool working in this repository. Read them before reviewing, editing, staging, or committing. Detailed criteria and references are in [`docs/AI-AGENT-GUIDE.md`](docs/AI-AGENT-GUIDE.md).

## Priorities

This is a static website of personal UK tax learning notes and CPD material. Apply these priorities in order:

1. Tax accuracy, scope, effective dates, and traceable sources.
2. Preservation of user work and repository integrity.
3. Clear, accessible education that does not imply personalised advice.
4. Consistent site behaviour and presentation.
5. Small, reviewable changes.

## Mandatory preflight

- Run `git status --short`; inspect the diff of every tracked target and identify relevant untracked files.
- Treat existing changes as user-owned. Never overwrite, revert, stage, stash, reformat, or commit them unless explicitly included in the task.
- Establish ownership before editing. Agents may read the same file concurrently but must not edit the same file concurrently.
- Before large or multi-file work, report the starting state and recommend a checkpoint when substantial uncommitted work exists. Create no checkpoint commit without explicit approval.

## Tax-content rules

- Verify substantive claims against current primary or official sources using the guide's hierarchy; do not rely on memory.
- State the jurisdiction and tax year or effective date for rules, rates, thresholds, deadlines, and transitional provisions.
- Distinguish legislation, HMRC interpretation, proposals, and agent inference. HMRC manuals are guidance, not law.
- Use secondary sources only to locate or explain primary material, never as sole authority for a material claim.
- Deep-link material claims to the most specific authority. For substantial changes, record source title, URL, provision/manual reference, status, and verification date.
- Never invent citations, section numbers, cases, rates, examples, or source wording.
- Label examples as illustrative, state assumptions, show reproducible workings, and do not present them as advice.
- Flag unclear, conflicting, proposed, fact-sensitive, or not-yet-effective matters for human review.
- Do not claim the site provides legal, tax, financial, or investment advice.

## Content strategy and explanatory structure

Apply this framework automatically whenever drafting or substantially revising site content on any topic. If an older content or explanatory rule conflicts with this section, this section controls; continue to apply all compatible accuracy, sourcing, accessibility, privacy, and repository-integrity requirements:

- **Concept before calculation:** explain why the concept or rule exists and its practical effect before introducing formulas, calculations, or detailed mechanics.
- **Progressive technicality:** begin in plain English without avoiding necessary technical language. Define each technical term inline, in accessible language, on its first occurrence on the page. Also follow the shared-glossary requirement in the detailed guide where the term is unfamiliar.
- **Concrete step-by-step examples:** accompany each abstract concept with at least one illustrative numerical or scenario-based walkthrough that states its assumptions and shows the inputs, intermediate steps, and outcome. Examples must remain fictional, reproducible, and consistent with the tax-content rules above.
- **Clear caveats and edge cases:** present material exceptions, warnings, prerequisite conditions, uncertainties, and fact-sensitive limitations in dedicated callout blocks or clearly labelled note sections.

Manage the content logic, clarity, and heading hierarchy within each page. Leave site-wide scaffolding, including headers, navigation, footers, and shared scripts, to the primary layout templates unless the task explicitly includes a template change.

## Editing and verification

- Keep the static HTML/CSS/JavaScript architecture unless the task explicitly authorises a change.
- Reuse shared CSS and scripts. Avoid inline styles, duplication, unnecessary dependencies, and unrelated cleanup.
- Target semantic HTML and WCAG 2.2 AA: keyboard operation, visible focus, contrast, meaningful links, and responsive layouts.
- For very large tables, especially on mobile, modestly reduce the font size, preserve readable column widths in a keyboard-accessible horizontal scroll region, and keep the header row and leading identifying column sticky.
- Preserve UTF-8; do not introduce or silently mass-fix encoding or line-ending changes.
- Keep relative links correct. External links using `target="_blank"` must include `rel="noopener"`.
- Never expose secrets, personal data, credentials, or client facts; use fictional or anonymised examples.
- Review the final diff for unintended edits, unsupported tax claims, broken links, encoding damage, and sensitive data.
- Run proportionate checks from the guide and report only checks actually performed.
- Review-only tasks produce severity-ordered findings with file and line references; do not edit unless authorised.

## Git and handoff

- Do not stage or commit unless explicitly asked. Confirm commit scope and exclude user-owned or other-agent changes.
- Keep commits single-purpose. Prefer `type(scope): imperative summary`, using `content`, `fix`, `feat`, `style`, `refactor`, `docs`, `test`, or `chore`.
- Never amend, rebase, force-push, reset, or discard changes without explicit approval.
- Hand off the objective, files touched, sources checked, tests run, open issues, human decisions, and commit hash if applicable.

## Agent roles and tools

- GitHub Copilot is intended for user-directed inline completions and quick edits. Codex and other agents may handle broader implementation, debugging, review, and multi-file work.
- Prefer workspace-recommended extensions. Do not change global extensions without explicit approval.
