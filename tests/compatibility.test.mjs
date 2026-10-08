import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// Older supported CLIs cannot run `vale test`. Batch the same documents through
// their normal lint command, then compare the native fixtures' expectations.
const root = fileURLToPath(new URL('../', import.meta.url));
const executable = process.env.VALE_BIN || 'vale';
for (const directory of ['tests', ...['docs', 'ui', 'content'].map(a => `tests/audiences/${a}`)]) {
  test(`consumer compatibility: ${directory}`, async t => {
    const fixture = directory === 'tests' ? 'rules.test.yml' : 'scope.test.yml';
    const cases = JSON.parse(readFileSync(path.join(root, directory, fixture), 'utf8'));
    const temporary = mkdtempSync(path.join(tmpdir(), 'vale-compatibility-'));
    try {
      const configuration = readFileSync(path.join(root, directory, '.vale.ini'), 'utf8')
        .replace(/^StylesPath = .*$/m, `StylesPath = ${path.join(root, 'styles')}`);
      writeFileSync(path.join(temporary, '.vale.ini'), configuration);
      const files = cases.map((c, index) => {
        const file = path.join(temporary, `${index}.${c.format || 'md'}`);
        writeFileSync(file, c.input);
        return file;
      });
      const result = spawnSync(executable, ['--no-global', '--output=JSON', ...files], {
        cwd: temporary, encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024,
      });
      assert.ifError(result.error);
      assert.ok([0, 1].includes(result.status), result.stderr || result.stdout);
      const output = JSON.parse(result.stdout);
      assert.ok(Object.values(output).every(Array.isArray), result.stdout);
      const byFilename = new Map(Object.entries(output).map(([file, alerts]) => [path.basename(file), alerts]));
      for (const [index, c] of cases.entries()) {
        await t.test(c.name, () => {
          let alerts = byFilename.get(path.basename(files[index])) || [];
          if (c.rule) {
            const rule = `${path.basename(path.dirname(c.rule))}.${path.basename(c.rule, '.yml')}`;
            alerts = alerts.filter(a => a.Check === rule);
          }
          const text = [...alerts].sort((a, b) => a.Line - b.Line || a.Span[0] - b.Span[0])
            .map(a => `${a.Line}:${a.Span[0]}:${a.Check}:${a.Message}\n`).join('');
          if (Object.hasOwn(c, 'want')) assert.equal(text, c.want);
          for (const term of [].concat(c.contains || [])) assert.ok(text.includes(term), text);
          for (const term of [].concat(c.absent || [])) assert.ok(!text.includes(term), text);
        });
      }
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  });
}
