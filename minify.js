/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

const { minify } = require("terser")
const { join } = require("path")
const { readdirSync, statSync, writeFileSync, readFileSync } = require("fs")

function getAllFiles(dirPath, fileArr) {
    let arrayOfFiles = fileArr ?? []
    readdirSync(dirPath).forEach(file => {
        if (statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
        arrayOfFiles.push(join(__dirname, dirPath, "/", file));
        }
    });
    return arrayOfFiles.filter(path => path.match(/\.js$/));
}

function minifyFiles() {
    getAllFiles('dist').forEach(filePath => {
    minify(readFileSync(filePath, "utf8")).then(out => {
        writeFileSync(
            filePath,
            out.code
        );
    })
});
}

minifyFiles();
