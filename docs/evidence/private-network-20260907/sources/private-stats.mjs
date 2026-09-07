import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const current=JSON.parse(fs.readFileSync('work/private-network-current.json'));
const config=JSON.parse(fs.readFileSync(path.join(current.directory,'nodes.json')));
const label=process.argv[2];assert.match(label,/^[a-z0-9-]{1,30}$/);
const samples=[];
for(let i=0;i<6;i++){
  const measuredAt=new Date().toISOString();const r=spawnSync('docker',['stats','--no-stream','--format','{{json .}}',...config.containers],{encoding:'utf8',timeout:10000,windowsHide:true});assert.equal(r.status,0,r.stderr);
  const records=r.stdout.trim().split('\n').map(line=>JSON.parse(line));assert.equal(records.length,5);assert.deepEqual(records.map(r=>r.Name).sort(),[...config.containers].sort());
  samples.push({measuredAt,records});fs.writeFileSync(path.join(config.directory,'stats-'+label+'.json'),JSON.stringify({label,scope:'Six Docker stats samples, five co-located capped nodes; not a capacity benchmark.',samples},null,2)+'\n');
  if(i<5)await new Promise(resolve=>setTimeout(resolve,10000));
}
console.log('Recorded6 five-node samples: '+label);
