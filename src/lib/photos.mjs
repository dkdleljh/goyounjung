import catalog from '../data/photos.json' with {type:'json'};

// Only reviewed, locally hosted photographs are rendered inline.
export const photos=catalog;
export const photoById=new Map(photos.map(photo=>[photo.id,photo]));
const bySource=new Map(photos.flatMap(photo=>photo.variants.flatMap(v=>[
 [v.src,photo],['https://dkdleljh.github.io'+v.src,photo]
])));
export const registeredPhoto=src=>bySource.get(src);
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderPhoto(id,{priority=false,sizes='(max-width: 760px) 88vw, 640px'}={}){
 const photo=photoById.get(id);
 if(!photo)throw new Error(`Unknown photograph: ${id}`);
 const largest=photo.variants.at(-1);
 const srcset=photo.variants.map(v=>`${v.src} ${v.width}w`).join(', ');
 return `<figure class="licensed-photo ${largest.width<largest.height?'portrait-photo':'landscape-photo'}" data-photo="${escape(id)}">
<a class="photo-open" href="${escape(largest.src)}" aria-label="${escape(photo.title)} — 사진 크게 보기"><img src="${escape(largest.src)}" srcset="${escape(srcset)}" sizes="${escape(sizes)}" width="${largest.width}" height="${largest.height}" alt="${escape(photo.alt)}" loading="${priority?'eager':'lazy'}" decoding="async"${priority?' fetchpriority="high"':''}/></a>
<figcaption><span class="photo-title">${escape(photo.title)}</span><span class="photo-credit"><a href="${escape(photo.authorUrl)}" rel="noopener noreferrer">${escape(photo.author)}</a> · <a href="${escape(photo.source)}" rel="noopener noreferrer">사진 출처</a> · <a href="${escape(photo.licenseUrl)}" rel="license noopener noreferrer">${escape(photo.license)}</a></span><span class="photo-changes">${escape(photo.changes)}</span></figcaption>
</figure>`;
}
