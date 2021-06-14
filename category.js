const puppeteer = require('puppeteer')

const fs = require('fs')

const ConsoleProgressBar = require('console-progress-bar');

const urls = JSON.parse(fs.readFileSync(__dirname + '/LINKS.txt', 'utf-8'));

const consoleProgressBar = new ConsoleProgressBar({ maxValue: urls.length });

let arrayLinks = []

const browser = puppeteer.launch()

browser.then(browser => {
    const getData = async (n) => {
        const page = await browser.newPage()
        await page.goto(urls[n]);

        const getLinks = async () => {
            try {
                return await page.evaluate(`(() => {                    
                    const _items = document.querySelectorAll('.refine-image > a')
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

        getLinks().then(data => {
            if (data.length == 0) {
                arrayLinks.push(urls[n])
            } else if (data.length > 0) {
                arrayLinks = arrayLinks.concat(data);
            }
            if (urls[n+1] != undefined) {
                consoleProgressBar.addValue(1);
                page.close();
                getData(n+1)
            } else {
                consoleProgressBar.addValue(1);
                browser.close()
                fs.writeFileSync(__dirname + '/output.txt', JSON.stringify(arrayLinks))
                console.log(arrayLinks)
                console.log('Terminado :)')
                process.exit()
            }
        })
    }

    getData(0);
})




