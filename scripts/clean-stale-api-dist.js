/**
 * Removes any dist/src/api/<name> directory that does not have a matching
 * src/api/<name> in source. Use after build and at startup so that removed
 * content types never cause "Could not load content type" on deploy.
 */
const fs = require('fs');
const path = require('path');

const srcApi = path.join(process.cwd(), 'src', 'api');
const distApi = path.join(process.cwd(), 'dist', 'src', 'api');

if (!fs.existsSync(srcApi)) return;
if (!fs.existsSync(distApi)) return;

const validNames = new Set(
  fs.readdirSync(srcApi, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
);

const distDirs = fs.readdirSync(distApi, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

for (const name of distDirs) {
  if (!validNames.has(name)) {
    const toRemove = path.join(distApi, name);
    fs.rmSync(toRemove, { recursive: true });
    console.warn('[clean-stale-api-dist] Removed stale dist: dist/src/api/' + name);
  }
}
