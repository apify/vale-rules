import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, test } from 'node:test';

const executable = process.env.VALE_BIN || 'vale';
const root = fileURLToPath(new URL('../', import.meta.url));
// Native `vale test` owns diagnostic behavior; these cases inspect action metadata.
const fixtures = JSON.parse(readFileSync(new URL('./actions.json', import.meta.url), 'utf8'));
const temporary = mkdtempSync(path.join(tmpdir(), 'vale-rules-test-'));
const nativeCases = JSON.parse(readFileSync(new URL('./rules.test.yml', import.meta.url), 'utf8'));
assert.equal(nativeCases.filter(({name}) => name.startsWith('Issue 3:')).length, 38,
  'retain every requirement from issue #3');
const casesByName = new Map(nativeCases.map(fixture => [fixture.name, fixture]));
assert.equal(casesByName.size, nativeCases.length, 'native case names must be unique');
const config = path.join(root, 'tests', '.vale.ini');
after(() => rmSync(temporary, { recursive: true, force: true }));

for (const [index, fixture] of fixtures.entries()) {
  test(fixture.name, () => {
    const file = path.join(temporary, `${index}.${casesByName.get(fixture.name)?.format || 'md'}`);
    assert.ok(casesByName.has(fixture.name), `missing native case: ${fixture.name}`);
    writeFileSync(file, casesByName.get(fixture.name).input);
    const result = spawnSync(executable, ['--no-global', '--config', config, '--output=JSON', file], {
      encoding: 'utf8',
      timeout: 30000,
    });
    assert.ifError(result.error);
    assert.ok([0, 1].includes(result.status), result.stderr || result.stdout);
    const output = JSON.parse(result.stdout);
    assert.ok(Object.values(output).every(Array.isArray), result.stdout);
    const alerts = Object.values(output).flat().filter((alert) => alert.Check === fixture.rule);
    assert.equal(alerts.length, fixture.count, JSON.stringify(alerts, null, 2));
    if (fixture.noReplacement) {
      assert.ok(alerts.every(alert => !alert.Action?.Name && !alert.Suggestions?.length), JSON.stringify(alerts));
    }
    if (fixture.replacement) {
      assert.equal(alerts[0].Action.Name, 'replace');
      assert.ok(alerts[0].Action.Params.includes(fixture.replacement), JSON.stringify(alerts[0]));
      if (fixture.fixed) {
        // Vale columns count characters; apply from the end to preserve offsets.
        const lines = casesByName.get(fixture.name).input.split('\n');
        for (const alert of [...alerts].sort((a, b) => b.Line - a.Line || b.Span[0] - a.Span[0])) {
          assert.ok(alert.Action.Params.includes(fixture.replacement));
          const characters = Array.from(lines[alert.Line - 1]);
          characters.splice(alert.Span[0] - 1, alert.Span[1] - alert.Span[0] + 1,
            ...Array.from(fixture.replacement));
          lines[alert.Line - 1] = characters.join('');
        }
        assert.equal(lines.join('\n'), fixture.fixed);
        writeFileSync(file, fixture.fixed);
        const corrected = spawnSync(executable, ['--no-global', '--config', config, '--output=JSON', file], {
          encoding: 'utf8', timeout: 30000,
        });
        assert.ifError(corrected.error);
        assert.ok([0, 1].includes(corrected.status), corrected.stderr || corrected.stdout);
        const correctedOutput = JSON.parse(corrected.stdout);
        assert.ok(Object.values(correctedOutput).every(Array.isArray));
        assert.ok(Object.values(correctedOutput).flat().every(a => a.Check !== fixture.rule),
          corrected.stdout);
      }
    }
  });
}
