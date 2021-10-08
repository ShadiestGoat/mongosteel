/* eslint-disable @typescript-eslint/no-var-requires */
const { build } = require('esbuild')
const { readdirSync } = require('fs')

const {  dependencies ,  devDependencies  } = require ( '../package.json' )
// readdirSync('lib/').map(f => `lib/${f}`)
const shared = {
    entryPoints: ['index.ts'],
    bundle: true,
    minify: true,
    platform: "node",
    sourcemap: false,
    target: "esnext",
    tsconfig: "./tsconfig.json",
    external: Object.keys({...dependencies, ...devDependencies}),
}

build({
    ...shared,
    format: "cjs",
    outfile: "dist/cjs/index.js",
}).then(console.log)

build({
    ...shared,
    format: "esm",
    outfile: "dist/esm/index.js",
}).then(console.log)
