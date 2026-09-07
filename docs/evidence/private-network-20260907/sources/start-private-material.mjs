import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
const id = randomUUID().slice(0,8), prefix = 'a1-private-' + id;
const directory=fs.mkdtempSync(path.join(process.cwd(),'work/private-network-'));
const config={id,prefix,directory,volume:prefix+'-material',builder:prefix+'-netgen',network:prefix+'-net',subnet:'172.29.207.0/24',nodes:5,networkID:899999998,parentChainID:9000000909,startedAt:new Date().toISOString()};
fs.writeFileSync('work/private-network-current.json',JSON.stringify(config,null,2)+'\n');
fs.writeFileSync(path.join(directory,'config.json'),JSON.stringify(config,null,2)+'\n');
function docker(args,timeout=10000){const r=spawnSync('docker',args,{encoding:'utf8',timeout,windowsHide:true,maxBuffer:2<<20}); fs.appendFileSync(path.join(directory,'commands.log'),JSON.stringify({args,status:r.status,error:r.error?.code,stdout:r.stdout,stderr:r.stderr})+'\n');assert.equal(r.status,0,r.error?.message||r.stderr);return r.stdout;}
docker(['volume','create','--label','9chain.private-drill='+id,config.volume]);
const image='golang@sha256:154bd7001b6eb339e88c964442c0ad6ed5e53f09844cc818a41ce4ecb3ce3b43';
console.log('Preparing fresh private fixture: '+prefix);
const output=docker(['run','--name',config.builder,'--label','9chain.private-drill='+id,'--network','none','--read-only','--cap-drop=ALL','--security-opt','no-new-privileges:true','--memory','6g','--cpus','4','--pids-limit','250','--mount','type=volume,source=a1-autopilot-cold-build-20260906,target=/cold,readonly','--mount','type=volume,source='+config.volume+',target=/fixture','--mount','type=bind,source='+path.join(process.cwd(),'work/private-netgen.sh')+',target=/runner.sh,readonly','-w','/cold/source',image,'timeout','300','bash','/runner.sh'],320000);
fs.writeFileSync(path.join(directory,'netgen.log'),output);
console.log('Fresh synthetic material created; private keys remain only in the new labeled Docker volume. '+directory);
