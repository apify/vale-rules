# Apify Vale styles

Canonical Vale rules for the Apify writing style guide. The package keeps every
rule in one repository and distributes them together, while each team selects
the styles it needs in its own `.vale.ini`.

## Styles

| Style | Rules | Intended scope |
|---|---:|---|
| `Apify` | 68 | Shared brand, terminology, US English, accessibility, grammar, punctuation, and voice |
| `ApifyDocs` | 4 | Documentation conventions: generated H1s, titled admonitions, heading form, and factual language |
| `ApifyUI` | 66 | Console and product microcopy: controls, errors, dialogs, empty states, notifications, and recovery paths |
| `ApifyContent` | 46 | Blog, marketing, Store, and Actor editorial copy: positioning, claims, feature language, and content structure |

Each rule exists in exactly one style. Team configurations compose the shared
`Apify` style with an audience style, so common rules remain single-sourced.

## Requirements

Vale 3.0.0 or later, as declared in each style's `meta.json`. Earlier versions
are not supported.

## Install

Add the package to your own `.vale.ini`, name the styles you want, then download
the archive:

```ini
StylesPath = .github/styles
Packages = https://github.com/apify/vale-rules/releases/latest/download/ApifyStyleGuide.zip
MinAlertLevel = suggestion

[formats]
mdx = md

[*.{md,mdx}]
BasedOnStyles = Apify, ApifyDocs
```

```bash
vale sync
```

`vale sync` downloads the archive and unpacks the four style directories into
`StylesPath`. Run it once after adding the package, and again whenever you change
the `Packages` URL or want to adopt a newer release.

Linting never fetches packages. Until `vale sync` has run, Vale exits with `E201`
because the named styles are missing, so run it as a CI step before Vale.

Add your `StylesPath` directory to your repository's `.gitignore` rather than
committing the styles Vale downloads into it. Committed copies drift from the
release, one per consumer, and the tag stops describing what a repository
actually enforces. Pin a tag for reproducibility instead, and cache `StylesPath`
in CI if the download is worth avoiding.

Installing the package makes all four styles available; `BasedOnStyles` decides
which of them run.

`StylesPath` resolves relative to the `.vale.ini` that declares it, not to the
directory you invoke Vale from.

### Pin a version

The `releases/latest` URL follows every new release, so rules can change under a
repository with no local edit. Point at a tag instead:

```ini
Packages = https://github.com/apify/vale-rules/releases/download/v1.0.0/ApifyStyleGuide.zip
```

Pinning is the better default for CI, where an unannounced new rule can turn a
green build red. Bump the tag deliberately and re-run `vale sync`.

### Editors

Install the Vale CLI and the [Vale VS Code
extension](https://marketplace.visualstudio.com/items?itemName=errata-ai.vale-server)
(`errata-ai.vale-server`). The extension reads the `.vale.ini` in the workspace,
so it needs no configuration once `vale sync` has run. Its repository is archived
and it last shipped in 2022, but it remains the standard editor integration.

Two settings are worth knowing:

```json
{
  "vale.valeCLI.path": "/opt/homebrew/bin/vale",
  "vale.valeCLI.minAlertLevel": "suggestion"
}
```

Set `vale.valeCLI.path` only when Vale is not on the extension's `PATH`.
`minAlertLevel` defaults to `inherited`, which follows `.vale.ini`; setting it to
`suggestion` surfaces every rule while writing without loosening the level CI
enforces.

### Continuous integration

[`vale-action`](https://github.com/vale-cli/vale-action) installs Vale, runs
`vale sync`, and reports findings as pull request annotations:

```yaml
name: Vale
on: [pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: vale-cli/vale-action@v3
        with:
          fail_on_error: true
          min_alert_level: error
```

`sync` defaults to `true`, so the package downloads on every run. To skip it,
restore `StylesPath` from a cache and set `sync: false`.

`filter_mode` defaults to `added`, which reports only on lines the pull request
changed. Use `file` to report every finding in a file the pull request touches,
which retires existing violations faster but can fail a build on findings the
author did not introduce. `nofilter` applies no filtering at all and reports the
whole repository, so a first adoption surfaces the entire existing backlog.

Pin the action to `@v3`. The `reviewdog` branch tracks whatever lands there next.

## Team configurations

Documentation:

```ini
[*.{md,mdx}]
BasedOnStyles = Apify, ApifyDocs
```

Console and product copy:

```ini
[copy/**/*.{md,txt}]
BasedOnStyles = Apify, ApifyUI
```

Vale needs a View or an extraction step to lint only user-facing strings inside
JSON, TypeScript, or TSX. Do not map a whole source-code format to Markdown,
because that also lints keys and implementation code.

Blog, marketing, Store, and Actor content:

```ini
[*.{md,mdx}]
BasedOnStyles = Apify, ApifyContent
```

A repository containing more than one kind of copy can use path-specific
sections:

```ini
[docs/**/*.{md,mdx}]
BasedOnStyles = Apify, ApifyDocs

[copy/**/*.md]
BasedOnStyles = Apify, ApifyUI

[blog/**/*.{md,mdx}]
BasedOnStyles = Apify, ApifyContent
```

## Strictness and overrides

`BasedOnStyles` enables every rule in the selected styles. `MinAlertLevel`
controls the lowest severity Vale reports; it does not select an audience.

```ini
MinAlertLevel = warning

[*.{md,mdx}]
BasedOnStyles = Apify, ApifyDocs

# Repository-specific changes
ApifyDocs.H1 = NO
ApifyDocs.GerundHeading = NO
Apify.ClickHere = error
```

Use `suggestion` in editors to expose all guidance. Teams can use `warning` or
`error` for a quieter command-line run and override individual rules as their
adoption matures.

An override must name the style that owns the rule. Vale ignores an override that
names a rule it cannot find, without reporting anything, so `Apify.GerundHeading`
silently does nothing while `ApifyDocs.GerundHeading` disables the rule. The
styles table above lists which style owns what; a rule's fully qualified name is
its style directory plus its filename without the `.yml`.

## Releases

Merging a pull request does not publish anything. Changes accumulate on `main`
until a maintainer cuts a release, which is the only thing that builds and
publishes `ApifyStyleGuide.zip`.

Consumers on `releases/latest` pick a release up on their next `vale sync`.
Consumers pinned to a tag are unaffected until they bump it.

Version numbers follow the [versioning
policy](./CONTRIBUTING.md#versioning) — in short, new `error` rules, severity
promotions, and renamed or moved rules are breaking, because they can fail a
build or invalidate an existing override.

Nothing here lints the rules, so every release is validated by hand in a real
consumer before the tag is pushed; `apify-docs` is the initial acceptance
consumer. See the [release process](./CONTRIBUTING.md#release-process)
for the checklist and the tagging commands.

## Contributing

Rules live in exactly one style, and a rule's filename is part of its public name,
so renaming one is a breaking change for anyone overriding it. Read
[CONTRIBUTING.md](./CONTRIBUTING.md) before adding or moving a rule; it covers
rule ownership, severity, versioning, commit format, validation, and the release
checklist.

## License

Licensed under the [Apache License 2.0](./LICENSE). The released archive
includes a copy of the license.
