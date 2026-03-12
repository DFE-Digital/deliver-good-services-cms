/**
 * Removes any dist/src/api/<name> directory that does not have a matching
 * src/api/<name> in source. Use after build and at startup so that removed
 * content types never cause "Could not load content type" on deploy.
 *
 * When src/api is missing (e.g. production deploy that omits source), removes
 * any dir that is in REMOVED_APIS so stale content types are still cleaned.
 */
const fs = require('fs');
const path = require('path');

const REMOVED_APIS = ['single-page-guide'];

const srcApi = path.join(process.cwd(), 'src', 'api');
const distApi = path.join(process.cwd(), 'dist', 'src', 'api');

if (!fs.existsSync(distApi)) process.exit(0);

let validNames;
if (fs.existsSync(srcApi)) {
  validNames = new Set(
    fs.readdirSync(srcApi, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
  );
} else {
  validNames = null;
}

const distDirs = fs.readdirSync(distApi, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

for (const name of distDirs) {
  const shouldRemove = validNames !== null
    ? !validNames.has(name)
    : REMOVED_APIS.includes(name);
  if (shouldRemove) {
    const toRemove = path.join(distApi, name);
    fs.rmSync(toRemove, { recursive: true });
    console.warn('[clean-stale-api-dist] Removed stale dist: dist/src/api/' + name);
  }
}
