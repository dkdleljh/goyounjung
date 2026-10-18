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

// Photographs must load, retain their composition and fit narrow mobile screens.
const photoBrowser=await chromium.launch({headless:true});
const photoPage=await photoBrowser.newPage();
const photoRoutes=['','wiki/pages/profile/','wiki/pages/awards/','wiki/pages/brands/chanel/','wiki/pages/works/can-this-love-be-translated/','wiki/pages/interviews/','wiki/pages/appearances/','wiki/pages/pictorials/events/','wiki/sources/photos/'];
for(const width of [320,390,768,1440]){
 await photoPage.setViewportSize({width,height:900});
 for(const route of photoRoutes){
  await photoPage.goto(base+route);
  const pictures=photoPage.locator('.licensed-photo img');
  assert.ok(await pictures.count()>0,`Missing photographs: ${route}`);
  for(const img of await pictures.all()){
   await img.scrollIntoViewIfNeeded();
   await img.evaluate(el=>el.decode());
   const details=await img.evaluate(el=>({loaded:el.naturalWidth>0,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,ratio:Number(el.getAttribute('width'))/Number(el.getAttribute('height')),srcset:el.srcset,alt:el.alt}));
   assert.ok(details.loaded&&details.alt&&details.srcset);
   // Gallery previews use contain; body photographs use intrinsic aspect ratio.
   const inGallery=await img.evaluate(el=>!!el.closest('.photo-grid'));
   if(!inGallery)assert.ok(Math.abs(details.width/details.height-details.ratio)<0.02,`Distorted photograph: ${route}`);
  }
  assert.ok(await photoPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Photo overflow: ${width} ${route}`);
  assert.equal(await photoPage.locator('.licensed-photo figcaption').count(),await pictures.count());
  if(route===''&&[390,1440].includes(width)){await photoPage.evaluate(()=>scrollTo(0,0));await photoPage.screenshot({path:`test-results/photos-${width}.png`,fullPage:true});}
 }
}
await photoPage.setViewportSize({width:390,height:844});
for(const [route,name] of [['wiki/pages/profile/','profile'],['wiki/pages/works/can-this-love-be-translated/','work'],['wiki/pages/brands/chanel/','chanel']]){
 await photoPage.goto(base+route);await photoPage.locator('.licensed-photo img').evaluate(el=>el.decode());
 await photoPage.screenshot({path:`test-results/${name}-mobile.png`,fullPage:true});
}
await photoBrowser.close();
console.log('Photo checks passed: 9 routes at 320, 390, 768 and 1440px; loaded images, captions and no overflow.');
