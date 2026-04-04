# Maintainer Guide

This guide helps maintainers keep repository quality high while supporting beginners.

## What is label automation?

Label automation means GitHub applies issue/PR labels automatically based on rules.

Examples:

- Add `documentation` when files in `docs/` change.
- Add `lab` when files in `labs/` change.
- Add `project` when files in `projects/` change.
- Add `needs-triage` to all new issues.

Why this helps:

- faster triage
- cleaner backlog
- easier filtering for newcomers (for example, `good first issue`)

## Branch protection policy

Enable branch protection for `main` with these settings:

1. Require a pull request before merging.
2. Require at least 1 approving review.
3. Dismiss stale approvals when new commits are pushed.
4. Require status checks to pass before merging.
5. Require branches to be up to date before merging.
6. Include administrators under the same rules.
7. Restrict force pushes and branch deletion.

### Required status checks

Use these required checks from CI:

- `markdown-checks`

If you add new CI jobs in the future, add them to required checks as well.

## Recommended labels

Create and use these labels early:

- `documentation`
- `lab`
- `project`
- `bug`
- `enhancement`
- `good first issue`
- `help wanted`
- `needs-triage`
- `stale`

## Optional label automation workflow (future)

If you want to automate labels later:

- Add `.github/labeler.yml` with path-based rules.
- Add a workflow using `actions/labeler` on pull requests.
- Keep human review for semantic labels like `good first issue`.

## Maintainer operating cadence

Weekly:

1. Review `needs-triage` issues.
2. Convert clear issues into beginner-friendly tasks.
3. Confirm stale items are still relevant.

Per pull request:

1. Confirm beginner readability.
2. Confirm safety guidance is included for AWS steps.
3. Confirm docs and links are still correct.
