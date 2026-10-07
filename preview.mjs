import http from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

const root=path.resolve(fileURLToPath(new URL('./site/',import.meta.url)));
const host='127.0.0.1';
const noOpen=process.argv.includes('--no-open')||process.env.TIANHOU_NO_OPEN==='1';
const portArgument=process.argv.find(value=>value.startsWith('--port='));
const firstPort=Number(portArgument?.split('=')[1]||4210);
if(!Number.isInteger(firstPort)||firstPort<1024||firstPort>65515)throw Error('端口应在 1024–65515 之间');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon','.wasm':'application/wasm','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  if(pathname==='/_demo/health.json'){const body=JSON.stringify({site:'tianhou-palace-client-demo',version:'2026-10-07',ready:true});res.writeHead(200,{'Content-Type':mime['.json'],'Content-Length':Buffer.byteLength(body)});res.end(req.method==='HEAD'?undefined:body);return;}
  let file=path.resolve(root,'.'+pathname);
  if((file!==root&&!file.startsWith(root+path.sep))||pathname.includes('\0')){res.writeHead(403).end();return;}
  let info=await stat(file).catch(()=>null);
  if(info?.isDirectory()){file=path.join(file,'index.html');info=await stat(file).catch(()=>null);}
  if(!info?.isFile()){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('文件不存在');return;}
  const headers={'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
  let start=0,end=info.size-1,status=200;
  if(req.headers.range){
   const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!range||(!range[1]&&!range[2])){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return;}
   if(range[1]){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),end):end;}
   else start=Math.max(0,info.size-Number(range[2]));
   if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
  }
  headers['Content-Length']=Math.max(0,end-start+1);res.writeHead(status,headers);
  if(req.method==='HEAD'||info.size===0)res.end();else createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
 }catch(error){if(!res.headersSent)res.writeHead(500);res.end('请求失败');console.error(error.message);}
});
let port;
for(let candidate=firstPort;candidate<firstPort+20;candidate++){
 try{await new Promise((resolve,reject)=>{const failed=error=>{server.off('listening',ready);reject(error);};const ready=()=>{server.off('error',failed);resolve();};server.once('error',failed);server.once('listening',ready);server.listen(candidate,host);});port=candidate;break;}
 catch(error){if(error.code!=='EADDRINUSE')throw error;}
}
if(!port)throw Error('可用端口均被占用，请关闭旧的体验窗口后重试。');
const url=`http://${host}:${port}/`;
console.log(`\n天后宫 · 客户体验版 2026-10-07\n\n体验地址：${url}\n\n请保持此窗口打开。体验结束后按 Ctrl+C 或关闭此窗口。\n`);
if(!noOpen){
 const command=process.platform==='win32'?'cmd.exe':process.platform==='darwin'?'open':'xdg-open';
 const args=process.platform==='win32'?['/d','/s','/c',`start "" "${url}"`]:[url];
 const browser=spawn(command,args,{stdio:'ignore',windowsHide:true});browser.on('error',()=>console.log('请在浏览器中手动打开上方地址。'));browser.unref();
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
