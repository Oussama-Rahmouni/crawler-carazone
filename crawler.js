const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs').promises;
const path = require('path');

puppeteer.use(StealthPlugin());

const CONFIG = {
    url: 'https://www.carzone.ie/used-cars',
    domain: 'carzone.ie',
    outDir: process.env.OUTPUT_DIR || path.join(__dirname, 'output'),
    limit: parseInt(process.env.MAX_PAGES) || 200, 
    delay: parseInt(process.env.REQUEST_DELAY) || 1200
};

class CarzoneBot {
    constructor() {
        this.queue = [];
        this.seen = new Set();
        this.results = [];
        this.count = 0;
    }

    async setup() {
        console.log('booting crawler...');
        await fs.mkdir(CONFIG.outDir, { recursive: true });

        const bin = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';
        let exec = null;
        let isDocker = false;
        
        try {
            await fs.access(bin);
            exec = bin;
            isDocker = true;
        } catch (e) { exec = undefined; }

        const args = [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage'
        ];

        if (process.env.PROXY_SERVER) {
        args.push(`--proxy-server=${process.env.PROXY_SERVER}`);
        }

        this.browser = await puppeteer.launch({
            // Headless in docker and visible locally so i can test it in both
            headless: isDocker ? "new" : false,
            executablePath: exec,
            args: args
        });
    }

    async run() {
        await this.setup();
        this.queue.push(CONFIG.url);

        while (this.queue.length > 0 && this.count < CONFIG.limit) {
            const url = this.queue.shift();
            if (this.seen.has(url)) continue;
            this.seen.add(url);

            const page = await this.browser.newPage();

            if (process.env.PROXY_USERNAME && process.env.PROXY_PASSWORD) {
            await page.authenticate({
                username: process.env.PROXY_USERNAME,
                password: process.env.PROXY_PASSWORD
            });
}
            
            // prevent large asssets to be uploaded
            await page.setRequestInterception(true);
            page.on('request', (r) => {
                if (['image', 'font', 'media'].includes(r.resourceType())) r.abort();
                else r.continue();
            });

            try {
                console.log(`[${this.count + 1}/${CONFIG.limit}] fetching: ${url}`);
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

                const html = await page.content();
                
                //sanity check
                if (html.length < 5000) throw new Error('Page too small , itt can be blockedkd');

                const fileName = `carzone_${this.count}_${Date.now()}.html`;
                await fs.writeFile(path.join(CONFIG.outDir, fileName), html);

                this.results.push({ url, file: fileName, time: new Date().toISOString() });
                this.count++;

                // link discovery
                const links = await page.evaluate((d) => {
                    return Array.from(document.querySelectorAll('a[href]'))
                        .map(a => a.href.split('?')[0])
                        .filter(l => l.includes(d) && l.includes('/used-cars'));
                }, CONFIG.domain);

                // link discovery
                links.forEach(l => { 
                    if (!this.seen.has(l) && !this.queue.includes(l)) { 
                        this.queue.push(l); 
                    } 
                });
                
            } catch (err) {
                console.error(`skipped ${url} due to err:`, err.message);
            } finally {
                await page.close(); // avoiid memory leak 
            }

            // delay
            await new Promise(r => setTimeout(r, CONFIG.delay));
        }

        await fs.writeFile(
            path.join(CONFIG.outDir, 'manifest.json'), 
            JSON.stringify(this.results, null, 2)
        );

        console.log(`finished , here is the mnaifest json  ${CONFIG.outDir}`);
        await this.browser.close();
    }
}

new CarzoneBot().run().catch(e => console.error('crawler error happened:', e));