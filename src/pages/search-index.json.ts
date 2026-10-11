import {searchData} from '../lib/wiki.mjs';
export function GET(){return new Response(JSON.stringify(searchData),{headers:{'Content-Type':'application/json; charset=utf-8'}});}
