const puppeteer = require('puppeteer');

async function checkProduct(productNumber) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(`https://www.ikea.cn/cn/en/search/products/?q=${productNumber}`, { waitUntil: 'load', timeout: 0 });

  const productNotFound = await page.evaluate(() => {
    const sorryMessage = 'Sorry！We didn\'t find any';
    return document.body.textContent.includes(sorryMessage);
  });

  await browser.close();

  if (productNotFound) {
    console.log(`Product with number ${productNumber} is not found.`);
  } else {
    console.log(`Product with number ${productNumber} is found.`);
  }
}

checkProduct('301.752.77');
checkProduct('301.752.7');
