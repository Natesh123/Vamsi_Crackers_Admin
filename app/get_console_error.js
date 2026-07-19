const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
  
  await page.type('input[placeholder="Enter username"]', 'admin');
  await page.type('input[placeholder="Enter account password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("ERRORS:", JSON.stringify(errors, null, 2));
  await browser.close();
})();
