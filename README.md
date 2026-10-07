# Apify Vale styles

This repository contains the canonical Vale rules for the Apify writing style
guide. All rules ship in one package. Each team selects the styles it needs in
`.vale.ini`.

## Styles

| Style | Rules | Intended scope |
|---|---:|---|
| `Apify` | 82 | Shared brand, terminology, US English, accessibility, grammar, punctuation, and voice |
| `ApifyDocs` | 12 | Documentation conventions: generated H1s, titled admonitions, heading form, and factual language |
| `ApifyUI` | 81 | Console and product microcopy: controls, errors, dialogs, empty states, notifications, and recovery paths |
| `ApifyContent` | 56 | Blog, marketing, Store, and Actor editorial copy: positioning, claims, feature language, and content structure |

Each rule exists in exactly one style. Team configurations compose the shared
`Apify` style with an audience style, so common rules remain single-sourced.

## Requirements

Use Vale 3.0.0 or later, as declared in each style's `meta.json`. Earlier
versions are not supported.

## Install

1. Add the package and the styles you want to `.vale.ini`:

   ```ini
   StylesPath = .github/styles
   Packages = https://github.com/apify/vale-rules/releases/latest/download/ApifyStyleGuide.zip
   MinAlertLevel = suggestion

   [formats]
   mdx = md

   [*.{md,mdx}]
   BasedOnStyles = Apify, ApifyDocs
   ```

2. Download the package:

   ```bash
   vale sync
   ```

3. Add your `StylesPath` directory, `.github/styles` in this example, to
   `.gitignore`.

`vale sync` installs all four styles in `StylesPath`. `BasedOnStyles` selects
which styles run. Run `vale sync` again after changing the package URL or version,
or to adopt a newer release through `releases/latest`.

`StylesPath` is relative to the `.vale.ini` file, regardless of where you run
Vale. Vale does not fetch packages while linting. If the styles are missing, Vale
exits with `E201`. In CI, run `vale sync` before Vale.

Do not commit downloaded styles. They can drift from the configured release.
Cache `StylesPath` in CI if repeated downloads are a concern.

### Pin a version

The `releases/latest` URL follows every release. Pin a version in CI so a new rule
cannot change the result without a configuration update:

```ini
Packages = https://github.com/apify/vale-rules/releases/download/v1.0.0/ApifyStyleGuide.zip
```

To update, change the version and run `vale sync` again.

### Editors

Install the Vale CLI and the [Vale VS Code
extension](https://marketplace.visualstudio.com/items?itemName=errata-ai.vale-server)
(`errata-ai.vale-server`). After `vale sync`, the extension reads the workspace's
`.vale.ini` without additional configuration.

Use these settings when you want all suggestions while writing or Vale is not on
the extension's `PATH`:

```json
{
  "vale.valeCLI.path": "/opt/homebrew/bin/vale",
  "vale.valeCLI.minAlertLevel": "suggestion"
}
```

Replace `vale.valeCLI.path` with the path to your Vale installation. Remove the
setting if the extension can already find Vale.
`minAlertLevel` defaults to `inherited` and follows `.vale.ini`. Set it to
`suggestion` to show every rule in the editor without changing the level
configured for CI.

The extension's repository is archived and its last release was in 2022, but it
remains the standard Vale integration for VS Code.

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

The action runs `vale sync` and downloads the package by default. To use cached
styles, restore `StylesPath` from the cache and set `sync: false`.

Choose how much of the repository to report with `filter_mode`:

| Value | Reports | Adoption tradeoff |
|---|---|---|
| `added` (default) | Changed lines | Does not expose the existing backlog. |
| `file` | Every finding in a changed file | Reduces the backlog as files change, but can fail on findings the author did not introduce. |
| `nofilter` | The whole repository | Exposes the entire backlog on first adoption. |

Pin the action to `@v3`. The `reviewdog` branch follows ongoing development and
may include unreleased changes.

## Team configurations

### Documentation

```ini
[*.{md,mdx}]
BasedOnStyles = Apify, ApifyDocs
```

### Console and product copy

```ini
[copy/**/*.{md,txt}]
BasedOnStyles = Apify, ApifyUI
```

For JSON, TypeScript, or TSX, use a Vale View or an extraction step to isolate
user-facing strings. Do not map the entire source-code format to Markdown. Vale
would also lint keys and implementation code.

### Blog, marketing, Store, and Actor content

```ini
[*.{md,mdx}]
BasedOnStyles = Apify, ApifyContent
```

### Repositories with several content types

Use path-specific sections when a repository contains several kinds of content:

```ini
[docs/**/*.{md,mdx}]
BasedOnStyles = Apify, ApifyDocs

[copy/**/*.md]
BasedOnStyles = Apify, ApifyUI

[blog/**/*.{md,mdx}]
BasedOnStyles = Apify, ApifyContent
```

## Strictness and overrides

`BasedOnStyles` enables every rule in the selected styles.
`MinAlertLevel` controls the lowest severity Vale reports; it does not select an
audience.

Use `suggestion` in editors to expose all enabled guidance.

| Context | Recommended level |
|---|---|
| Editor | `suggestion` |
| Local command line | `warning` |
| CI | `error` |

```ini
MinAlertLevel = warning

[*.{md,mdx}]
BasedOnStyles = Apify, ApifyDocs

# Repository-specific changes
ApifyDocs.H1 = NO
ApifyDocs.GerundHeading = NO
Apify.ClickHere = error
```

Override individual rules when a repository needs different behavior. Use the
fully qualified rule name: the style directory plus the filename without `.yml`.
For example, `ApifyDocs.GerundHeading` disables the rule, but
`Apify.GerundHeading` does nothing. Vale does not report unknown override names.

## Releases

Merging a pull request does not publish the package. Maintainers publish versioned
releases separately.

Consumers using `releases/latest` receive a release the next time they run
`vale sync`. Consumers pinned to a version must update the package URL.

Maintainers should follow the [versioning policy](./CONTRIBUTING.md#versioning)
and [release process](./CONTRIBUTING.md#release-process).

## Contributing

Before adding or changing a rule, read [CONTRIBUTING.md](./CONTRIBUTING.md). It
covers rule ownership, severity, versioning, validation, and releases.

## License

Licensed under the [Apache License 2.0](./LICENSE). The released archive
includes a copy of the license.
