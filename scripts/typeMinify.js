// most code was taken from https://github.com/ahrakio/witty-webpack-declaration-files/

const { readFileSync, writeFileSync, statSync, mkdirSync, readdirSync, rmSync } = require("fs")
const exists = (name) => {try {statSync(name);return true} catch (e) {return false}}

const imports = {}

function inc(name) {
    let arr = []
    readdirSync(name).forEach(filename => {
        if (statSync(`${name}/${filename}`).isDirectory()) arr = [...arr, ...inc(`${name}/${filename}`)]
        else arr.push(`${name}/${filename}`)
    })
    return arr
}

const included = inc('tmpTypes')

let index = included
.map((filename) =>
(readFileSync(filename).toString())
.split("\n").map(line => {
    if (/import/.test(line)) {
        const i1 = line.indexOf('import') + 8
        const i2 = line.indexOf('from', i1) + 6
        const module = line.substr(i2, line.indexOf('"', i2) - i2)
        if (module.startsWith('./')) return ""
        const imported = line.substr(i1, line.indexOf('}', i1) - i1).split(',')

        if (Object.keys(imports).includes(module)) {
            imported.forEach(imp => {
                if (!imports[module].includes(imp)) imports[module].push(imp)
            })
        } else {
            imports[module] = imported.map(imp => imp.trim())
        }
    }
    if (/\/\//.test(line)) line = line.replace(/\/\/.+/, "")
    if (!/(import)|(export {)/.test(line)) return line.trim()
    return ""
}).filter(l => l.trim())
.join("\n"))
.reduce((a, b) => a + "\n" + b, "").replace(/export default .+/g, "")

index = `${Object.keys(imports).map(module => `import {${imports[module].join(',')}} from "${module}";`).join('')}${index}`

if (!exists('dist')) mkdirSync('dist')
if (!exists('dist/types')) mkdirSync('dist/types')
writeFileSync('dist/types/index.d.ts', index)
rmSync('./tmpTypes/', { recursive: true })


