import {revision,siteRevision,sourceDate,builtAt,latestRun,documents,sourceFiles} from '../lib/wiki.mjs';
export function GET(){return new Response(JSON.stringify({schemaVersion:2,revision,siteRevision,sourceDate,builtAt,latestRun,documents:documents.length,sourceFiles}),{headers:{'Content-Type':'application/json'}});}
