import fs from 'node:fs';import path from 'node:path';
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk('dist').filter(f=>f.endsWith('.html'));const missing=[];
for(const file of files){const html=fs.readFileSync(file,'utf8');for(const match of html.matchAll(/(?:href|src)="(\/goyounjung\/[^"#?]*)/g)){const url=decodeURIComponent(match[1]).replace('/goyounjung/','');const target=path.join('dist',url);if(!fs.existsSync(target))missing.push(`${file}: ${match[1]}`);}}
if(missing.length){console.error(missing.join('\n'));process.exit(1);}console.log(`${files.length} pages: all local links and assets exist.`);
