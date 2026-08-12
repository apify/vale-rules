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
- Minor: new rules at `suggestion` or `warning`, or backward-compatible package
  improvements.
- Major: new `error` rules, severity promotions, removed or renamed rules, and
  rules moved between styles.

Moving a rule changes its fully qualified name (for example,
`ApifyUI.VagueErrors`), so consumers may need to update overrides.

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
every major change from the versioning policy as breaking. This includes severity
promotions and renamed or moved rules.

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

This repository has no Vale configuration or synthetic fixture suite. Pull
request checks validate process, not rule content. The release workflow packages
the tagged files without inspecting the rules.

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
