import puppeteer from 'puppeteer-extra'

import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

const fs = require('fs')

puppeteer.use(AdblockerPlugin()).use(StealthPlugin())

const pages = ["result", "admitcard", "latestjob", "admission", "answerkey"];

(async () => {
  const browser = await puppeteer.launch({ headless: false }); 

  for (const pageName of pages) { 
    const url = 'https://www.sarkariresult.com/' + pageName + '/';

    const page = await browser.newPage();
    await page.goto(url);

    const scrapData = await page.evaluate(()=>{
      const postElements = document.querySelector('#post');
      if(postElements){
        const anchorElements = Array.from(postElements.querySelectorAll('a'));
        const data = anchorElements.map((elements)=>
        (elements?.textContent?.trim()) ?? "No elements found "
        );
        return data;
      }
      else
        return [];
    })
    console.log(scrapData);
    fs.writeFile('data' + pageName + '.txt', JSON.stringify(scrapData), (err: any)=>{
      if(err) throw err;
      else
        console.log("written");
    })
    await page.close();
  }

  await browser.close();
})();
