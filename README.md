# log_cleaner

A small Node.js watcher that cleans a log file by removing configurable block patterns (e.g. NestJS LoggingInterceptor request/response entries). It runs an initial clean, then keeps watching the file and re-cleans on change.

## Requirements

- Node.js (no external dependencies)

## Installation

```bash
git clone https://github.com/wildlifechorus/log_cleaner.git
cd log_cleaner
yarn install   # optional; no deps, but keeps workflow consistent
cp patterns.example.js patterns.js   # create local patterns (patterns.js is gitignored)
```

Edit `patterns.js` to match your log format (see [Configuration](#configuration)).

## Usage

Place your log file as `log.txt` in the project root, then start the watcher:

```bash
yarn start
```

The script will:

1. Clean `log.txt` once (remove all blocks matching the patterns in `patterns.js`).
2. Watch `log.txt` for changes and run the same clean whenever the file is updated.

Console output looks like:

```
Watching /path/to/log_cleaner/log.txt (removing: LoggingInterceptor request/response).
[2026-02-17T12:00:00.000Z] Cleaned 42 block(s).
```

## Configuration

**`patterns.js`** is not committed (gitignored). Copy from **`patterns.example.js`** if you don’t have it yet, then edit **`patterns.js`** to define which blocks to remove. Each pattern has:

| Field                     | Description                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------- |
| `name`                    | Label shown in the startup message.                                                                |
| `blockStart`              | RegExp for the line that starts a block.                                                           |
| `removeIfNextLineMatches` | Array of RegExps; if the line after `blockStart` matches any of these, the whole block is removed. |
| `blockEnd`                | RegExp for the line that ends the block (optional; default is a line containing only `}`).         |

Example: add another pattern to strip debug objects from a different logger:

```js
{
  name: 'SomeService debug',
  blockStart: /\[SomeService\]\s+Object\(\d+\)\s+\{/,
  removeIfNextLineMatches: [/^\s*level:\s*'debug'/],
  blockEnd: /^\s*\}\s*$/,
},
```

## Project structure

```
log_cleaner/
├── README.md           # this file
├── package.json        # scripts and metadata
├── clean-log.js        # watcher + cleaning logic
├── patterns.example.js # example pattern definitions (committed)
├── patterns.js         # your pattern library (gitignored; copy from example)
└── log.txt             # target log file (create or symlink; see .gitignore)
```

## License

MIT
