import puppeteer from 'puppeteer-extra'

import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

const fs = require('fs')

puppeteer.use(AdblockerPlugin()).use(StealthPlugin())

const url = 'https://www.sarkariresult.com/result/';

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Adjust 'headless' to your preference
  const page = await browser.newPage();
  await page.goto(url);

  // The evaluate function of puppeteer
  const scrapedData = await page.evaluate(() => {
    const postElement = document.querySelector("#post");

    if (postElement) {
      // Get all anchor tags within the #post element
      const anchorElements = postElement.querySelectorAll('a');

      // Extract text content from each anchor tag
       const data = Array.from(anchorElements).map((anchor) => 
        (anchor?.textContent?.trim()) ?? 'No text content found' 
      ); 
      return data;
    } else {
      // Handle the case where the #post element is not found
      console.log("Element with id 'box1 #post' not found");
      return [];
    }
  });

  console.log(scrapedData); // Array of text contents from anchor tags within #post

  await browser.close();
  fs.writeFile('data.txt', JSON.stringify(scrapedData), (err: any)=>{
    if(err) throw err;
    console.log("done parsing ")
      
  })
})();

