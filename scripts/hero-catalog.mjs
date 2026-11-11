import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('../landing-v2/images/', import.meta.url));
const output = `${directory}/hero-images.json`;

export function buildCatalog(files) {
  const catalog = { desktop: [], mobile: [] };
  for (const [key, base] of [['desktop', 'hero-final'], ['mobile', 'hero-section-mobile']]) {
    const entries = new Map();
    for (const file of files) {
      const match = file.match(new RegExp(`^${base}(?:-([1-9][0-9]*))?\\.(webp|png)$`));
      if (!match) continue;
      const index = Number(match[1] || 1);
      const previous = entries.get(index);
      const numbered = Boolean(match[1]);
      if (!previous || (numbered && !previous.numbered) ||
          (numbered === previous.numbered && match[2] === 'webp')) {
        entries.set(index, { extension: match[2], filename: file, numbered });
      }
    }
    catalog[key] = [...entries].sort(([a], [b]) => a - b)
      .map(([index, { extension, filename }]) => ({ index, extension, filename }));
  }
  return catalog;
}

function update() {
  const content = `${JSON.stringify(buildCatalog(readdirSync(directory)), null, 2)}\n`;
  let previous;
  try { previous = readFileSync(output, 'utf8'); } catch { /* First run. */ }
  if (previous !== content) writeFileSync(output, content);
}

update();
if (process.argv.includes('--watch')) {
  // Polling also works on hosts where native filesystem watchers are restricted.
  setInterval(update, 3000);
  console.log('Hero catalog: watching image additions and removals.');
}
