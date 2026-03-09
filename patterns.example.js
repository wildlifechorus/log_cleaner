/**
 * Library of block patterns to remove from the log file.
 * Add or edit entries here; clean-log.js uses this list when cleaning.
 *
 * Copy this file to patterns.js and customize for your project.
 * patterns.js is gitignored so your local patterns are not committed.
 *
 * Single-line format (e.g. Nest with ISO timestamp + JSON context):
 *   YYYY-MM-DDTHH:mm:ss.SSS+00:00 level: message {"context":"SomeService"}
 *
 * Pattern types:
 *   - lineMatch: RegExp matching the entire line to remove (single-line logs)
 *   - blockStart + removeIfNextLineMatches + blockEnd: multi-line block removal
 */

module.exports = [
  // Single-line: remove request/response lines with LoggingInterceptor context
  {
    name: 'LoggingInterceptor request/response',
    lineMatch:
      /"context":"LoggingInterceptor".*"type":"(?:request|response)"|"type":"(?:request|response)".*"context":"LoggingInterceptor"/,
  },
  // Single-line: remove by context
  {
    name: 'Example context-based line',
    lineMatch: /"context":"SomeService"/,
  },
  // Block pattern (for multi-line log format)
  // {
  //   name: 'Example block pattern',
  //   blockStart: /\[SomeInterceptor\]\s+Object\(\d+\)\s+\{/,
  //   removeIfNextLineMatches: [/^\s*type:\s*'request'/],
  //   blockEnd: /^\s*\}\s*$/,
  // },
];
