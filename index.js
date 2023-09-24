const fs = require('node:fs')
const { evaluate } = require("./src/interpretador.js")
const source = process.argv[2] || "/var/rinha/source.rinha.json"

async function main() {
    try {
        const data = await fs.promises.readFile(source)
        const parse = JSON.parse(data)
        const environment = {}
        evaluate(parse.expression, { environment })
    } catch (error) {
        console.log(error)
    }
}

main()