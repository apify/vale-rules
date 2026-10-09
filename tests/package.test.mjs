import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { test } from 'node:test';

const execute = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const executable = process.env.VALE_BIN || 'vale';
test('release archive syncs and preserves every style rule', async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'vale-package-'));
  let server;
  try {
    await execute('bash', [path.join(root, 'tools/build-package.sh'), temporary]);
    const archive = await readFile(path.join(temporary, 'ApifyStyleGuide.zip'));
    const {stdout: listing} = await execute('unzip', ['-Z1', path.join(temporary, 'ApifyStyleGuide.zip')]);
    assert.ok(listing.split('\n').includes('ApifyStyleGuide/LICENSE'));
    assert.ok(!listing.includes('/tests/'));
    server = createServer((request, response) => {
      if (request.url !== '/ApifyStyleGuide.zip') { response.writeHead(404).end(); return; }
      response.writeHead(200, {'Content-Type': 'application/zip'}).end(archive);
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    await writeFile(path.join(temporary, '.vale.ini'), [
      'StylesPath = installed',
      `Packages = http://127.0.0.1:${server.address().port}/ApifyStyleGuide.zip`,
      'MinAlertLevel = suggestion', '[*.md]', 'BasedOnStyles = Apify, ApifyDocs, ApifyUI, ApifyContent', '',
    ].join('\n'));
    await execute(executable, ['--no-global', 'sync'], {cwd: temporary, timeout: 30000});
    for (const style of ['Apify', 'ApifyDocs', 'ApifyUI', 'ApifyContent']) {
      const source = path.join(root, 'styles', style);
      const installed = path.join(temporary, 'installed', style);
      const names = (await readdir(source)).filter(n => n.endsWith('.yml') || n === 'meta.json').sort();
      assert.deepEqual((await readdir(installed)).filter(n => n.endsWith('.yml') || n === 'meta.json').sort(), names);
      for (const name of names) assert.deepEqual(await readFile(path.join(installed, name)), await readFile(path.join(source, name)));
    }
    await writeFile(path.join(temporary, 'probe.md'), 'Use Apify SDK today.');
    const {stdout} = await execute(executable, ['--no-global', '--output=JSON', 'probe.md'], {cwd: temporary, timeout: 30000});
    assert.ok(Object.values(JSON.parse(stdout)).flat().some(a => a.Check === 'Apify.ProductArticles'));
  } finally {
    if (server?.listening) await new Promise(resolve => server.close(resolve));
    await rm(temporary, {recursive: true, force: true});
  }
});
