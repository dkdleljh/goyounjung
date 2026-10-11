import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const metadata=JSON.parse(fs.readFileSync('dist/sync.json','utf8'));
const files=walk('dist').filter(f=>!f.endsWith('/artifact-manifest.json')).sort().map(file=>({path:path.relative('dist',file).split(path.sep).join('/'),sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex')}));
fs.writeFileSync('dist/artifact-manifest.json',JSON.stringify({schemaVersion:1,revision:metadata.revision,siteRevision:metadata.siteRevision,builtAt:metadata.builtAt,files}));
console.log(`Artifact manifest: ${files.length} files, wiki ${metadata.revision.slice(0,8)}`);
