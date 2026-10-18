import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const root=path.resolve(process.env.WIKI_DIR||'.wiki');
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'wiki-future-work-'));
try{
 execFileSync('git',['-c','core.hooksPath=/dev/null','clone','--shared',root,fixture],{stdio:'pipe'});
 const target=path.join(fixture,'data/facts/works.json');
 const works=JSON.parse(fs.readFileSync(target,'utf8'));
 works.push({id:'future-fixture',title:'사진 없는 새 작품 검증',year:'미정',platform:'미정',role:'미공개',status:'confirmed',note:'',sources:[],page:'pages/works/future-fixture.md'});
 fs.writeFileSync(target,JSON.stringify(works));
 fs.writeFileSync(path.join(fixture,'pages/works/future-fixture.md'),'# 사진 없는 새 작품 검증\n\n출연 확정, 대표 사진 준비 중.\n');
 execFileSync('git',['-C',fixture,'add','data/facts/works.json','pages/works/future-fixture.md']);
 execFileSync('git',['-C',fixture,'-c','core.hooksPath=/dev/null','-c','user.name=Fixture test','-c','user.email=fixture@example.invalid','commit','-m','Add unillustrated future work fixture'],{stdio:'pipe'});
 execFileSync('npm',['run','build'],{env:{...process.env,WIKI_DIR:fixture},stdio:'pipe',timeout:180000});
 const html=fs.readFileSync('dist/works/index.html','utf8');
 assert.ok(html.includes('사진 없는 새 작품 검증')&&html.includes('대표 사진 준비 중'));
 assert.ok(fs.existsSync('dist/wiki/pages/works/future-fixture/index.html'));
 console.log('Unillustrated future work builds with a placeholder and a detail route.');
} finally {fs.rmSync(fixture,{recursive:true,force:true});}
