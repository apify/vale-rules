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
  Elastic packages commonly used with these styles. Keep acronyms uppercase:
  `HTMLEntities`, `UIContextTerms`, `VagueCTAs`.
- Use the `.yml` extension, and pick a filename that no other style already uses.
  A duplicate filename shadows one of the rules because all four styles share a
  `StylesPath`.
- Every rule needs `extends`, `level`, and `message`.

Vale does not report unknown override names. A misspelled or outdated name fails
silently in the consumer.

## Severity

Severity describes confidence and impact, not audience:

- `suggestion`: judgment-based guidance that usually needs editorial review.
- `warning`: high-confidence style-guide violation.
- `error`: objective defect, accessibility failure, or prohibited terminology.

Changing a rule's audience requires moving its YAML file. Do not simulate an
audience profile by changing its severity.

## Versioning

- Patch: message, metadata, or regex corrections that do not expand matches.
- Minor: new rules at `suggestion` or `warning`, promotions below `error`,
  removed rules, or backward-compatible package improvements.
- Major: new `error` rules, promotions to `error`, renamed rules, and rules moved
  between styles.

Vale silently ignores overrides for rules that do not exist. Removing a rule only
drops its alerts, but renaming or moving one changes its fully qualified name
(for example, `ApifyUI.VagueErrors`). Existing overrides then stop applying, and
a rule a consumer turned off runs again at its default severity.

## Commits and pull request titles

Commit subjects follow [Conventional Commits](https://www.conventionalcommits.org):
`type: lowercase summary`, optionally scoped to a style, as in
`fix(ApifyUI): stop matching inside code spans`. The types in use are `feat`,
`fix`, `docs`, `chore`, `ci`, and `refactor`.

| Prefix | Release effect |
|---|---|
| `fix:` | Patch if the change does not expand matches; minor if it does; major if it now reports an error. |
| `feat:` | Minor. |
| `feat!:`, `fix!:`, or a `BREAKING CHANGE:` footer | Major. |
| `docs:`, `chore:`, `ci:`, `refactor:` | No release until the next `fix` or `feat`. |

These prefixes let maintainers derive the next version from the commit log. Mark
every major change from the versioning policy as breaking. This includes
promotions to `error` and renamed or moved rules.

Use the same format for pull request titles. When a branch has several commits,
the squash merge uses the title as the commit subject on `main`. Release notes
also use pull request titles. No automated check validates commit subjects or
pull request titles.

## Pull requests

1. Create a branch from `main` and open a pull request.
2. Link an issue or epic, or add the `adhoc` label. The pull request or linked
   issue must also have an estimate.
3. Format the pull request title as a conventional commit.
4. If the branch falls behind, use **Update branch** to merge `main` into the
   pull request branch. Rebase locally if you prefer a linear branch history.
5. Get one approval. Pushing another commit, including an update from `main`,
   dismisses the approval.
6. Squash merge the pull request.

Repository rules prevent direct pushes, force pushes, and deletion of `main`.
They also require a linear history and allow only squash merges. Administrators
cannot bypass these repository rules.

## Validation

Run the repository tests from its root with **Vale 3.24.0 or later** and
Node.js 18 or later. No npm dependencies are required:

```bash
vale --no-global --config=tests/.vale.ini test tests/rules.test.yml
node --test tests/actions.test.mjs
```

The native Vale suite checks exact diagnostic output, including false positives,
alert counts, messages, and locations. Rule cases run in isolation; project cases
run through `tests/.vale.ini` with all four styles enabled. The smaller Node
suite checks replacement actions and the absence of unsafe fixes, which native
output assertions do not expose.

`tests/rules.test.yml` uses JSON syntax, which is valid YAML and can also be read
by Node.js without an additional dependency. Add behavior regressions there and
add case-name references to `tests/actions.json` when replacement metadata needs
verification. Both runners use the input from the native fixture file. An action
case's `name` must match its native case's unique name.

For an isolated case, set `rule` to the rule file's path relative to the test
file. Omit `rule` for a project case that should use `tests/.vale.ini`. Use
`want: ""` to require no diagnostics; otherwise, `want` records the exact
`line:column:Check:message` output.

The 38 cases prefixed `Issue 3:` retain the terminology requirements inventory.
Review expected diagnostics before changing them; do not regenerate expectations
merely to make a failing test pass. The suite covers selected rules and
regressions, not every rule in the package.

Pull request checks validate process, not rule content. The release workflow
packages the tagged files without inspecting the rules.

Validate changes in each affected consumer repository, starting with
`apify-docs`:

1. Build and install the candidate package.
2. Run the consumer's existing local and CI Vale scopes.
3. Review new findings for false positives.
4. Confirm that Vale loads each affected style. Unknown `extends` values and
   invalid regular expressions cause `E201` and a non-zero exit. Vale refuses to
   load the styles instead of skipping the invalid rule.
5. Confirm that rule filenames are unique across all four styles. Duplicate names
   silently shadow a rule in the shared `StylesPath`.

A rule matching its own example is not sufficient validation.

## Release process

Merging a pull request updates `main` but does not publish a package. A release
can contain several pull requests.

To publish a release:

1. Merge the intended pull requests into `main`.
2. Complete the validation checklist above.
3. Choose the next version using the versioning policy above.
4. Tag the accepted commit on `main`, either from the Actions tab or locally.
5. Confirm that the release workflow created the GitHub Release, generated its
   notes, and attached `ApifyStyleGuide.zip`.

Both release routes run `.github/workflows/release.yaml`, and nothing else
publishes. Neither route repeats consumer validation, so validate the candidate
before creating the tag.

### Release from the Actions tab (recommended)

1. Open [Run
   workflow](https://github.com/apify/vale-rules/actions/workflows/release.yaml).
2. Enter a version such as `v1.0.0` and run the workflow from `main`.
3. Confirm that the workflow created the release and attached
   `ApifyStyleGuide.zip`.

The workflow requires a version in `vX.Y.Z` format, rejects an existing tag,
builds the archive, and creates the tag last. It releases the current tip of
`main`. If `main` changed after validation, use a local clone to release the
accepted commit instead.

### Release from a local clone

```bash
git switch main
git pull --ff-only
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

Pass a commit to `git tag` to release something other than the tip. The tag must
start with `v` or the workflow does not run or report an error. This route does
not validate the rest of the version, so check it carefully. For example,
`v1.0.O` would publish.

### Tag immutability

Do not move or delete a release tag. Publish a new version to correct a bad
release. Changing a tag changes the rules returned by an existing pinned URL.
The tag-protection ruleset is still in evaluation mode and does not yet prevent
this.

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
