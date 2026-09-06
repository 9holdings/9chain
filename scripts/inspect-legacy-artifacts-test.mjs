#!/usr/bin/env node
// Actual CLI, bounded real files and a read-only HTTP fixture. No real secrets.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { cb58Encode } from '../local-net/lib/cb58.mjs';
import { inspectionRpc } from '../local-net/lib/inspection-rpc.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));fs.mkdirSync(path.join(root,'work'),{recursive:true});
const scratch=fs.mkdtempSync(path.join(root,'work/legacy-artifacts-test-'));
const id=value=>cb58Encode(Buffer.alloc(32,value)), blockchainID=id(1),subnetID=id(2),vmID=id(3),primary=id(0);
const marker='PrivateKey-synthetic-legacy-artifact-marker',chainId=9001000007;
const genesis=JSON.stringify({config:{chainId},alloc:{['0'.repeat(40)]:{balance:'1'}},unusedSecret:marker})+'\n';
const record=()=>({name:'Legacy Chain',chainId,blockchainID,subnetID,rpc:'http://never-contact.invalid',admin:marker});
let scenario='',calls=[],directory,mutated=false,redirects=0,expectedGenesis=genesis,scopedTxIds=new Set([blockchainID]);
const allowed=new Set(['info.getNetworkID','info.getNetworkName','platform.getTxStatus','platform.getTx']);
const server=createServer(async(req,res)=>{
  if(req.url==='/redirect-target'){redirects++;res.end('must not follow');return;}
  let body='';for await(const chunk of req)body+=chunk;const{method,params,id:requestId}=JSON.parse(body);calls.push({method,params,path:req.url});
  if(!allowed.has(method)){res.writeHead(500);res.end('Unsupported method');return;}
  if(scenario==='header-timeout')return;
  if(scenario==='body-timeout'){res.writeHead(200,{'content-type':'application/json'});res.write('{');return;}
  if(scenario==='redirect'){res.writeHead(302,{location:'/redirect-target'});res.end();return;}
  if(!mutated&&['artifact-changed','ledger-changed','new-artifact','new-journal'].includes(scenario)){
    mutated=true;
    if(scenario==='artifact-changed')fs.appendFileSync(path.join(directory,'console-tmp/Legacy_Chain.json'),' ');
    if(scenario==='ledger-changed')fs.appendFileSync(path.join(directory,'console-chains.json'),' ');
    if(scenario==='new-artifact')fs.writeFileSync(path.join(directory,'console-tmp/New_Artifact.json'),genesis);
    if(scenario==='new-journal'){fs.mkdirSync(path.join(directory,'creation-journal'));fs.writeFileSync(path.join(directory,'creation-journal/pending.json'),marker);}
  }
  const send=value=>{
    if(scenario==='http201'){res.writeHead(201,{'content-type':'application/json'});res.end(JSON.stringify({jsonrpc:'2.0',id:requestId,result:value}));return;}
    if(scenario==='http503'){res.writeHead(503);res.end(marker);return;}
    if(scenario==='wrong-content-type'){res.writeHead(200,{'content-type':'text/plain'});res.end(marker);return;}
    res.writeHead(200,{'content-type':'application/json'});
    if(scenario==='invalid-json'){res.end('{'+marker);return;}
    if(scenario==='rpc-error'){res.end(JSON.stringify({jsonrpc:'2.0',id:requestId,error:{code:-1,message:marker}}));return;}
    res.end(JSON.stringify({jsonrpc:'2.0',id:scenario==='wrong-response-id'?2:requestId,result:value,unknown:marker}));
  };
  const afterTx=calls.some(call=>call.method==='platform.getTx');
  if(method==='info.getNetworkID'){send({networkID:scenario==='wrong-network'||scenario==='changed-network'&&afterTx?1:
    scenario==='bad-network-type'?[999999998]:'999999998'});return;}
  if(method==='info.getNetworkName'){send({networkName:scenario==='wrong-network-name'?'9chain-a1':'9chain-a1-g1'});return;}
  if(scenario==='total-rpc-budget')return;
  if(scenario==='tx-header-timeout')return;
  if(scenario==='tx-body-timeout'){res.writeHead(200,{'content-type':'application/json'});res.write('{');return;}
  if(method==='platform.getTxStatus'){send({status:scenario==='unknown-tx'?'Unknown':scenario==='processing-tx'?'Processing':scenario==='dropped-tx'?'Dropped':'Committed'});return;}
  const value={encoding:'json',tx:{id:blockchainID,unsignedTx:{networkID:999999998,blockchainID:primary,subnetID,vmID,chainName:'Legacy Chain',
    genesisData:Buffer.from(expectedGenesis).toString('base64')},credentials:[{unusedSecret:marker}]}};
  if(scenario==='wrong-tx-id')value.tx.id=id(4);
  if(scenario==='wrong-subnet')value.tx.unsignedTx.subnetID=id(4);
  if(scenario==='wrong-tx-network')value.tx.unsignedTx.networkID=1;
  if(scenario==='bad-tx-network-type')value.tx.unsignedTx.networkID=[999999998];
  if(scenario==='wrong-parent')value.tx.unsignedTx.blockchainID=id(4);
  if(scenario==='wrong-name')value.tx.unsignedTx.chainName='Other Chain';
  if(scenario==='invalid-vm')value.tx.unsignedTx.vmID=marker;
  if(scenario==='wrong-vm')value.tx.unsignedTx.vmID=id(4);
  if(scenario==='wrong-encoding')value.encoding='hex';
  if(scenario==='missing-tx')delete value.tx;
  if(scenario==='different-genesis')value.tx.unsignedTx.genesisData=Buffer.from(genesis+' ').toString('base64');
  if(scenario==='equivalent-genesis')value.tx.unsignedTx.genesisData=Buffer.from(JSON.stringify(JSON.parse(genesis),null,2)).toString('base64');
  if(scenario==='invalid-base64')value.tx.unsignedTx.genesisData='bad%'+marker;
  if(scenario==='empty-genesis')value.tx.unsignedTx.genesisData='';
  if(scenario==='oversized-genesis')value.tx.unsignedTx.genesisData=Buffer.alloc(4*1024*1024+1,32).toString('base64');
  if(scenario==='oversized-rpc')value.extra='x'.repeat(8*1024*1024);
  send(value);
});
server.listen(0,'127.0.0.1');await once(server,'listening');const origin=`http://127.0.0.1:${server.address().port}`;
const children=new Set();process.on('exit',()=>{for(const child of children)child.kill();});
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
function files(dir){
  const result={};for(const entry of fs.readdirSync(dir,{recursive:true,withFileTypes:true})){
    const file=path.join(entry.parentPath,entry.name),relative=path.relative(dir,file);
    result[relative]=entry.isFile()?digest(fs.readFileSync(file)):entry.isSymbolicLink()?'link':'directory';
  }return result;
}
async function cli(args,preload,maxMs=20000){
  const child=spawn(process.execPath,[...(preload?['--import',pathToFileURL(preload).href]:[]),path.join(root,'scripts/inspect-legacy-artifacts.mjs'),...args],
    {cwd:scratch,windowsHide:true,stdio:['ignore','pipe','pipe']});children.add(child);let stdout='',stderr='';
  child.stdout.on('data',value=>{stdout+=value;});child.stderr.on('data',value=>{stderr+=value;});
  const timer=setTimeout(()=>child.kill(),maxMs);
  try{const[code,signal]=await once(child,'close');assert.equal(signal,null,'CLI exceeded independent deadline');
    return{code,stdout,stderr,report:stdout.trim().startsWith('{')?JSON.parse(stdout):null};}
  finally{clearTimeout(timer);children.delete(child);}
}
let checks=0;
async function check(label,{expected=0,code,rpc=true,change,preload}={}){
  scenario=label;calls=[];mutated=false;expectedGenesis=genesis;scopedTxIds=new Set([blockchainID]);
  directory=fs.mkdtempSync(path.join(scratch,'case-'));fs.mkdirSync(path.join(directory,'console-tmp'));
  fs.writeFileSync(path.join(directory,'console-chains.json'),JSON.stringify({chains:[record()],retired:[]}));
  fs.writeFileSync(path.join(directory,'console-tmp/Legacy_Chain.json'),genesis);
  if(change)change(directory);
  const before=files(directory),started=Date.now();
  const result=await cli(['--config-dir',directory,...(rpc?['--rpc',origin]:[]),'--timeout-ms',label==='total-rpc-budget'?'5000':label.startsWith('oversized-')?'2000':'250'],preload,label==='total-rpc-budget'?40000:20000);
  assert.equal(result.code,expected,label+': '+result.stderr+result.stdout);assert.equal(result.report.recoveryAuthorized,false);
  assert.equal(result.stdout.includes(marker),false,'raw genesis, allocations, ledger extras or RPC errors must not escape');
  assert.equal(result.stdout.includes('genesisData'),false,'raw transaction field must not escape');
  if(code)assert.ok(result.report.checks.some(check=>check.code===code),label+': missing '+code);
  assert.ok(calls.every(call=>allowed.has(call.method)&&call.path===(call.method.startsWith('info.')?'/ext/info':'/ext/bc/P')));
  assert.ok(calls.filter(call=>call.method.startsWith('platform.')).every(call=>scopedTxIds.has(call.params.txID)),'only ledger-scoped candidate transaction reads');
  if(!rpc||code==='primary_ledger_unavailable'||code==='network_identity_unavailable_or_mismatch')assert.equal(calls.filter(call=>call.method.startsWith('platform.')).length,0);
  if(!rpc)assert.equal(calls.length,0,'default local mode sends no RPC');
  if(!['artifact-changed','ledger-changed','new-artifact','new-journal'].includes(label))assert.deepEqual(files(directory),before,'inspector changed evidence');
  if(label.includes('timeout'))assert.ok(Date.now()-started<3500,'header/body deadline was not enforced');
  if(label==='total-rpc-budget'){assert.ok(Date.now()-started>=28000&&Date.now()-started<33500,'total RPC budget was not enforced');assert.ok(calls.length<=38,'no fresh batch after global deadline');}
  if(code==='rpc_candidate_limit_exceeded')assert.equal(calls.length,0,'candidate cap must stop before network');
  if(label==='matched'){assert.equal(result.report.verdict,'matched');assert.equal(result.report.counts.matched,1);assert.equal(result.report.candidates[0].registeredGenesisSha256,digest(genesis));}
  if(label==='local-only'){assert.equal(result.report.verdict,'inventory_only');assert.equal(result.report.candidates[0].status,'unverified');}
  if(label==='no-current-candidates')assert.equal(result.report.verdict,'no_current_candidates');
  checks++;console.log('PASS: '+label);return result;
}
const writeLedger=(dir,value)=>fs.writeFileSync(path.join(dir,'console-chains.json'),JSON.stringify(value));
const writeGenesis=(dir,value)=>fs.writeFileSync(path.join(dir,'console-tmp/Legacy_Chain.json'),typeof value==='string'?value:JSON.stringify(value));
function sizedGenesis(size){const value={config:{chainId},alloc:{},padding:''};value.padding='x'.repeat(size-Buffer.byteLength(JSON.stringify(value)));return Buffer.from(JSON.stringify(value));}
function manyCandidates(dir,count){
  fs.renameSync(path.join(dir,'console-tmp/Legacy_Chain.json'),path.join(dir,'retained-genesis.json'));
  const chains=Array.from({length:count},(_,index)=>({...record(),name:'Budget Chain '+index,chainId:9001001000+index,blockchainID:id(index+10)}));
  scopedTxIds=new Set(chains.map(chain=>chain.blockchainID));writeLedger(dir,{chains,retired:[]});
  for(const chain of chains)fs.writeFileSync(path.join(dir,'console-tmp/Chain_'+chain.chainId+'.json'),JSON.stringify({config:{chainId:chain.chainId},alloc:{}}));
}
try{
  await check('matched');await check('local-only',{rpc:false});
  await check('outside-band-retained',{change:dir=>fs.writeFileSync(path.join(dir,'console-tmp/Historical.json'),JSON.stringify({config:{chainId:9100},alloc:{}}))});
  await check('no-current-candidates',{change:dir=>{writeLedger(dir,{chains:[],retired:[]});writeGenesis(dir,{config:{chainId:9100},alloc:{}});}});
  await check('retired-current-artifact',{change:dir=>writeLedger(dir,{chains:[],retired:[record()]})});
  await check('unlisted-artifact',{expected:1,code:'unlisted_artifact',change:dir=>writeLedger(dir,{chains:[],retired:[]})});
  await check('duplicate-artifact',{expected:1,code:'duplicate_artifact_identity',change:dir=>fs.writeFileSync(path.join(dir,'console-tmp/Duplicate.json'),genesis)});
  await check('duplicate-ledger',{expected:1,code:'duplicate_ledger_identity',change:dir=>writeLedger(dir,{chains:[record(),record()],retired:[]})});
  await check('missing-active-genesis',{expected:1,code:'active_genesis_artifact_missing',change:dir=>fs.renameSync(path.join(dir,'console-tmp/Legacy_Chain.json'),path.join(dir,'retained-genesis.json'))});
  await check('active-outside-band',{expected:1,code:'active_chain_outside_band',change:dir=>{writeLedger(dir,{chains:[{...record(),chainId:9100}],retired:[]});writeGenesis(dir,{config:{chainId:9100},alloc:{}});}});
  for(const label of ['different-genesis','equivalent-genesis'])await check(label,{expected:1,code:'genesis_bytes_mismatch'});
  for(const label of ['wrong-tx-id','wrong-subnet','wrong-tx-network','bad-tx-network-type','wrong-parent','wrong-name','invalid-vm','wrong-encoding','missing-tx'])await check(label,{expected:1,code:'transaction_identity_mismatch'});
  await check('wrong-vm',{expected:1,code:'transaction_identity_mismatch',change:dir=>writeLedger(dir,{chains:[{...record(),vmID}],retired:[]})});
  for(const label of ['unknown-tx','processing-tx','dropped-tx'])await check(label,{expected:2,code:'transaction_not_confirmed'});
  for(const label of ['invalid-base64','empty-genesis','oversized-genesis','oversized-rpc','tx-header-timeout','tx-body-timeout'])await check(label,{expected:2,code:'transaction_unavailable_or_invalid'});
  for(const label of ['wrong-network','bad-network-type','wrong-network-name','header-timeout','body-timeout','redirect','http201','http503','wrong-content-type','invalid-json','rpc-error','wrong-response-id'])await check(label,{expected:2,code:'network_identity_unavailable_or_mismatch'});
  await check('changed-network',{expected:2,code:'network_identity_changed'});
  for(const label of ['artifact-changed','ledger-changed','new-artifact','new-journal'])await check(label,{expected:2,code:'artifacts_changed'});
  for(const [label,value] of [['bad-genesis-json','{'+marker],['bad-chain-id',{config:{chainId:[chainId]},alloc:{}}],
    ['bad-alloc',{config:{chainId},alloc:[]}],['missing-config',{alloc:{}}]])await check(label,{expected:2,code:'artifact_unreadable_or_invalid',rpc:false,change:dir=>writeGenesis(dir,value)});
  await check('invalid-primary-ledger',{expected:2,code:'primary_ledger_unavailable',change:dir=>fs.writeFileSync(path.join(dir,'console-chains.json'),'{'+marker)});
  await check('missing-primary-ledger',{expected:2,code:'primary_ledger_unavailable',change:dir=>fs.renameSync(path.join(dir,'console-chains.json'),path.join(dir,'retained-ledger.json'))});
  await check('incomplete-primary-ledger',{expected:2,code:'primary_ledger_unavailable',change:dir=>writeLedger(dir,{chains:[{name:'Incomplete'}]})});
  for(const name of ['console-chains.json.tmp','console-chains.json.bak.tmp','creation-journal/pending.json','creation-journal/pending.json.tmp']){
    await check('recovery-artifact-'+name,{expected:1,code:'recovery_artifact_present',rpc:false,change:dir=>{const target=path.join(dir,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,marker);}});
  }
  await check('backup-is-only-metadata',{rpc:false,change:dir=>fs.writeFileSync(path.join(dir,'console-chains.json.bak'),marker)});
  await check('unknown-file',{expected:2,code:'artifact_unreadable_or_invalid',rpc:false,change:dir=>fs.writeFileSync(path.join(dir,'console-tmp/secret.env'),marker)});
  await check('nested-directory',{expected:2,code:'artifact_unreadable_or_invalid',rpc:false,change:dir=>fs.mkdirSync(path.join(dir,'console-tmp/Nested.json'))});
  await check('oversized-file',{expected:2,code:'artifact_unreadable_or_invalid',rpc:false,change:dir=>fs.writeFileSync(path.join(dir,'console-tmp/Legacy_Chain.json'),sizedGenesis(4*1024*1024+1))});
  await check('too-many-files',{expected:2,code:'artifact_unreadable_or_invalid',rpc:false,change:dir=>{for(let index=0;index<1024;index++)fs.writeFileSync(path.join(dir,'console-tmp/Extra'+index+'.json'),genesis);}});
  await check('too-many-ledger-entries',{expected:2,code:'primary_ledger_unavailable',rpc:false,change:dir=>writeLedger(dir,{chains:Array(1025).fill(record()),retired:[]})});
  await check('aggregate-byte-limit',{expected:2,code:'artifact_unreadable_or_invalid',rpc:false,change:dir=>{
    const bytes=sizedGenesis(4*1024*1024);assert.equal(bytes.length,4*1024*1024);
    for(let index=0;index<33;index++)fs.writeFileSync(path.join(dir,'console-tmp/Large'+index+'.json'),bytes);
  }});
  await check('rpc-candidate-limit',{expected:2,code:'rpc_candidate_limit_exceeded',change:dir=>manyCandidates(dir,129)});
  await check('total-rpc-budget',{expected:2,code:'network_identity_changed',change:dir=>manyCandidates(dir,21)});
  if(process.platform!=='win32')await check('fifo-refused',{expected:2,code:'artifact_unreadable_or_invalid',rpc:false,change:dir=>{const result=spawnSync('mkfifo',[path.join(dir,'console-tmp/Pipe.json')]);assert.equal(result.status,0);}});
  assert.equal(redirects,0,'redirect target contacted');
  await check('clean-input-for-arguments',{rpc:false});
  const goodDirectory=directory,linked=path.join(scratch,'linked');fs.symlinkSync(goodDirectory,linked,process.platform==='win32'?'junction':'dir');
  const linkedResult=await cli(['--config-dir',linked]);assert.equal(linkedResult.code,2);assert.ok(linkedResult.report.checks.some(check=>check.code==='config_directory_unreadable'));checks++;
  const unknownRead=path.join(scratch,'unknown-read.log'),preload=path.join(scratch,'read-spy.mjs');
  fs.writeFileSync(preload,"import fs from 'node:fs';const original=fs.openSync;fs.openSync=function(file,...args){if(String(file).endsWith('secret.env'))fs.writeFileSync("+JSON.stringify(unknownRead)+",'unexpected read');return original.call(fs,file,...args);};\n");
  await check('unknown-file-never-opened',{expected:2,code:'artifact_unreadable_or_invalid',rpc:false,preload,change:dir=>fs.writeFileSync(path.join(dir,'console-tmp/secret.env'),marker)});
  assert.equal(fs.existsSync(unknownRead),false,'unrecognized artifact was opened');
  const readFault=path.join(scratch,'read-fault.mjs');
  fs.writeFileSync(readFault,"import fs from 'node:fs';const open=fs.openSync,read=fs.readSync;const targets=new Set();fs.openSync=function(file,...args){const fd=open.call(fs,file,...args);if(String(file).endsWith('Legacy_Chain.json'))targets.add(fd);return fd;};fs.readSync=function(fd,...args){if(targets.has(fd))throw new Error('"+marker+"');return read.call(fs,fd,...args);};\n");
  await check('file-read-fault',{expected:2,code:'artifact_unreadable_or_invalid',rpc:false,preload:readFault});
  for(const args of [[],['--config-dir'],['--config-dir',goodDirectory,'--apply'],['--config-dir',goodDirectory,'--config-dir',goodDirectory],
    ...['0','1.5','NaN','10001'].map(value=>['--config-dir',goodDirectory,'--timeout-ms',value]),
    ...['file:///x','http://user:pass@host.invalid','http://host.invalid/path','http://host.invalid/?x=1','http://host.invalid/#x'].map(url=>['--config-dir',goodDirectory,'--rpc',url])]){
    calls=[];const result=await cli(args);assert.equal(result.code,2);assert.equal(result.report,null);assert.match(result.stderr,/Usage:/);assert.equal(calls.length,0);checks++;
  }
  calls=[];
  for(const method of ['platform.issueTx','eth_sendRawTransaction','info.unlisted'])await assert.rejects(inspectionRpc(origin,method,{}),/allowed read/);
  for(const options of [{timeoutMs:0},{timeoutMs:10001},{maxResponseBytes:0},{maxResponseBytes:8*1024*1024+1}])await assert.rejects(inspectionRpc(origin,'info.getNetworkID',{},options),/bounds/);
  assert.equal(calls.length,0);checks+=7;
  scenario='oversized-rpc';expectedGenesis=genesis;
  await assert.rejects(inspectionRpc(origin,'platform.getTx',{txID:blockchainID,encoding:'json'},{timeoutMs:5000,maxResponseBytes:8*1024*1024}),/bound/);checks++;
  console.log('PASS: '+checks+' legacy artifact CLI/file/HTTP and read-method controls; byte identity, pending evidence, bounds and no recovery authorization');
}catch(error){console.error(error.stack);process.exitCode=1;}
finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));console.log('Legacy artifact fixtures retained: '+scratch);}
