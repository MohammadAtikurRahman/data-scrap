const puppeteer = require('puppeteer');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        { id: 'productNumber', title: 'Product Number' },
        { id: 'productName', title: 'Product Name' },
        { id: 'status', title: 'Status' },
    ],
});

async function checkProduct(browser, productNumber) {
    const page = await browser.newPage();
    await page.goto(`https://www.ikea.cn/cn/en/search/products/?q=${productNumber}`, { waitUntil: 'load', timeout: 0 });

    const productNotFound = await page.evaluate(() => {
        const sorryMessage = 'Sorry！We didn\'t find any';
        return document.body.textContent.includes(sorryMessage);
    });

    let result;

    if (productNotFound) {
        result = {
            productNumber,
            status: 'FALSE'
        };
    } else {
        const productName = await page.evaluate(() => {
            const productNameElement = document.querySelector('.product-compact__header-link');
            return productNameElement ? productNameElement.textContent.trim() : '';
        });

        result = {
            productNumber,
            productName,
            status: 'TRUE'
        };
    }

    await page.close();
    return result;
}

async function checkProductsFromJsonFile() {
    const data = fs.readFileSync('code.json', 'utf8');
    const products = JSON.parse(data);
    const browser = await puppeteer.launch({ headless: "new" });

    const chunkSize = 10; // Adjust this number based on your system's capabilities
    for (let i = 0; i < products.length; i += chunkSize) {
        const chunk = products.slice(i, i + chunkSize);
        const promises = chunk.map(product => checkProduct(browser, product.default_code));
        const results = await Promise.all(promises);
        await csvWriter.writeRecords(results);
        console.log(`Processed ${i + chunkSize} of ${products.length} products`);
    }

    await browser.close();
    console.log('CSV file written successfully');
}

checkProductsFromJsonFile();
