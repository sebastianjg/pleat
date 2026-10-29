# NexaCount fork

This fork combines upstream Pleat at
`ef8fe88ccc4e28a97d137c4a94de28da8fa03e8c` with the nine open upstream PR
heads below. Merge commits retain the upstream history. `git log --merges`
shows the integration sequence.

| PR  | Head                                       | Change                            |
| --- | ------------------------------------------ | --------------------------------- |
| #4  | `a55af7f45f9dc9dcc754abb241003cc711c196f8` | Contrast documentation and checks |
| #33 | `0f99a3d2c82897f0138cad0187f0bcf7956daacf` | Package preview infrastructure    |
| #34 | `f59e4e9f777a3d9c2cb1376368edb0370512feb3` | Shape and Paint                   |
| #35 | `663e9f6ee628b1ef3a74a996c34e5d32547017fc` | Gerstner grid                     |
| #36 | `161e5a33757062682fe06ef304ce921d0a8d2667` | Optional theme store              |
| #37 | `2ad9597fc690d68d39121fcf2e88b39522ba3694` | Grid key Stream compatibility     |
| #38 | `72b98fe591b0cfa8e68a64948b6d9ae4ebfd37c4` | Font-face descriptors             |
| #39 | `4aab47aa0796d001e8677a2c60b4dd55459222c7` | Skip unsupported browser rules    |
| #40 | `3b463705e4ae36fb844ff9b4bf9bcc525db5c252` | Global child combinator           |

## Reproduce and export

Use Node 22.18 or newer and the pinned pnpm 12.10.1. Check out an explicit fork
commit, install its lockfile, and run the complete upstream suite:

```sh
pnpm install --frozen-lockfile
CHROMIUM_PATH=/usr/bin/chromium pnpm check
```

If Chromium is unavailable, run `pnpm chromium:install` and omit `CHROMIUM_PATH`.
The suite builds the optional store and docs locally without deploying them.

From a clean checkout, export the two consumer packages into a new directory:

```sh
pnpm export:local /absolute/path/to/vendor/pleat
```

The destination must not already exist and its parent must exist. The script
builds only `@pleat/core` and `@pleat/foldkit`, then copies each package's `src`,
`dist`, `LICENSE`, and `README.md`. It retains their public exports, declaration
files, runtime dependencies, and peer ranges, removes development dependencies
and scripts, and rewrites the adapter's core dependency to `file:../core`.
Tests, the optional Alchemy store, registry infrastructure, site, and secrets
are excluded. `provenance.json` records the upstream baseline, all nine PR heads,
and the exact fork commit used for this export.

Point the consumer's dependencies to these directories, relative to the
consumer package manifest:

```json
{
  "dependencies": {
    "@pleat/core": "file:../../vendor/pleat/core",
    "@pleat/foldkit": "file:../../vendor/pleat/foldkit"
  }
}
```

Normal package imports resolve the built JavaScript and declarations; consumers
do not need `@pleat/source` conditions. The core's upstream Effect peer remains
`^4.0.0`; consumers supply compatible Effect and Foldkit versions. Retain the
provenance file and licenses with vendored copies.

## Maintenance

Fetch upstream, inspect new PRs against the recorded heads, merge deliberately,
and regenerate `pnpm-lock.yaml` whenever manifests change. Update the head table
and export script together when the pinned inputs change. Run `pnpm format`
and `pnpm check`, commit the result, then export from that commit. Compare the
result with the existing vendor directory before replacing it in a consumer.

Fork CI uses GitHub's Ubuntu runner and runs the upstream checks. Package-preview
publishing and documentation deployment jobs are restricted to the upstream
repository. No Cloudflare credentials or registry deployment are needed for
local use or fork CI.
