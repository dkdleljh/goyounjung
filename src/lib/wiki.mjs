import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {Marked} from 'marked';
import sanitizeHtml from 'sanitize-html';
import GithubSlugger from 'github-slugger';
export const BASE='/goyounjung/';
export const REPO='https://github.com/dkdleljh/goyoonjung-wiki';
export const root=path.resolve(process.env.WIKI_DIR || '.wiki');
const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
export const revision=git('rev-parse','HEAD');
export const sourceDate=git('show','-s','--format=%cI','HEAD');
export const builtAt=new Date().toISOString();
export const profile=JSON.parse(fs.readFileSync(path.join(root,'data/facts/profile.json'),'utf8'));
export const works=JSON.parse(fs.readFileSync(path.join(root,'data/facts/works.json'),'utf8'));
if(!Array.isArray(works)||!works.length||!profile.person) throw new Error('Invalid wiki facts');
export const groups=[['profile','인물과 기록','프로필, 필모그래피, 수상과 타임라인'],['works','작품','작품 속 인물과 이야기'],['interviews','인터뷰','배우의 생각과 목소리'],['visual','화보와 브랜드','매거진, 캠페인과 광고'],['schedule','일정과 활동','공개 일정, 행사와 영상'],['sources','출처와 검증','자료의 근거와 검증 기록'],['news','업데이트','위키 수집 및 변경 기록']];
function category(file){
 if(file.startsWith('news/'))return 'news';
 if(file.startsWith('sources/'))return 'sources';
 const s=file.replace('pages/','');
 if(/^(works\/|filmography)/.test(s))return 'works';
 if(s.startsWith('interviews'))return 'interviews';
 if(/^(brands\/|endorsements\/|pictorials\/|magazines\/)/.test(s))return 'visual';
 if(/^(schedule|appearances|sns|videos\/)/.test(s))return 'schedule';
 if(/^(profile|timeline|awards\.md|people\/|notes\/)/.test(s))return 'profile';
 return 'sources';
}
function walk(dir){return fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);}
const files=['pages','sources','news'].flatMap(walk).filter(f=>f.endsWith('.md')&&!/\/(templates|checklists)\//.test(f));
export const documents=files.map(file=>{
 const markdown=fs.readFileSync(path.join(root,file),'utf8');
 const title=(markdown.match(/^#\s+(.+)$/m)?.[1]||path.basename(file,'.md')).replace(/^[^\p{L}\p{N}]+/u,'').trim();
 const slug=file.replace(/\.md$/,'');
 return {file,slug,title,group:category(file),markdown,url:BASE+'wiki/'+slug+'/',source:REPO+'/blob/'+revision+'/'+file};
});
const byFile=new Map(documents.map(d=>[d.file,d]));
export function rewriteLink(href,file){
 if(!href||href.startsWith('#')) return href;
 if(/^(https?:|mailto:)/i.test(href))return href;
 if(/^[a-z][a-z\d+.-]*:|^\/\//i.test(href))return '';
 const [pathname,hash]=href.split('#');
 let resolved;try{resolved=path.posix.normalize(path.posix.join(path.posix.dirname(file),decodeURIComponent(pathname.split('?')[0])));}catch{return '';}
 if(resolved.startsWith('../'))return '';
 const doc=byFile.get(resolved);
 if(doc)return doc.url+(hash?'#'+hash:'');
 // Files and documentation outside the public archive stay available at the source.
 return REPO+'/blob/'+revision+'/'+resolved+(hash?'#'+hash:'');
}
export function render(markdown,file){
 const slugger=new GithubSlugger();const headings=[];
 const parser=new Marked({gfm:true,renderer:{
  html({text}){return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');},
  heading({tokens,depth}){const text=this.parser.parseInline(tokens);const plain=sanitizeHtml(text,{allowedTags:[],allowedAttributes:{}});const id=slugger.slug(plain);if(depth>1&&depth<4)headings.push({text:plain,id,depth});return `<h${depth} id="${id}">${text}</h${depth}>`;}
 }});
 const html=parser.parse(markdown.replace(/<!--[\s\S]*?-->/g,''));
 return {html:sanitizeHtml(html,{allowedTags:sanitizeHtml.defaults.allowedTags.concat(['img']),allowedAttributes:{...sanitizeHtml.defaults.allowedAttributes,'*':['id'],a:['href','rel'],img:['src','alt','loading']},transformTags:{a:(tag,attrs)=>({tagName:tag,attribs:{...attrs,href:rewriteLink(attrs.href,file),rel:'noopener noreferrer'}}),img:(tag,attrs)=>({tagName:'a',attribs:{href:rewriteLink(attrs.src,file)},text:attrs.alt||'원본 이미지 보기'})}}),headings};
}
const runs=documents.filter(d=>d.group==='news').map(d=>{
 const timestamp=d.markdown.match(/^- 실행:\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?)/m)?.[1];
 const result=d.markdown.match(/^- 결과:\s*(.+)$/m)?.[1]?.trim();
 return timestamp?{timestamp:timestamp.replace(' ','T')+(timestamp.length===16?':00':'')+'+09:00',result,url:d.url}:null;
}).filter(Boolean).sort((a,b)=>b.timestamp.localeCompare(a.timestamp));
export const latestRun=runs[0]||null;
export function dateLabel(date){return new Intl.DateTimeFormat('ko-KR',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Seoul'}).format(new Date(date));}
export const workSlugs={'사이코메트리 그녀석':'he-is-psychometric','보건교사 안은영':'the-school-nurse-files','스위트홈':'sweethome','스위트홈 2':'sweethome-2','로스쿨':'law-school','환혼':'alchemy-of-souls','환혼 빛과 그림자':'alchemy-of-souls-light-and-shadow','헌트':'hunt','무빙':'moving','이재, 곧 죽습니다':'deaths-game','조명가게':'light-shop','언젠가는 슬기로울 전공의생활':'resident-playbook','이 사랑 통역 되나요?':'can-this-love-be-translated','모두가 자신의 무가치함과 싸우고 있다':'everyone-fights-worthlessness'};
export const workUrl=w=>documents.find(d=>d.file.startsWith('pages/works/')&&d.title===w.title)?.url||byFile.get('pages/works/'+workSlugs[w.title]+'.md')?.url||BASE+'wiki/pages/filmography/';
export const searchData=documents.map(d=>({title:d.title,url:d.url,group:d.group,text:d.markdown.replace(/<!--[\s\S]*?-->/g,'').replace(/https?:\/\/\S+/g,'').slice(0,45000)}));
