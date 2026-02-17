/**
 * Library of block patterns to remove from the log file.
 * Add or edit entries here; clean-log.js uses this list when cleaning.
 *
 * Copy this file to patterns.js and customize for your project.
 * patterns.js is gitignored so your local patterns are not committed.
 *
 * Each pattern has:
 *   - name: short label for logging
 *   - blockStart: RegExp matching the line that starts a block to consider
 *   - removeIfNextLineMatches: RegExp[] — if the line after blockStart matches
 *     any of these, the whole block is removed (from blockStart through blockEnd)
 *   - blockEnd: RegExp for the line that ends the block (default: line with only "}")
 *
 * For single-line removal, use:
 *   - name: short label for logging
 *   - lineMatch: RegExp matching the entire line to remove
 */

module.exports = [
  {
    name: 'Example block pattern (request/response)',
    blockStart: /\[SomeInterceptor\]\s+Object\(\d+\)\s+\{/,
    removeIfNextLineMatches: [
      /^\s*type:\s*'request'/,
      /^\s*type:\s*'response'/,
    ],
    blockEnd: /^\s*\}\s*$/,
  },
  {
    name: 'Example single-line pattern',
    lineMatch: /\[SomeService\]\s+DEBUG\s+.*/,
  },
  // Add more patterns here, e.g.:
  // {
  //   name: 'SomeOtherNoise',
  //   blockStart: /\[SomeService\]\s+Object\(\d+\)\s+\{/,
  //   removeIfNextLineMatches: [/^\s*level:\s*'debug'/],
  //   blockEnd: /^\s*\}\s*$/,
  // },
];
