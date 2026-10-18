import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {photos} from '../src/lib/photos.mjs';
const base=process.env.SITE_URL||'http://127.0.0.1:4321/goyounjung/';
const catalog=photos.filter(p=>p.workTitle);
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
fs.mkdirSync('test-results',{recursive:true});
try{
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto(base+'works/');
  assert.equal(await page.locator('.work-card').count(),catalog.length);
  for(const photo of catalog){
   const figure=page.locator(`[data-photo="${photo.id}"]`);
   assert.equal(await figure.count(),1);
   const img=figure.locator('img');await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());
   assert.equal(await img.getAttribute('alt'),photo.alt);
   assert.ok(await img.evaluate(el=>el.naturalWidth>0&&getComputedStyle(el).objectFit==='contain'));
   assert.equal(await figure.locator('figcaption a').filter({hasText:'사진 출처'}).getAttribute('href'),photo.source);
  }
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`List overflow ${width}`);
  if([390,1440].includes(width)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`test-results/works-photos-${width}.png`,fullPage:true});}
  await page.getByRole('button',{name:'Netflix',exact:true}).click();assert.equal(await page.locator('.work-card:visible').count(),4);
  await page.getByRole('button',{name:'전체',exact:true}).click();assert.equal(await page.locator('.work-card:visible').count(),catalog.length);
  for(const photo of catalog){
   const route=photo.slug||'can-this-love-be-translated';
   await page.goto(base+'wiki/pages/works/'+route+'/');
   const img=page.locator('.prose img');assert.equal(await img.count(),1,route);
   assert.equal(await page.locator('.prose figure').getAttribute('data-photo'),photo.id);
   await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());
   const m=await img.evaluate(el=>({w:el.clientWidth,h:el.clientHeight,nw:el.naturalWidth,nh:el.naturalHeight}));
   assert.ok(m.nw>0&&Math.abs(m.w/m.h-m.nw/m.nh)<.02,`Distorted ${route}`);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${route} ${width}`);
  }
 }
 assert.deepEqual(errors,[]);
 console.log(`Work photos passed: ${catalog.length} cards and details, 4 viewport sizes, filters, sources, loaded images, preserved composition.`);
}finally{await browser.close();}
