const puppeteer = require('puppeteer'), fs = require('fs')
const cliProgress = require('cli-progress');
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const urls = JSON.parse(fs.readFileSync(__dirname + '/LINKS.txt', 'utf-8'));

bar1.start(urls.length, 0);

let arrayLinks = []

const browser = puppeteer.launch({ headless: true})

browser.then(browser => {
    const getData = async (n) => {
        const page = await browser.newPage()
        await page.goto(urls[n]);


        const getLinks = async () => {
            try {
                return await page.evaluate(`(() => {                    
                    const _items = document.querySelectorAll('.product-grid-item .name > a')
                    const items = []
                    for (let i = 0; i < _items.length ; i++) {
                        items.push(_items[i].getAttribute('href'));
                    }
                    return items
                })()`);
            } catch (err) {
                return 0
            }
        };

        const dataVrf = () => {
            getLinks().then(data => {
                if (data.length == 0) {
                    arrayLinks.push(urls[n])
                } else if (data.length > 0) {
                    arrayLinks = arrayLinks.concat(data);
                }
                if (urls[n+1] != undefined) {
                    page.close();
                    bar1.increment(1);
                    getData(n+1)
                } else {
                    browser.close()
                    bar1.increment(1);
                    fs.writeFileSync(__dirname + '/output.txt', JSON.stringify(arrayLinks))
                    bar1.stop();
                    console.log('Terminado :)')
                    process.exit()
                }
            })
        }

        const clickElement = async () => {
            await autoScroll(page);
            let item = await page. $('.ias-button');

            if (item != null) { 
                await page.click('.ias-button');
                await autoScroll(page);

                page.waitForAnySelector = (page, selectors) => new Promise((resolve, reject) => {
                    let hasFound = false
                    selectors.forEach(selector => {
                      page.waitForSelector(selector)
                        .then(() => {
                          if (!hasFound) {
                            hasFound = true
                            resolve(selector)
                          }
                        })
                        .catch((error) => {
                          // console.log('Error while looking up selector ' + selector, error.message)
                        })
                    })
                  })

                const selector = await page.waitForAnySelector(page, ['.ias-button', '.ias-noneleft'])

                if (selector === '.ias-button') {
                    clickElement();
                  } else if (selector === '.ias-noneleft') {
                    dataVrf()
                  }
            } else {
                dataVrf()
            }
        }

        await clickElement();
    }

    getData(0);
})




