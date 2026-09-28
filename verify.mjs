import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const manifest=JSON.parse(await readFile(new URL('./release-manifest.json',import.meta.url),'utf8'));
let checked=0;
for(const file of manifest.files){const data=await readFile(new URL(file.path,import.meta.url));const hash=createHash('sha256').update(data).digest('hex');if(data.length!==file.bytes||hash!==file.sha256)throw Error(`文件校验失败：${file.path}`);checked++;}
console.log(`PASS: ${checked} 个文件全部通过 SHA-256 校验。`);
