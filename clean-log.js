#!/usr/bin/env node

/**
 * Watches log.txt and removes block or single-line entries matching patterns
 * from patterns.js. Keeps all other log lines. Runs an initial clean, then
 * re-runs on file changes.
 */

const fs = require('fs');
const path = require('path');

const patterns = require('./patterns');
const LOG_FILE = path.join(__dirname, 'log.txt');

/** Default block end if a pattern omits it */
const DEFAULT_BLOCK_END = /^\s*\}\s*$/;

/**
 * Returns true if the current line matches a single-line removal pattern.
 *
 * @param {string} line
 * @returns {boolean}
 */
function matchRemoveLine(line) {
  return patterns.some((p) => p.lineMatch && p.lineMatch.test(line));
}

/**
 * Returns true if the current line starts a block that should be removed
 * according to any pattern, and returns that pattern's blockEnd regex.
 *
 * @param {string[]} lines
 * @param {number} i index of current line
 * @returns {{ remove: boolean, blockEnd: RegExp } | null}
 */
function matchRemoveBlock(lines, i) {
  const line = lines[i];
  const nextLine = lines[i + 1];

  for (const p of patterns) {
    if (p.lineMatch) {
      continue;
    }
    const blockStart = p.blockStart;
    const removeIf = p.removeIfNextLineMatches;
    const blockEnd = p.blockEnd || DEFAULT_BLOCK_END;

    if (!blockStart.test(line)) {
      continue;
    }
    const nextMatches =
      nextLine &&
      removeIf.some((re) => re.test(nextLine));
    if (nextMatches) {
      return { remove: true, blockEnd };
    }
  }
  return null;
}

/**
 * Removes all blocks that match the configured patterns.
 *
 * @param {string} content - Raw log file content
 * @returns {{ cleaned: string, removedCount: number }}
 */
function removeMatchedBlocks(content) {
  const lines = content.split('\n');
  const kept = [];
  let i = 0;
  let removedCount = 0;

  while (i < lines.length) {
    if (matchRemoveLine(lines[i])) {
      removedCount += 1;
      i += 1;
      continue;
    }

    const match = matchRemoveBlock(lines, i);

    if (match) {
      i += 1;
      while (i < lines.length && !match.blockEnd.test(lines[i])) {
        i += 1;
      }
      if (i < lines.length) {
        i += 1; // skip the blockEnd line
      }
      removedCount += 1;
      continue;
    }

    kept.push(lines[i]);
    i += 1;
  }

  return { cleaned: kept.join('\n'), removedCount };
}

/**
 * Reads log file, removes matched blocks, and writes back if changed.
 */
function cleanLogFile() {
  let content;
  try {
    content = fs.readFileSync(LOG_FILE, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Log file not found: ${LOG_FILE}`);
      return;
    }
    throw err;
  }

  const { cleaned, removedCount } = removeMatchedBlocks(content);

  if (removedCount === 0 && cleaned === content) {
    return;
  }

  try {
    fs.writeFileSync(LOG_FILE, cleaned, 'utf8');
    console.log(
      `[${new Date().toISOString()}] Cleaned ${removedCount} block(s)/line(s).`
    );
  } catch (err) {
    console.error('Failed to write log file:', err.message);
  }
}

/**
 * Starts watching the log file and cleans it on change.
 */
function watchAndClean() {
  const patternNames = patterns
    .map((p) => p.name)
    .filter(Boolean)
    .join(', ');
  console.log(
    `Watching ${LOG_FILE} (removing: ${patternNames}).`
  );
  cleanLogFile();

  try {
    fs.watch(LOG_FILE, { persistent: true }, (eventType, filename) => {
      if (filename && eventType === 'change') {
        cleanLogFile();
      }
    });
  } catch (err) {
    console.error('Failed to watch file:', err.message);
    process.exitCode = 1;
  }
}

watchAndClean();
