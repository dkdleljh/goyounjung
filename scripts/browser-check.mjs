import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('test-results',{recursive:true});
const browser=await chromium.launch({headless:true});
const base=process.env.SITE_URL||'http://127.0.0.1:4321/goyounjung/';
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.setViewportSize({width:1440,height:1000});
await page.goto(base);await page.locator('h1').waitFor();
await page.screenshot({path:'test-results/site-desktop.png',fullPage:true});
await page.goto(base+'search/?q='+encodeURIComponent('무빙'));await page.waitForFunction(()=>document.querySelectorAll('#results a').length>0);assert.ok(await page.locator('#results a').count()>0);
await page.goto(base+'works/');await page.getByRole('button',{name:'Netflix',exact:true}).click();assert.equal(await page.locator('[data-platform]:visible').count(),4);
await page.goto(base+'archive/?category=interviews');assert.ok(await page.locator('[data-group="interviews"]:visible').count()>0);assert.equal(await page.locator('[data-group="works"]:visible').count(),0);
for(const width of [390,320]){await page.setViewportSize({width,height:844});for(const url of [base,base+'works/',base+'wiki/pages/profile/',base+'wiki/pages/filmography/']){await page.goto(url);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow: ${width} ${url}`);}}
await page.setViewportSize({width:390,height:844});await page.goto(base);await page.screenshot({path:'test-results/site-mobile.png',fullPage:true});
assert.deepEqual(errors,[]);await browser.close();console.log('Browser checks passed: search, filters, archive, desktop/mobile, no JS errors.');
