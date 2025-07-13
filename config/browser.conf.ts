import globalVariables from "../resources/globalVariable.ts";
import { customGeolocation } from "../src/utils/webdriver/browser.ts";
import { config } from "./wdio.conf.ts"

if (globalVariables.os === 'linux') {
    config.hostname = process.env.HOST_NAME!.split(':')[0];
    config.port = parseInt(process.env.HOST_NAME!.split(':')[1]);
    config.capabilities = [
        {
            maxInstances: 6,
            browserName: 'chrome',
            'goog:chromeOptions': {
                        args: ['--headless=new', 
                            '--no-sandbox',
                            '--incognito', 
                            '--disable-blink-features=AutomationControlled',
                            '--disable-gpu',
                            '--disable-gpu-compositing', 
                            '--disable-dev-shm-usage',
                            '--disable-extensions',
                            '--disable-cache', 
                            // '--remote-debugging-pipe',
                            `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36`]
            },
            acceptInsecureCerts: true,
            // webSocketUrl: true
        }
    ];

    config.services = [];
} else {
    const browserName = process.env.BROWSER_NAME;
    switch (browserName) {
        case 'headless':
            config.capabilities = [
                {
                    maxInstances: 5,
                    browserName: 'chrome',
                    'goog:chromeOptions': {
                        args: ['--headless=new', 
                            '--no-sandbox',
                            '--incognito', 
                            '--disable-blink-features=AutomationControlled',
                            '--disable-gpu',
                            '--disable-gpu-compositing', 
                            '--disable-dev-shm-usage',
                            '--disable-extensions',
                            '--disable-cache', 
                            `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36`]
                    },
                    acceptInsecureCerts: true,
                    // webSocketUrl: true
                }
            ];
            break;
        case 'chrome':
            config.capabilities = [
                {
                    browserName: 'chrome',
                    'goog:chromeOptions': {
                        args: ['--disable-cache','--disable-blink-features=AutomationControlled','--incognito']
                    },
                    maxInstances: 5,
                    acceptInsecureCerts: true,
                    // webSocketUrl: true
                }
            ];
            break;
        case 'docker':
            config.hostname = process.env.HOST_NAME!.split(':')[0];
            config.port = parseInt(process.env.HOST_NAME!.split(':')[1]);
            config.path = "/wd/hub"
            config.capabilities = [
                {
                    maxInstances: 6,
                    browserName: 'chrome',
                    'goog:chromeOptions': {
                        args: ['--headless=new', 
                            '--no-sandbox', 
                            '--incognito', 
                            '--disable-blink-features=AutomationControlled',
                            '--disable-gpu',
                            '--disable-gpu-compositing', 
                            '--disable-dev-shm-usage',
                            '--disable-extensions',
                            '--disable-cache', 
                            // '--remote-debugging-pipe',
                            `--user-agent=${globalVariables.getRandomUserAgent()}`]
                    },
                    acceptInsecureCerts: true,
                    // webSocketUrl: true
                }
            ];
            config.services = [];
            break;
        default:
            throw new Error(`browserName "${browserName}" not recognized!`);
    }

}

config.before = async () => {
    // await browser.deleteCookies();
    // await browser.execute(() => {
    //     if ('caches' in window) {
    //       caches.keys().then(keys => {
    //         keys.forEach(key => {
    //           caches.delete(key);
    //         });
    //       });
    //     }
    //   });

    // customGeolocation(globalVariables.setLatitude, globalVariables.setLongitude)
    await browser.deleteCookies();
        await browser.execute(() => {
            if (window.caches) {
                caches.keys().then(function(names) {
                    names.forEach(function(name) {
                        caches.delete(name);
                    });
                });
            }
        });
    customGeolocation(globalVariables.setLatitude, globalVariables.setLongitude)

};

export default { config };