import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const current=JSON.parse(fs.readFileSync('work/private-network-current.json'));
const directory=current.directory,read=name=>JSON.parse(fs.readFileSync(path.join(directory,name)));
const median=values=>{const sorted=[...values].sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;};
const describe=values=>({samples:values.length,min:Math.min(...values),median:median(values),max:Math.max(...values)});
function mib(raw){const match=raw.match(/^([0-9.]+)([KMGT]?i?B)/);assert.ok(match);const scale={B:1/1048576,KiB:1/1024,MiB:1,GiB:1024,TiB:1048576,kB:1000/1048576,MB:1000000/1048576,GB:1000000000/1048576};assert.ok(Object.hasOwn(scale,match[2]));return Number(match[1])*scale[match[2]];}
const resources=[];
for(const label of ['baseline','one-l1','three-l1']){const report=read('stats-'+label+'.json');assert.equal(report.samples.length,6);for(const sample of report.samples)assert.equal(sample.records.length,5);resources.push({label,startedAt:report.samples[0].measuredAt,finishedAt:report.samples.at(-1).measuredAt,totalNodeMemoryMiB:describe(report.samples.map(s=>s.records.reduce((sum,r)=>sum+mib(r.MemUsage),0))),totalNodeCpuPercentOfOneCore:describe(report.samples.map(s=>s.records.reduce((sum,r)=>sum+Number(r.CPUPerc.replace('%','')),0))),totalNodePids:describe(report.samples.map(s=>s.records.reduce((sum,r)=>sum+Number(r.PIDs),0)))});}
const latencies=[];
for(const [name,file] of [['C-all-five','transfer.json'],['C-four-active','transfer-outage.json'],['three-L1s-all-five','results/l1-transfer.json'],['three-L1s-four-active','results/l1-transfer-outage.json']]){if(!fs.existsSync(path.join(directory,file)))continue;const data=read(file).result,records=data.records??data.chains.flatMap(c=>c.records);latencies.push({name,count:records.length,confirmationNodes:[...new Set(records.map(r=>r.confirmedBy))],broadcastToObservedReceiptsMs:describe(records.map(r=>r.broadcastToAllReceiptsMs))});}
const report={generatedAt:new Date().toISOString(),fixture:current.prefix,resources,latencies,scope:'Six short, correlated Docker stats samples per phase on one shared host. Includes node cgroups and VM children, excludes host overhead and client/wallet helpers. Different lifecycle/load histories; no throughput maximum, WAN/Byzantine test, marginal-cost isolation or billion-chain extrapolation.'};
fs.writeFileSync(path.join(directory,'results','measurement-summary.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
