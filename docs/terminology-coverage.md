# Terminology coverage

The 38 probes in [tests/terminology.json](../tests/terminology.json) track the requirements reported in [issue #3](https://github.com/apify/vale-rules/issues/3). Each must produce the named rule and the intended correction, not merely an unrelated alert. Run `node --test tests/rules.test.mjs` to execute these probes and the valid-text regressions.

## Coverage and review boundaries

- Generic casing is checked in prose contexts. Sentence starts, headings, interface labels, code, and official product names need different treatment; the regression suite preserves those exceptions.
- Actor-name article checks recognize selected name patterns and RAG Web Browser. They do not provide a complete directory of every Actor name.
- Acronym first use tracks a recognizable expansion in parentheses before the first prose use, including across paragraphs. It cannot verify that an expansion is factually correct. Definitions in headings, bold text, and Markdown links count; a soft line break may separate the expansion from its acronym. Readable Markdown and HTML link text follow the same first-use policy. Common technical abbreviations, code, heading uses, and bold-label uses are exempt.
- Feature lifecycle is an evidence-based review requirement. `FeatureStatus` corrects documented Actor-scoped resurrect-run endpoint terminology; `FeatureStatusConsistency` flags conflicting removal language. Neither assigns a lifecycle status to an unknown feature. Consult official product, API, or SDK documentation before making that decision.

The lifecycle probe below demonstrates the documented case only. Passing all 38 probes does not establish automatic classification of every feature or complete recognition of every product name.

## Official lifecycle evidence

The [Actor-scoped resurrect-run reference](https://docs.apify.com/api/v2/actor-run-resurrect-post) labels that endpoint deprecated and points to the `actor-runs` namespace. Reviewed on 2026-10-08. Legacy or alternative implementations are not automatically deprecated; unsupported cases remain unchanged.

## Requirement map

| Requirement | Check | Coverage |
|---|---|---|
| product casing proxy | `Apify.ApifyProductNames` | Automated probe |
| product casing console | `Apify.ApifyProductNames` | Automated probe |
| product casing store | `Apify.ApifyProductNames` | Automated probe |
| product casing sdk | `Apify.ApifyProductNames` | Automated probe |
| product casing cli | `Apify.ApifyProductNames` | Automated probe |
| product casing api | `Apify.ApifyProductNames` | Automated probe |
| Actor casing | `Apify.ActorCapitalization` | Automated probe |
| drop article Console | `Apify.ApifyProductNames` | Automated probe |
| drop article Store | `Apify.ApifyProductNames` | Automated probe |
| drop article Proxy | `Apify.ApifyProductNames` | Automated probe |
| add article SDK | `Apify.ProductArticles` | Automated probe |
| add article CLI | `Apify.ProductArticles` | Automated probe |
| add article API | `Apify.ProductArticles` | Automated probe |
| add article platform | `Apify.ProductArticles` | Automated probe |
| descriptor casing Platform | `Apify.ApifyProductNames` | Automated probe |
| descriptor casing Team | `Apify.ApifyProductNames` | Automated probe |
| descriptor casing Ecosystem | `Apify.ApifyProductNames` | Automated probe |
| feature casing Task | `Apify.TaskCapitalization` | Automated probe |
| feature casing Schedule | `Apify.TaskCapitalization` | Automated probe |
| feature casing Run | `Apify.GenericTechnicalTerms` | Automated probe |
| feature casing Build | `Apify.GenericTechnicalTerms` | Automated probe |
| feature casing Dataset | `Apify.GenericTechnicalTerms` | Automated probe |
| feature casing Key-Value Store | `Apify.GenericTechnicalTerms` | Automated probe |
| feature casing Request Queue | `Apify.GenericTechnicalTerms` | Automated probe |
| feature casing Web Scraping | `Apify.GenericTechnicalTerms` | Automated probe |
| generic casing AI Agent | `Apify.GenericTechnicalTerms` | Automated probe |
| generic casing MCP Server | `Apify.GenericTechnicalTerms` | Automated probe |
| generic casing API Endpoint | `Apify.GenericTechnicalTerms` | Automated probe |
| generic casing Web Scraper | `Apify.GenericTechnicalTerms` | Automated probe |
| generic casing Proxy Server | `Apify.GenericTechnicalTerms` | Automated probe |
| MCP connectors | `Apify.GenericTechnicalTerms` | Automated probe |
| Actor name article | `Apify.ActorNameArticle` | Automated probe |
| version version 22 | `Apify.VersionAbbreviation` | Automated probe |
| version version 3.0 | `Apify.VersionAbbreviation` | Automated probe |
| generic casing Crawler | `Apify.GenericTechnicalTerms` | Automated probe |
| generic casing Scraper | `Apify.GenericTechnicalTerms` | Automated probe |
| legacy vs alternative vs deprecated | `Apify.FeatureStatus` | Documented cases; other statuses require review |
| acronym first use | `Apify.AcronymFirstUse` | Automated probe |
