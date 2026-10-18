import test from 'node:test';import assert from 'node:assert/strict';
import {render,rewriteLink,documents,works,workUrl,latestRun} from '../src/lib/wiki.mjs';
import {findResults} from '../src/lib/search.mjs';
import {photos,workPhoto,renderPhoto} from '../src/lib/photos.mjs';
import fs from 'node:fs';
test('relative links resolve across nested wiki pages',()=>{assert.equal(rewriteLink('../profile.md','pages/works/moving.md'),'/goyounjung/wiki/pages/profile/');assert.equal(rewriteLink('https://example.org','pages/profile.md'),'https://example.org');assert.equal(rewriteLink('javascript:alert(1)','pages/profile.md'),'');assert.equal(rewriteLink('../../../.env','pages/profile.md'),'');});
test('rendering preserves source text without executable markup',()=>{const {html}=render('# Title\n\n<script>alert(1)</script>\n\n[bad](javascript:alert)\n\n![x](https://example.org/a.png)\n\n## 동일\n\n## 동일\n\n<!-- internal -->','pages/profile.md');assert.ok(!html.includes('<script>'));assert.ok(!html.includes('javascript:'));assert.ok(!html.includes('internal'));assert.match(html,/id="동일-1"/);assert.ok(!html.includes('<img'));});
test('every work and every source document has a route',()=>{assert.ok(documents.length>80);assert.equal(new Set(documents.map(d=>d.url)).size,documents.length);for(const w of works)assert.ok(documents.some(d=>d.url===workUrl(w)));assert.ok(latestRun?.timestamp);});
test('Korean multi-word search and title ranking',()=>{const input=[{title:'기록',text:'무빙 인터뷰',url:'/a'},{title:'무빙 인터뷰',text:'출연작',url:'/b'}];assert.equal(findResults(input,'무빙 인터뷰')[0].url,'/b');assert.equal(findResults(input,'없는기록').length,0);assert.equal(findResults(input,'  ').length,0);});

test('reviewed images render with responsive sources and attribution',()=>{
 const {html}=render('![portrait](https://dkdleljh.github.io/goyounjung/images/photos/portrait-960.webp)','pages/profile.md');
 assert.match(html,/<figure class="licensed-photo portrait-photo"/);
 assert.match(html,/<img[^>]+srcset=/);
 assert.match(html,/width="960" height="1187"/);
 assert.match(html,/fetchpriority="high"/);
 assert.match(html,/CC BY 3.0/);
 assert.match(html,/commons.wikimedia.org/);
 assert.match(html,/크기 조정 및 WebP 변환/);
 assert.ok(!html.includes('github.com/dkdleljh/goyoonjung-wiki/blob/'));
 assert.ok(!html.startsWith('<p><figure'));
});
test('unreviewed image URLs and forged HTML cannot inject image loads or scripts',()=>{
 for(const source of ['https://example.org/tracker.png','/goyounjung/images/photos/unknown.webp','data:image/svg+xml;base64,PHN2Zy8+','javascript:alert(1)']){
  const {html}=render(`![unreviewed](${source})`,'pages/profile.md');
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('href="javascript:'));
  assert.ok(!html.includes('href="data:'));
 }
 const {html}=render('<img src="/goyounjung/images/photos/portrait-960.webp" onerror="alert(1)">','pages/profile.md');
 assert.ok(!html.includes('<img'));
});

test('each work has exactly one correctly linked representative image in its article',()=>{
 assert.ok(photos.filter(p=>p.workTitle).length >= 16);
 for(const work of works){
  const photo=workPhoto(work);
  if (!photo) continue; // Missing future artwork must not block publishing facts.
  assert.equal(photos.filter(p=>p.workId===work.id||(!p.workId&&p.workTitle===work.title)).length,1);
  const doc=documents.find(d=>d.url===workUrl(work));
  assert.ok(doc.file.startsWith('pages/works/'));
  const {html}=render(doc.markdown,doc.file);
  assert.equal((html.match(/<img /g)||[]).length,1,work.title);
  assert.ok(html.includes(`data-photo="${photo.id}"`),work.title);
  for(const variant of photo.variants){
   assert.equal(fs.statSync('public'+variant.src.replace('/goyounjung','')).size,variant.bytes);
   assert.ok(variant.width>0&&variant.height>0);
  }
  assert.ok(photo.source.startsWith('https://'));
 }
});
test('editorial images retain source credit without inventing a CC license',()=>{
 const photo=workPhoto({title:'환혼 빛과 그림자'});
 const html=renderPhoto(photo.id);
 assert.match(html,/고윤정 캐릭터 포스터/);
 assert.match(html,/저작권 보유 이미지/);
 assert.ok(!html.includes('rel="license'));
 assert.ok(!html.includes('undefined'));
 for(const title of ['남벌','무빙 시즌 2'])assert.match(workPhoto({title}).kind,/발표 보도/);
});

test("unillustrated future work has a safe fallback",()=>{assert.equal(workPhoto({title:"아직 발표되지 않은 새 작품"}),undefined);});
