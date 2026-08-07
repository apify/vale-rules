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

## Validation

There is no CI, and this repository carries no Vale configuration of its own. The
only workflow is the release, and it publishes whatever the tag points at without
inspecting it. Rules are therefore validated in a real consumer, not here.

Build the package, install it in the affected consumer repository, and run that
repository's existing local and CI Vale scopes. Review new findings for false
positives before release; a rule matching its own invented example is not an
acceptance criterion, and there is no synthetic fixture suite.

Two failures are invisible until that point, so check them by eye:

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
5. Tag the accepted commit on `main` and push the tag:

   ```bash
   git switch main
   git pull --ff-only
   git tag -a v1.0.0 -m "v1.0.0"
   git push origin v1.0.0
   ```

6. Confirm that the release workflow created the GitHub Release, generated its
   notes, and attached `ApifyStyleGuide.zip`.

Only a pushed tag whose name begins with `v` triggers
`.github/workflows/release.yaml`. The release workflow trusts the tag as approval
to publish; it does not repeat consumer acceptance.

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
