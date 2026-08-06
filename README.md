# Apify Vale styles

Canonical Vale rules for the Apify writing style guide. The package keeps every
rule in one repository and distributes them together, while each team selects
the styles it needs in its own `.vale.ini`.

## Styles

| Style | Rules | Intended scope |
|---|---:|---|
| `Apify` | 69 | Shared brand, terminology, US English, accessibility, grammar, punctuation, and voice |
| `ApifyDocs` | 4 | Documentation conventions: generated H1s, titled admonitions, heading form, and factual language |
| `ApifyUI` | 66 | Console and product microcopy: controls, errors, dialogs, empty states, notifications, and recovery paths |
| `ApifyContent` | 45 | Blog, marketing, Store, and Actor editorial copy: positioning, claims, feature language, and content structure |

Each rule exists in exactly one style. Team configurations compose the shared
`Apify` style with an audience style, so common rules remain single-sourced.

## Requirements

Vale 2.0.0 or later, as declared in each style's `meta.json`. The styles are
developed against Vale 3.x.

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

Linting never fetches a package on its own. Until `vale sync` has run, Vale exits
with `E201` because the named styles are not present, so run `vale sync` as a
step before Vale in CI.

Add your `StylesPath` directory to your repository's `.gitignore` rather than
committing the styles Vale downloads into it. Committing them creates a private
copy of the rules in every consumer, which is
what this package exists to avoid: the copies drift, and the release tag stops
describing what a repository actually enforces. Pin a tag for reproducibility
instead, and cache `StylesPath` in CI if the download is worth avoiding.
[`vale-action`](https://github.com/vale-cli/vale-action) runs `vale sync` by
default and documents cache restoration as the way to skip it.

Installing the package makes all four styles available; `BasedOnStyles` decides
which of them actually run. A repository that installs the package still lints
only against the styles it names.

`StylesPath` resolves relative to the `.vale.ini` that declares it, not to the
directory you invoke Vale from.

### Pin a version

The `releases/latest` URL follows every new release, so rules can change under a
repository without any local edit. To control when that happens, point at a tag:

```ini
Packages = https://github.com/apify/vale-rules/releases/download/v1.0.0/ApifyStyleGuide.zip
```

Pinning is the better default for CI, where an unannounced new rule can turn a
green build red. Bump the tag deliberately and re-run `vale sync`.

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
across as many pull requests as a release needs, and consumers see nothing until
a tag is pushed.

Publication is triggered by the tag alone. Pushing a tag whose name begins with
`v` runs `.github/workflows/release.yaml`, which copies the four style
directories and `LICENSE` into `ApifyStyleGuide.zip`, creates the GitHub Release,
and attaches the archive with generated release notes:

```bash
git switch main
git pull --ff-only
git tag -a v1.0.0 -m "v1.0.0"
git push origin v1.0.0
```

Nothing else publishes, and no other branch or event does. The workflow treats
the tag as approval: it does not re-run consumer validation, so a tag should only
be pushed against a commit already accepted in a consumer repository.

Version numbers follow the [versioning
policy](./CONTRIBUTING.md#versioning) — in short, new `error` rules, severity
promotions, and renamed or moved rules are breaking, because they can fail a
build or invalidate an existing override.

Consumers on `releases/latest` pick a release up on their next `vale sync`.
Consumers pinned to a tag are unaffected until they bump it.

### Validation before a release

This repository runs no automated checks. The only workflow is the release, and
it publishes whatever the tag points at. Nothing verifies that a rule is valid
before it ships, so validation is entirely a human step.

Validate in a real consumer: build the archive, install it there, run that
repository's normal local and CI Vale scopes, and review new findings for false
positives. `apify-docs` is the initial acceptance consumer. See the [release
process](./CONTRIBUTING.md#release-process) for the full checklist.

Weigh that step accordingly. A rule can be valid YAML and still be invalid to
Vale, and Vale responds by refusing to load the styles at all rather than skipping
the rule, so a single bad regex breaks linting for every consumer of the release.
The consumer run is where that surfaces.

## Contributing

Rules live in exactly one style, and a rule's filename is part of its public name,
so renaming one is a breaking change for anyone overriding it. Read
[CONTRIBUTING.md](./CONTRIBUTING.md) before adding or moving a rule; it covers
rule ownership, severity, versioning, validation, and the release checklist.

## License

Licensed under the [Apache License 2.0](./LICENSE). The released archive
includes a copy of the license.
