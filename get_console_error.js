const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ 
    executablePath: '/usr/bin/google-chrome',
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
  
  // Try to login
  await page.type('input[placeholder="Enter username"]', 'admin');
  await page.type('input[placeholder="Enter account password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  // Wait a bit for the error
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("ERRORS:", JSON.stringify(errors, null, 2));
  await browser.close();
})();
