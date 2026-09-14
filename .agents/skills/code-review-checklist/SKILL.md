---
name: code-review-checklist
description: Review code changes from supplied diffs, local working-tree changes, or GitHub PRs, validating correctness, React state, edge cases, security, performance, and compatibility against full code context. Use for code review, diff review, logic checks, and bug hunting.
---

# Code Review Checklist

Review changes in two passes: find plausible risks, then validate each risk against the full code context. Report only confirmed, actionable findings.

## Boundaries

- Code review is read-only unless the user separately asks for implementation.
- Do not edit the reviewed code, create review-report files, or run commands that rewrite source files.
- Do not publish PR comments, replies, or review decisions without an explicit request.
- Return the review directly in the response, using the language of the user's request.

## Determine the Review Source

Use the source named by the user. Do not ask them to reproduce a diff that is already available.

- **Supplied diff or diff file:** treat it as the authoritative change set. When the repository is available, use it only to read the full files and related context.
- **Local repository:** inspect status first. Unless the user narrows the scope, include staged changes, unstaged changes, and untracked files. If branch or committed changes are requested, compare the requested branch range as a separate layer.
- **GitHub PR:** use the `github-pr-review` skill to obtain PR metadata, diff, and existing comments, then apply this skill as the analysis core. Preserve that skill's statuses when validating existing comments.

An empty result from one diff layer does not prove there are no local changes; reconcile the review scope with repository status.

## Build Context Before Judging

1. Read the repository's `AGENTS.md` and any instructions that apply to the changed paths.
2. Build an internal change map in dependency order:
   types and helpers → components → modules → widgets → public exports and integration.
3. Read every changed source file in full when it is available, not only its diff hunks. If only the diff is available, state the resulting context limitation.
4. Follow relevant types, callers, callees, consumers, state owners, and public contracts when the finding depends on them.
5. Infer the intended behavior from code, tests, types, and the user's request. Call out a missing requirement as uncertainty, not as a confirmed bug.

For this repository, apply conditional guidance without duplicating it here:

- For SCSS or layout changes, read `plans/styles-rules.md`.
- For localization changes, read `plans/i18n-rules.md`.
- Check the `components → modules → widgets` dependency direction, mandatory unit and level barrel exports, and placement of consumer-facing public types described in `AGENTS.md`.
- Treat documented legacy violations as anti-examples, not patterns to copy.

## Two-Pass Review

### Pass 1: Find Candidate Risks

Look for code whose correctness depends on a non-obvious condition, including:

- inverted, incomplete, unreachable, or off-by-one control flow;
- invalid state transitions, direct mutation, stale closures, stale derived state, or incorrect React effect dependencies and cleanup;
- nullish values, empty collections, Unicode, dates and time zones, size limits, and other realistic boundaries;
- lost errors, incomplete failure paths, async races, interleaving, or cleanup leaks;
- transformations that lose data or rely on an unvalidated shape or invariant;
- broken request/response, component props, or public API contracts;
- unsafe HTML or URLs, leaked secrets, or missing validation at trust boundaries;
- unnecessary work in render or hot paths, retained listeners/resources, or avoidable large allocations;
- breaking exports, incorrect abstraction-level imports, misplaced styles, or incomplete i18n changes.

Do not turn formatting preferences, speculative possibilities, or generic best practices into findings without a concrete failure mode.

### Pass 2: Validate Every Candidate

For each candidate:

1. Re-read the entire containing file and the relevant surrounding flow.
2. Verify the triggering input, state, or execution path is reachable.
3. Check whether types, callers, guards, framework behavior, or tests already preserve the invariant.
4. State the observable consequence and affected consumer.
5. Remove the candidate if the concern is disproved or remains purely speculative.

Run relevant read-only checks when they materially increase confidence. Distinguish confirmed defects from test or verification gaps.

## Severity

- **High:** security exposure, data loss, crash in a primary flow, or an unintended breaking public API change.
- **Medium:** incorrect behavior in a realistic supported scenario, including significant state, error-handling, or integration failures.
- **Low:** a limited edge-case defect or concrete maintainability problem likely to cause incorrect behavior later.

Do not report style-only nits. Order findings from highest to lowest severity.

## Response Format

Lead with confirmed findings. For each finding include:

- **Location:** `path/to/file:line`
- **Severity:** `High`, `Medium`, or `Low`
- **Finding:** concise description of the defect
- **Condition:** input or execution path that triggers it
- **Impact:** observable consequence
- **Recommendation:** specific fix or mitigation

For existing PR comments, also include **Status** using the vocabulary required by `github-pr-review`.

After findings, mention only material test or verification gaps. If there are no confirmed findings, say so explicitly and do not invent issues to fill the response.
