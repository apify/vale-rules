# Contributing

## Rule ownership

Every rule has one canonical YAML file in one style:

- `styles/Apify/`: applicable across Docs, UI, and Content.
- `styles/ApifyDocs/`: specific to documentation tooling or document structure.
- `styles/ApifyUI/`: specific to interface strings and product interactions.
- `styles/ApifyContent/`: specific to editorial, marketing, Store, or Actor content.

If a rule applies to more than one audience, put it in `Apify` instead of
copying it. Consumers compose styles through `BasedOnStyles`.

## Rule files

A rule's filename is its public name. Vale addresses it as the style directory
plus the filename without the extension, so `styles/ApifyUI/VagueErrors.yml` is
`ApifyUI.VagueErrors` in a consumer's `.vale.ini`. Renaming the file renames the
rule and breaks every override that names it.

- Name files in `PascalCase`, matching the Google, Microsoft, Red Hat, and
  Elastic packages that consumers compose alongside these styles. Keep acronyms
  uppercase: `HTMLEntities`, `UIContextTerms`, `VagueCTAs`.
- Use the `.yml` extension, and pick a filename that no other style already uses.
  The release archive puts all four styles in one `StylesPath`, so a repeated
  name shadows a rule, and nothing checks this for you.
- Every rule needs `extends`, `level`, and `message`.

Vale ignores an override naming a rule it cannot find, and reports nothing, so a
misspelled or outdated rule name fails silently in the consumer rather than
loudly here.

## Severity

Severity describes confidence and impact, not audience:

- `suggestion`: judgment-based guidance that usually needs editorial review.
- `warning`: high-confidence style-guide violation.
- `error`: objective defect, accessibility failure, or prohibited terminology.

Changing a rule's audience requires moving its YAML file. Do not simulate an
audience profile by changing its severity.

## Versioning

- Patch: message, metadata, or regex correction that does not expand matches.
- Minor: new rules at `suggestion` or `warning`, or backward-compatible package improvements.
- Major: new `error` rules, severity promotions, removed/renamed rules, or rules moved between styles.

Moving a rule changes its fully qualified name (for example,
`ApifyUI.VagueErrors`), so consumers may need to update overrides.

## Commits

Commit subjects follow [Conventional Commits](https://www.conventionalcommits.org):
`type: lowercase summary`, optionally scoped to a style, as in
`fix(ApifyUI): stop matching inside code spans`. The types in use are `feat`,
`fix`, `docs`, `chore`, `ci`, and `refactor`.

The type carries the release class from the versioning policy above, so the next
version is read off the log rather than reconstructed from diffs:

- `fix:` — a patch change, as long as it does not expand what a rule matches. A
  correction that catches more than before is minor, or major if it now errors.
- `feat:` — a minor change.
- `feat!:`, `fix!:`, or a `BREAKING CHANGE:` footer — a major change.
- `docs:`, `chore:`, `ci:`, `refactor:` — no release of their own; they ship with
  the next `fix` or `feat`.

Mark everything the Versioning section calls major as breaking, not only new
rules. Promoting a severity or renaming a rule is a one-line edit that still
breaks consumers, and easy to miss at release time.

Nothing enforces this. No check lints commit subjects or pull request titles, so
the log is only as readable as contributors make it.

Pull request titles follow the same format, and carry further than the commits
beneath them. Merges are squashed, so the title becomes the subject on `main`
whenever a branch holds more than one commit. The release workflow also generates
its notes from merged pull requests, so the same title is what consumers read.

## Pull requests

`main` is protected, and administrators are not exempt.

- Branch from `main` and open a pull request. Direct pushes and force pushes to
  `main` are refused, as is deleting it.
- One approval is required, and pushing to the branch dismisses an approval it
  already has.
- An organization ruleset additionally requires Apify's pull request toolkit: a
  pull request must link an issue or epic or carry the `adhoc` label, and either it
  or the linked issue must be estimated.
- `main` keeps a linear history, and squash is the only merge method. Rebase a
  branch that has fallen behind; GitHub offers no merge-commit update.

## Validation

Nothing here lints the rules. The pull request requirements above cover process,
not rule content, and this repository carries no Vale configuration of its own. The
release workflow publishes whatever the tag points at without inspecting the
rules. They are therefore validated in a real consumer, not here.

Build the package, install it in the affected consumer repository, and run that
repository's existing local and CI Vale scopes. Review new findings for false
positives before release; a rule matching its own invented example is not an
acceptance criterion, and there is no synthetic fixture suite.

Two failures are invisible here, and no tool catches either, so check them by eye:

- A rule can be valid YAML and still be invalid to Vale — an unknown `extends`
  value, or a regex that does not compile. Vale answers by refusing to load the
  styles at all, so one bad rule breaks linting everywhere rather than disabling
  itself. In the consumer, this appears as `E201` and a non-zero exit.
- Rule filenames must be unique across all four styles. The release archive puts
  them in a single `StylesPath`, so a name used twice shadows a rule silently.

## Release process

Pull requests and releases are intentionally decoupled. Merging a pull request
updates `main`, but it does not create a tag or publish a package. Multiple pull
requests can be included in one release.

To publish a release:

1. Merge the intended pull requests into `main`.
2. Build the candidate archive and install it in each affected consumer,
   starting with `apify-docs`.
3. Run the consumer's normal local and CI Vale scopes and review new findings
   for false positives.
4. Choose the next version using the versioning policy above.
5. Tag the accepted commit on `main`, either from the Actions tab or locally.
6. Confirm that the release workflow created the GitHub Release, generated its
   notes, and attached `ApifyStyleGuide.zip`.

Both routes run `.github/workflows/release.yaml`, and nothing else publishes.
Neither re-runs consumer acceptance: the tag is treated as approval, so step 3 is
the only thing standing between a bad rule and a release.

### Release from the Actions tab (recommended)

Open [Run
workflow](https://github.com/apify/vale-rules/actions/workflows/release.yaml),
enter a version such as `v1.0.0`, and run it. The workflow refuses to continue
unless the run is on `main`, the version reads `vX.Y.Z`, and the tag does not
already exist. It builds the archive first and tags last, so a failed build
leaves no tag behind.

This route releases the current tip of `main`, not the commit you accepted in
step 3. Confirm nothing has landed since, or release from a clone and name the
commit.

### Release from a local clone

```bash
git switch main
git pull --ff-only
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

Pass a commit to `git tag` to release something other than the tip. A tag must
begin with `v` or the workflow ignores it entirely, with no run and no error, and
nothing validates the rest of the name — `v1.0.O` publishes a release under a
nonsense version.

### Tag immutability

Treat a pushed release tag as immutable, and fix a bad release forward under a new
version. Moving or deleting one changes what a version means after consumers have
already resolved it: a repository pinned to `v1.0.0` would get different rules from
the same URL, breaking the guarantee pinning exists to provide. Nothing blocks this
yet — the tag ruleset that will is still in evaluate mode.

## Release layout

The release workflow creates one `ApifyStyleGuide.zip` archive:

```text
ApifyStyleGuide/
├── LICENSE
└── styles/
    ├── Apify/
    ├── ApifyDocs/
    ├── ApifyUI/
    └── ApifyContent/
```

Consumers download the archive once with `vale sync`, then select styles in
their local `.vale.ini`.
