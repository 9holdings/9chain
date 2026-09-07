import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const current=JSON.parse(fs.readFileSync('work/private-network-current.json'));
const config=JSON.parse(fs.readFileSync(path.join(current.directory,'nodes.json')));
assert.equal(createHash('sha256').update(fs.readFileSync(path.join(config.directory,'genesis.json'))).digest('hex'),config.genesisSha256,'Synthetic parent genesis must remain exact');
const resultsDirectory=path.join(config.directory,'results');fs.mkdirSync(resultsDirectory,{recursive:true});
const mode=process.argv[2];assert.ok(['ready','unavailable','transfer','transfer-outage','recover','fund','fund-status','genesis','l1-untracked','l1-ready','l1-transfer','l1-transfer-outage','l1-recover','inventory'].includes(mode));
const inspected=spawnSync('docker',['network','inspect',config.network],{encoding:'utf8',timeout:10000,windowsHide:true});assert.equal(inspected.status,0);
const network=JSON.parse(inspected.stdout)[0];assert.equal(network.Internal,true);assert.equal(network.Labels['9chain.private-drill'],config.id);
const name=config.prefix+'-'+mode+'-'+Date.now();
const sourceSha256=createHash('sha256').update(fs.readFileSync('work/private-network-client.mjs')).digest('hex'),startedAt=new Date().toISOString();
const result=spawnSync('docker',['run','--name',name,'--label','9chain.private-drill='+config.id,'--network',config.network,'--read-only','--cap-drop=ALL','--security-opt','no-new-privileges:true','--memory','256m','--cpus','1','--pids-limit','60','--tmpfs','/tmp:rw,nosuid,size=32m','--mount','type=bind,source='+config.directory+',target=/inputs,readonly','--mount','type=bind,source='+path.join(process.cwd(),'work/private-network-client.mjs')+',target=/client.mjs,readonly','--mount','type=volume,source='+config.volume+',target=/material,volume-subpath=material,readonly','9chain-a1/console-deployment-fixture:node24','timeout','240','node','/client.mjs',mode],{encoding:'utf8',timeout:255000,windowsHide:true,maxBuffer:4<<20});
fs.writeFileSync(path.join(resultsDirectory,mode+'.json'),result.stdout||'');fs.writeFileSync(path.join(resultsDirectory,mode+'.error.log'),result.stderr||'');
fs.writeFileSync(path.join(resultsDirectory,name+'.json'),JSON.stringify({mode,name,sourceSha256,startedAt,finishedAt:new Date().toISOString(),exitCode:result.status,error:result.error?.code,stdout:result.stdout,stderr:result.stderr},null,2)+'\n',{flag:'wx'});
assert.equal(createHash('sha256').update(fs.readFileSync(path.join(config.directory,'genesis.json'))).digest('hex'),config.genesisSha256,'Synthetic parent genesis changed during the probe');
if(result.status!==0||result.error){spawnSync('docker',['stop','--time','2',name],{timeout:10000,windowsHide:true});console.error('Private client failed: '+mode+'; '+(result.error?.code||result.status));console.error(result.stderr);process.exitCode=1;}
else {const report=JSON.parse(result.stdout);console.log(JSON.stringify({mode,container:name,observedAt:report.observedAt,nodes:report.result.nodes?.length??report.result.initial?.nodes.length,transfers:report.result.records?.length,recovered:report.result.recoveredAllFive,report:path.join(resultsDirectory,mode+'.json')}));}
