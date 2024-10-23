import puppeteer, { Browser } from 'puppeteer';

const globalForPuppeteer = globalThis as unknown as {
    browser: Browser | null;
};

let browser: Browser | null = globalForPuppeteer.browser || null;

export const launchBrowser = async () => {
    if (!browser) {
        browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],

            userDataDir: '/tmp/puppeteer',
        });
    }
    globalForPuppeteer.browser = browser;
    return browser;
};

export const takeScreenshot = async (url: string) => {
    try {
        const browser = await launchBrowser();
        console.log('browser launched');
        const page = await browser.newPage();
        await page.goto(url);
        const screenshot = await page.screenshot();
        await page.close();
        return screenshot;
    } catch (error) {
        console.error('Error taking screenshot', error);
        return null;
    }
};

export const closeBrowser = async () => {
    if (browser) {
        await browser.close();
        browser = null;
    }
};
