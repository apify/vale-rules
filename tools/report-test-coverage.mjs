import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cases = JSON.parse(readFileSync(path.join(root, 'tests/rules.test.yml'), 'utf8'));
const byRule = new Map();
for (const c of cases) {
  if (!c.rule) continue;
  const rule = path.resolve(root, 'tests', c.rule);
  if (!byRule.has(rule)) byRule.set(rule, []);
  byRule.get(rule).push(c);
}
for (const [rule, fixtures] of byRule) {
  assert.ok(fixtures.some(c => c.want), `${rule} needs a positive case`);
  assert.ok(fixtures.some(c => c.want === ''), `${rule} needs a valid-text case`);
}
let total = 0;
for (const style of ['Apify', 'ApifyDocs', 'ApifyUI', 'ApifyContent']) {
  const rules = readdirSync(path.join(root, 'styles', style)).filter(n => n.endsWith('.yml'));
  const tested = rules.filter(n => byRule.has(path.join(root, 'styles', style, n))).length;
  total += rules.length;
  console.log(`${style}: ${tested}/${rules.length} rules with positive and valid-text cases`);
}
console.log(`Total: ${byRule.size}/${total}; ${total - byRule.size} rules still lack dedicated behavior cases`);
