import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const executable = process.env.VALE_BIN || 'vale';
test('Academy override preserves intentional bolding without disabling other sections', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'vale-consumer-override-'));
  try {
    writeFileSync(path.join(directory, '.vale.ini'), [
      `StylesPath = ${path.join(root, 'styles')}`,
      'MinAlertLevel = suggestion', '[formats]', 'mdx = md',
      '[*.{md,mdx}]', 'BasedOnStyles = Apify, ApifyDocs',
      '[sources/academy/**/*.{md,mdx}]', 'Apify.OverBolding = NO', '',
    ].join('\n'));
    const intro = '**Learn about the geolocation techniques to determine where requests are coming from, and how to avoid being blocked based on geolocation.**';
    const files = ['sources/academy/lesson.md', 'sources/academy/course/lesson.mdx', 'sources/platform/guide.md'];
    for (const file of files) {
      mkdirSync(path.dirname(path.join(directory, file)), {recursive: true});
      writeFileSync(path.join(directory, file), intro + '\n\nUse a runtime, e.g., Node.js.');
    }
    const result = spawnSync(executable, ['--no-global', '--output=JSON', ...files], {cwd: directory, encoding: 'utf8', timeout: 30000});
    assert.ifError(result.error);
    assert.ok([0, 1].includes(result.status), result.stderr || result.stdout);
    const output = JSON.parse(result.stdout);
    for (const file of files) {
      const entry = Object.entries(output).find(([name]) => name.replaceAll('\\', '/').endsWith(file));
      assert.ok(entry, `missing findings for ${file}`);
      const alerts = entry[1];
      assert.equal(alerts.filter(a => a.Check === 'Apify.OverBolding').length, file.includes('/academy/') ? 0 : 1, file);
      assert.equal(alerts.filter(a => a.Check === 'Apify.NoCommaAfterEg').length, 1, file);
    }
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
});
