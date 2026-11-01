import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const base=process.env.SITE_URL||'http://127.0.0.1:4321/goyounjung/';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();let requests=0;
 await page.route('**/sync.json?check=*',route=>{requests++;return route.fulfill({json:{revision:'a'.repeat(40),siteRevision:'b'.repeat(40),builtAt:new Date(Date.now()+60000).toISOString()}})});
 await page.goto(base+'search/?q='+encodeURIComponent('고윤정 무빙')+'#main');
 await page.waitForURL(url=>url.searchParams.get('v')==='a'.repeat(12)+'-'+'b'.repeat(12));
 await page.locator('#new-records').waitFor();
 assert.equal(new URL(page.url()).searchParams.get('q'),'고윤정 무빙');
 assert.equal(new URL(page.url()).hash,'#main');
 assert.equal(requests,2,'stale receipts must not cause a reload loop');
 await page.unrouteAll();
 await page.route('**/sync.json?check=*',route=>route.fulfill({status:503,body:'unavailable'}));
 await page.goto(base);await page.locator('h1').waitFor();
 assert.equal(await page.locator('#new-records').count(),0);
 console.log('Freshness checks passed: version refresh, query/anchor preservation, no reload loop, readable during receipt outage.');
}finally{await browser.close()}
