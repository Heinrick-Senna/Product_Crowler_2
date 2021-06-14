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
                let produto = {}

                    produto["url"] = window.location.href
                    
                if (document.querySelector('.heading-title') != null ) {
                    produto["name"] = document.querySelector('.heading-title').innerHTML
                } else {
                    produto["name"] = ""
                }
                if (document.querySelector('.product-price') != null) {
                    produto["price"] = document.querySelector('.product-price').innerHTML.replace('R$','')
                } else {
                    produto["price"] = ""
                }
                if (document.querySelector('.journal-stock') != null) {
                    produto["stock"] = document.querySelector('.journal-stock').innerHTML
                } else {
                    produto["stock"] = ""
                }
                if (document.querySelector('.p-brand > a') != null) {
                    produto["brand"] = document.querySelector('.p-brand > a').innerHTML
                } else {
                    produto["brand"] = ""
                }
                if (document.querySelector('#tab-description') != null) {
                    produto["description"] = document.querySelector('#tab-description').innerText
                } else {
                    produto["description"] = ""
                }
                if (document.querySelector('.breadcrumb li:nth-last-of-type(3)') != null) {
                    produto["Categoria"] = document.querySelector('.breadcrumb li:nth-last-of-type(3)').innerText
                } else {
                    produto["Categoria"] = ""
                }
                if (document.querySelector('.breadcrumb li:nth-last-of-type(2)') != null) {
                    produto["subCategoria"] = document.querySelector('.breadcrumb li:nth-last-of-type(2)').innerText
                } else {
                    produto["subCategoria"] = ""
                }

                if (document.querySelector('#product-gallery') != null) {
                    let images = document.querySelectorAll('.swiper-slide')

                    for (let i = 0; i < images.length; i++) {
                        if(images[i].getAttribute('href') != null) {
                            produto['images'+i] = images[i].getAttribute('href')
                        }
                    }
                }

                if (document.querySelector('#product-gallery') == null) {
                    if (document.querySelector('.product-info .image > a > img') != null) {
                        produto["image"] = document.querySelector('.product-info .image > a > img').getAttribute('src')
                    }              	
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
        wb.write(__dirname + '/output/Produtos.xlsx');
    }
    if(rowindex == 1000) {
        wb.write(__dirname + '/output/Produtos.xlsx');
    }
    if(rowindex == 1500) {
        wb.write(__dirname + '/output/Produtos.xlsx');
    }
    if(rowindex == 2000) {
        wb.write(__dirname + '/output/Produtos.xlsx');
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
    // Fechando Cluster
    await cluster.close();
    // Salvando Planilha Final
    wb.write(__dirname + '/Produtos.xlsx');
    // Parando Barra de Progresso
    bar1.stop();
    // Fechando Aplicação
    process.exit()



})();