import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const current=JSON.parse(fs.readFileSync('work/private-network-current.json'));
const config=JSON.parse(fs.readFileSync(path.join(current.directory,'nodes.json'))),node=config.containers[4],action=process.argv[2];
assert.ok(['stop','start'].includes(action));assert.match(node,/^a1-private-[a-f0-9]{8}-node5$/);
function docker(args,timeout=10000){const result=spawnSync('docker',args,{encoding:'utf8',timeout,windowsHide:true});assert.equal(result.status,0,result.stderr);return result.stdout;}
const before=JSON.parse(docker(['inspect',node]))[0];assert.equal(before.Config.Labels['9chain.private-drill'],config.id);assert.deepEqual(Object.keys(before.NetworkSettings.Networks),[config.network]);assert.equal(Object.keys(before.HostConfig.PortBindings??{}).length,0);
assert.equal(before.State.Running,action==='stop');
const startedAt=new Date().toISOString();docker(action==='stop'?['stop','--time','30',node]:['start',node],45000);
const after=JSON.parse(docker(['inspect',node]))[0];assert.equal(after.State.Running,action==='start');assert.equal(after.State.OOMKilled,false);if(action==='stop')assert.equal(after.State.ExitCode,0);
fs.writeFileSync(path.join(config.directory,'outage-'+action+'.json'),JSON.stringify({node,startedAt,completedAt:new Date().toISOString(),before:before.State,after:after.State},null,2)+'\n');console.log('Private node5 '+action+' completed; state retained.');
