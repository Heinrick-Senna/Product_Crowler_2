// Declarando Puppeteer (Não Precisa Ser Declarado, mas é necessário estar instalado)
const puppeteer = require('puppeteer')

// Módulos para ler e gravar arquivos
const fs = require('fs');

// Barra de progresso Dinâmica
const cliProgress = require('cli-progress');

// Cluster para o puppeteer
const { Cluster } = require('puppeteer-cluster');

// Construindo Barra de Progresso
const bar1 = new cliProgress.SingleBar({
    format: '{bar} {percentage}% | Demora Estimada: {eta_formatted} | {value} de {total} Links | Tempo Decorrido: {duration_formatted}'
}, cliProgress.Presets.shades_classic);

// Lendo URLS
const urls = JSON.parse(fs.readFileSync(__dirname + '/LINKS.json', 'utf-8'));

// Declarando Array de Resultados
let arrayResults = [];

// Iniciando Barra de Progresso
bar1.start(urls.length, 0);

// Declarando Array De Erros
let errorArray = [];

// Função Assíncrona para o Cluster
(async () => {
    // Construindo Cluster
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 12,
    retryLimit: 6,
    skipDuplicateUrls: true,
    sameDomainDelay: 150,
    skipDuplicateUrls: true,
    puppeteerOptions: {
        headless: false
    }
  });
 
// Declarando Tarefa Para Execução
await cluster.task(async ({ page, data: url }) => {
    // Direcionando para Url
    await page.goto(url);

    // Scrollar Para Baixo
    await autoScroll(page);

    // Função Para Scrollar Para Baixo
    async function autoScroll(page){
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
    
                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    // Extraindo Dados
    async function getLinks(){
        try {
            return await page.evaluate(`(()=>{
                
            })();`)
        } catch (err) {
            // Declarando Erro
            errorArray.push(url)
            console.log(errorArray.length)
            console.log(url)
            console.log(err)
            return err
        }
    }

    // Declarando Váriavel de Dados
    let data = await getLinks();

    // Gravando Dados Na Planilha
    console.log(data)
    if (data != '' && data) {
       arrayResults.push(data)
    }

    // Salvando Backups
    fs.writeFileSync(__dirname + '/ProdutosBackup.json', JSON.stringify(arrayResults))

    // Incrementando Barra de Progresso
    bar1.increment(1)
    return
    });

    // Declarando Fila de URLS
    urls.forEach(url => { cluster.queue(url) })

    // Terminando Fila
    await cluster.idle();

    // Salvando Dados Finais
    fs.writeFileSync(__dirname + '/ProdutosFinal.json', JSON.stringify(arrayResults))
    
    // Fechando Cluster1
    await cluster.close();

    // Parando Barra de Progresso
    bar1.stop();

    // Fechando Aplicação
    process.exit()
})();