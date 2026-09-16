import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, test } from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixtures = JSON.parse(readFileSync(new URL('./rules.json', import.meta.url), 'utf8'));
const temporary = mkdtempSync(path.join(tmpdir(), 'vale-rules-test-'));
const config = path.join(temporary, '.vale.ini');
writeFileSync(config, [
  `StylesPath = ${path.join(root, 'styles')}`,
  'MinAlertLevel = suggestion',
  'IgnoredScopes = code, tt, table, tr, td, frontmatter, link, alt, heading',
  '',
  '[*.md]',
  'BasedOnStyles = Apify, ApifyDocs, ApifyUI, ApifyContent',
  '',
].join('\n'));
after(() => rmSync(temporary, { recursive: true, force: true }));

for (const [index, fixture] of fixtures.entries()) {
  test(fixture.name, () => {
    const file = path.join(temporary, `${index}.md`);
    writeFileSync(file, fixture.text);
    const result = spawnSync('vale', ['--no-global', '--config', config, '--output=JSON', file], {
      encoding: 'utf8',
      timeout: 30000,
    });
    assert.ifError(result.error);
    assert.ok([0, 1].includes(result.status), result.stderr || result.stdout);
    const output = JSON.parse(result.stdout);
    assert.ok(Object.values(output).every(Array.isArray), result.stdout);
    const alerts = Object.values(output).flat().filter((alert) => alert.Check === fixture.rule);
    assert.equal(alerts.length, fixture.count, JSON.stringify(alerts, null, 2));
    if (fixture.lines) assert.deepEqual(alerts.map((alert) => alert.Line), fixture.lines);
    if (fixture.replacement) {
      assert.equal(alerts[0].Action.Name, 'replace');
      assert.ok(alerts[0].Action.Params.includes(fixture.replacement), JSON.stringify(alerts[0]));
    }
  });
}
