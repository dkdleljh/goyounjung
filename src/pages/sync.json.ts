import {revision,sourceDate,builtAt,latestRun,documents} from '../lib/wiki.mjs';
export function GET(){return new Response(JSON.stringify({revision,sourceDate,builtAt,latestRun,documents:documents.length}),{headers:{'Content-Type':'application/json'}});}
