import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const current=JSON.parse(fs.readFileSync('work/private-network-current.json'));
const config=JSON.parse(fs.readFileSync(path.join(current.directory,'nodes.json'))),count=Number(process.argv[2]);assert.ok([1,3].includes(count));
assert.equal(createHash('sha256').update(fs.readFileSync(path.join(config.directory,'genesis.json'))).digest('hex'),config.genesisSha256);
const records=Array.from({length:count},(_,i)=>JSON.parse(fs.readFileSync(path.join(config.directory,'results','create-l1-'+(i+1)+'.json'))));for(const record of records)assert.match(record.subnetID,/^[1-9A-HJ-NP-Za-km-z]{40,55}$/);
const originals=fs.readFileSync(path.join(config.directory,'node-commands.log'),'utf8').trim().split('\n').map(line=>JSON.parse(line)).filter(record=>record.args[0]==='run');assert.equal(originals.length,5);
function docker(args,timeout=10000){const r=spawnSync('docker',args,{encoding:'utf8',timeout,windowsHide:true,maxBuffer:4<<20});fs.appendFileSync(path.join(config.directory,'track-'+count+'-commands.log'),JSON.stringify({at:new Date().toISOString(),args,status:r.status,stdout:r.stdout,stderr:r.stderr})+'\n');assert.equal(r.status,0,r.error?.code||r.stderr);return r.stdout;}
const network=JSON.parse(docker(['network','inspect',config.network]))[0];assert.equal(network.Internal,true);assert.equal(network.Labels['9chain.private-drill'],config.id);
for(let i=0;i<5;i++){
 const name=config.containers[i],before=JSON.parse(docker(['inspect',name]))[0];assert.equal(before.Config.Labels['9chain.private-drill'],config.id);assert.equal(before.State.Running,true);assert.equal(Object.keys(before.HostConfig.PortBindings??{}).length,0);
 const args=originals[i].args;assert.equal(args[args.indexOf('--name')+1],name);
 docker(['stop','--time','30',name],45000);const stopped=JSON.parse(docker(['inspect',name]))[0];assert.equal(stopped.State.ExitCode,0);assert.equal(stopped.State.OOMKilled,false);
 docker(['rename',name,name+'-before-'+count+'-l1s']);
 docker([...args,'--track-subnets='+records.map(r=>r.subnetID).join(',')],20000);
}
const nodes=JSON.parse(docker(['inspect',...config.containers]));assert.ok(nodes.every(n=>n.State.Running&&!n.State.OOMKilled));
fs.writeFileSync(path.join(config.directory,'results','track-'+count+'.json'),JSON.stringify({completedAt:new Date().toISOString(),records,nodes:nodes.map(n=>({name:n.Name,startedAt:n.State.StartedAt,cmd:n.Config.Cmd})),oldContainersRetained:true,stateVolumesRetained:true,scope:'Fresh replacement containers use identical synthetic identities/genesis/state with added tracked subnets; execution must be measured separately.'},null,2)+'\n',{flag:'wx'});
console.log('All5 private nodes restarted to track '+count+' L1s; stopped predecessors and state volumes retained.');
