import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const destination = process.argv[2]
if (!destination || process.argv.length !== 3) {
  throw new Error('Usage: pnpm export:local <new-output-directory>')
}

const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
if (git('status', '--porcelain', '--untracked-files=normal')) {
  throw new Error(
    'Commit or remove working-tree changes before exporting a pinned snapshot.',
  )
}

const forkCommit = git('rev-parse', 'HEAD')
for (const name of ['core', 'foldkit']) {
  rmSync(resolve(root, 'packages', name, 'dist'), { recursive: true, force: true })
}
execFileSync('pnpm', ['--filter', '@pleat/core', '--filter', '@pleat/foldkit', 'build'], {
  cwd: root,
  stdio: 'inherit',
})

const output = resolve(destination)
mkdirSync(output, { recursive: false })
for (const name of ['core', 'foldkit']) {
  const source = resolve(root, 'packages', name)
  const target = resolve(output, name)
  mkdirSync(target)
  for (const entry of ['src', 'dist', 'LICENSE', 'README.md']) {
    cpSync(resolve(source, entry), resolve(target, entry), {
      recursive: true,
      filter: sourcePath => !/\.(test|spec)\.[cm]?[jt]s(?:\.map)?$/.test(sourcePath),
    })
  }
  const manifest = JSON.parse(readFileSync(resolve(source, 'package.json'), 'utf8'))
  delete manifest.devDependencies
  delete manifest.scripts
  if (name === 'foldkit') {
    manifest.dependencies['@pleat/core'] = 'file:../core'
  }
  writeFileSync(resolve(target, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`)
}

const provenance = {
  upstream: 'https://github.com/Manzanita-Research/pleat',
  upstreamCommit: 'ef8fe88ccc4e28a97d137c4a94de28da8fa03e8c',
  fork: 'https://github.com/sebastianjg/pleat',
  forkCommit,
  pullRequests: {
    4: 'a55af7f45f9dc9dcc754abb241003cc711c196f8',
    33: '0f99a3d2c82897f0138cad0187f0bcf7956daacf',
    34: 'f59e4e9f777a3d9c2cb1376368edb0370512feb3',
    35: '663e9f6ee628b1ef3a74a996c34e5d32547017fc',
    36: '161e5a33757062682fe06ef304ce921d0a8d2667',
    37: '2ad9597fc690d68d39121fcf2e88b39522ba3694',
    38: '72b98fe591b0cfa8e68a64948b6d9ae4ebfd37c4',
    39: '4aab47aa0796d001e8677a2c60b4dd55459222c7',
    40: '3b463705e4ae36fb844ff9b4bf9bcc525db5c252',
  },
}
writeFileSync(
  resolve(output, 'provenance.json'),
  `${JSON.stringify(provenance, null, 2)}\n`,
)
console.log(`Exported @pleat/core and @pleat/foldkit from ${forkCommit} to ${output}`)
