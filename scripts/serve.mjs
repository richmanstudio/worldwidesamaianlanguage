import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.ico':'image/x-icon'};
const port=Number(process.env.PORT||8080);
createServer(async (req,res)=>{
  try {
    const urlPath=decodeURIComponent(new URL(req.url||'/', 'http://localhost').pathname);
    const p=resolve(root, '.'+urlPath, urlPath.endsWith('/')?'index.html':'');
    if (p!==root && !p.startsWith(root+sep)) throw new Error('invalid path');
    const file=(await stat(p)).isDirectory()?resolve(p,'index.html'):p;
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});
    res.end(await readFile(file));
  } catch {res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('404 — Страница не найдена');}
}).listen(port,()=>console.log(`SAMA: http://localhost:${port}`));
