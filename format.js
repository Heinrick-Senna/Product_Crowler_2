// Módulos para ler e gravar arquivos
const fs = require('fs'), xl = require('excel4node'), wb = new xl.Workbook();

// Lendo URLS
const products = JSON.parse(fs.readFileSync(__dirname + '/teste.json', 'utf-8'))

// Declarando planilha para salvamento / Index atual da linha
let ws = wb.addWorksheet('Produtos'), rowindex = 2;

console.log(products.length)

let arrayResult = []

products.forEach(data => {
    for (let i = 1; i < 21; i++) {
        arrayResult.push(`${data}?p=${i}`)
    }
})

fs.writeFileSync(__dirname+'/result2.json', JSON.stringify(arrayResult))

// let columnindex = 1;
// Object.keys(data).forEach(columnName => {
//     ws.cell(rowindex, columnindex++).string(data[columnName]);
// })
// rowindex++;

// wb.write(__dirname + '/ProdutosCategoria.xlsx');