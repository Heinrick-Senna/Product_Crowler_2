// Declarando Puppeteer (Não Precisa Ser Declarado, mas é necessário estar instalado)
const puppeteer = require('puppeteer')

// Módulos para ler e gravar arquivos
const fs = require('fs'), xl = require('excel4node'), wb = new xl.Workbook();

// Barra de progresso Dinâmica
const cliProgress = require('cli-progress');

// Cluster para o puppeteer
const { Cluster } = require('puppeteer-cluster');

// Construindo Barra de Progresso
const bar1 = new cliProgress.SingleBar({
    format: '{bar} {percentage}% | Demora Estimada: {eta_formatted} | {value} de {total} Links | Tempo Decorrido: {duration_formatted}'
}, cliProgress.Presets.shades_classic);

// Lendo URLS
const urls = JSON.parse(fs.readFileSync(__dirname + '/LINKS.txt', 'utf-8'));

// Iniciando Barra de Progresso
bar1.start(urls.length, 0);

// Declarando Array De Erros
let errorArray = []

// Declarando planilha para salvamento / Index atual da linha
let ws = wb.addWorksheet('Produtos'), rowindex = 1;

// Função Assíncrona para o Cluster
(async () => {
    // Construindo Cluster
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 4,
    puppeteerOptions: {
        headless: true
    }
  });
 
// Declarando Tarefa Para Execução
await cluster.task(async ({ page, data: url }) => {
    // Direcionando para Url
    await page.goto(url);

    // Extraindo Dados
    async function getLinks(){
        try {
            return await page.evaluate(`(() => {                    
                let produto = {
                    name: document.querySelector('#content-inner h3').innerText,
                    code: document.querySelector('#content-inner h5').innerText.replace('Código do produto: ', '').replace(' ', '-'),
                    price: document.querySelector('#content-inner .price').innerText.replace('R$ ', '').trim(),
                    description:  document.querySelector('#content-inner .descricao').innerText,
                    type:  document.querySelector('#content-inner .tipo').innerText
                }

                return produto
            })()`);
        } catch (err) {
            // Declarando Erro
            errorArray.push(url)
            console.log(errorArray.length)
            console.log(url)
            console.log(err)
            return err
        }
    };

    // Declarando Váriavel de Dados
    let data = await getLinks();

    // Gravando Dados Na Planilha
    let columnindex = 1;
    Object.keys(data).forEach(columnName => {
        ws.cell(rowindex, columnindex++).string(data[columnName]);
    })
    rowindex++;

    // Salvamentos de Backup
    if(rowindex == 400) {
        wb.write(__dirname + '/Produtos.xlsx');
    }
    if(rowindex == 1000) {
        wb.write(__dirname + '/Produtos.xlsx');
    }
    if(rowindex == 1500) {
        wb.write(__dirname + '/Produtos.xlsx');
    }
    if(rowindex == 2000) {
        wb.write(__dirname + '/Produtos.xlsx');
    } 

    // Incrementando Barra de Progresso
    bar1.increment(1)
    return
    });


    // Declarando Fila de URLS
    urls.forEach(url => {
        cluster.queue(url);
    })

    // Terminando Fila
    await cluster.idle();
    wb.write(__dirname + '/ProdutosFinal.xlsx');
    // Fechando Cluster1
    await cluster.close();
    // Salvando Planilha Final
    
    // Parando Barra de Progresso
    bar1.stop();
    // Fechando Aplicação
    process.exit()



})();