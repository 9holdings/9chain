import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Wallet} from '/opt/deployment-fixture/node_modules/ethers/lib.esm/index.js';
const config=JSON.parse(fs.readFileSync('/inputs/nodes.json'));
const mode=process.argv[2];
assert.match(config.prefix,/^a1-private-[a-f0-9]{8}$/);
assert.equal(config.networkID,899999998);assert.equal(config.parentChainID,9000000909);
assert.equal(config.nodes,5);assert.equal(config.nodeIDs.length,5);
const all=config.containers,active=mode.endsWith('-outage')?all.slice(0,4):all;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let requestID=0;
async function rpc(node,route,method,params={}){
  const id=++requestID;
  const response=await fetch('http://'+node+':9650'+route,{method:'POST',redirect:'error',headers:{'content-type':'application/json','connection':'close'},body:JSON.stringify({jsonrpc:'2.0',id,method,params}),signal:AbortSignal.timeout(4000)});
  assert.equal(response.status,200,'RPC status '+response.status);
  assert.match(response.headers.get('content-type')||'',/application\/json/);
  const chunks=[];let size=0;
  for await(const chunk of response.body){size+=chunk.length;assert.ok(size<=1048576,'RPC byte limit');chunks.push(chunk);}
  const envelope=JSON.parse(Buffer.concat(chunks));assert.equal(envelope.id,id);assert.equal(envelope.jsonrpc,'2.0');
  if(envelope.error)throw new Error('RPC returned error '+envelope.error.code+' for '+method);
  assert.ok(Object.hasOwn(envelope,'result'));return envelope.result;
}
async function identity(node,index){
  const [network,name,id,version,chain,validators,...boot]=await Promise.all([
    rpc(node,'/ext/info','info.getNetworkID'),rpc(node,'/ext/info','info.getNetworkName'),rpc(node,'/ext/info','info.getNodeID'),rpc(node,'/ext/info','info.getNodeVersion'),rpc(node,'/ext/bc/C/rpc','eth_chainId',[]),rpc(node,'/ext/bc/P','platform.getCurrentValidators'),...['P','X','C'].map(chain=>rpc(node,'/ext/info','info.isBootstrapped',{chain}))]);
  assert.equal(Number(network.networkID),899999998);assert.equal(name.networkName,'9chain-a1-tap-g1');assert.equal(id.nodeID,config.nodeIDs[index]);
  assert.equal(version.gitCommit,'9chain-a1-g1-27patch-38723877');assert.equal(BigInt(chain),9000000909n);
  assert.deepEqual(validators.validators.map(v=>v.nodeID).sort(),[...config.nodeIDs].sort());
  assert.ok(validators.validators.every(v=>BigInt(v.weight)>0n));assert.ok(boot.every(result=>result.isBootstrapped===true));
  return {node,nodeID:id.nodeID,networkID:Number(network.networkID),networkName:name.networkName,version,chainID:Number(BigInt(chain)),validators:validators.validators.map(v=>({nodeID:v.nodeID,weight:v.weight})),bootstrapped:true};
}
async function ready(nodes=active,budget=180000){
  const start=Date.now();let rounds=0,last=[];
  while(Date.now()-start<budget){rounds++; const settled=await Promise.allSettled(nodes.map((node,index)=>identity(node,index)));last=settled.filter(r=>r.status==='rejected').map(r=>r.reason.message);
    if(!last.length){const health=await Promise.all(nodes.map(node=>rpc(node,'/ext/health','health.health')));if(health.every(h=>h.healthy===true))return {elapsedMs:Date.now()-start,rounds,nodes:settled.map(r=>r.value)};}
    await delay(1000);
  }
  throw new Error('Private readiness deadline: '+last.slice(0,2).join('; '));
}
async function receipts(nodes,hash,budget=60000,route='/ext/bc/C/rpc'){
  const start=Date.now();
  while(Date.now()-start<budget){
    const observed=await Promise.all(nodes.map(node=>rpc(node,route,'eth_getTransactionReceipt',[hash])));
    if(observed.every(Boolean)){const first=observed[0];assert.equal(first.transactionHash,hash);assert.equal(BigInt(first.status),1n);for(const item of observed){assert.equal(item.transactionHash,hash);assert.equal(item.status,first.status);assert.equal(item.blockHash,first.blockHash);assert.equal(item.blockNumber,first.blockNumber);}return {transactionHash:hash,blockHash:first.blockHash,blockNumber:first.blockNumber,confirmedBy:nodes.length,elapsedMs:Date.now()-start};}
    await delay(250);
  }
  throw new Error('Private transaction receipt deadline');
}
async function transfers(){
  const initial=await ready();
  const env=fs.readFileSync('/material/faucet.env','utf8');const match=env.match(/^FAUCET_PK=(0x[a-fA-F0-9]{64})$/m);assert.ok(match,'Synthetic faucet key missing');
  const signer=new Wallet(match[1]),recipient=Wallet.createRandom().address;
  const startNonce=BigInt(await rpc(active[0],'/ext/bc/C/rpc','eth_getTransactionCount',[signer.address,'pending']));
  const records=[],amount=1000000000n;
  for(let i=0;i<10;i++){
    const gasPrice=BigInt(await rpc(active[0],'/ext/bc/C/rpc','eth_gasPrice',[]));
    const raw=await signer.signTransaction({type:0,chainId:9000000909n,nonce:Number(startNonce)+i,gasLimit:21000n,gasPrice,to:recipient,value:amount});
    const start=Date.now(); const hash=await rpc(active[0],'/ext/bc/C/rpc','eth_sendRawTransaction',[raw]);assert.match(hash,/^0x[a-f0-9]{64}$/);
    const receipt=await receipts(active,hash);records.push({...receipt,broadcastToAllReceiptsMs:Date.now()-start});
  }
  const balances=await Promise.all(active.map(node=>rpc(node,'/ext/bc/C/rpc','eth_getBalance',[recipient,'latest'])));
  assert.ok(balances.every(value=>BigInt(value)===amount*10n));
  return {initial,recipient,amountWei:String(amount),totalWei:String(amount*10n),records,balances,scope:'Ten sequential private transfers; observed confirmation latency, not throughput capacity.'};
}
function registeredL1s(){const list=[];for(let i=1;i<=3;i++){const file='/inputs/results/create-l1-'+i+'.json';if(!fs.existsSync(file))continue;const item=JSON.parse(fs.readFileSync(file));assert.equal(item.chainID,8999900000+i);assert.match(item.blockchainID,/^[1-9A-HJ-NP-Za-km-z]{40,55}$/);assert.match(item.subnetID,/^[1-9A-HJ-NP-Za-km-z]{40,55}$/);list.push(item);}assert.ok(list.length);return list;}
async function l1State(record,nodes=all){
  const observations=await Promise.all(nodes.map(async node=>{const [id,genesis,validators]=await Promise.all([rpc(node,'/ext/bc/'+record.blockchainID+'/rpc','eth_chainId',[]),rpc(node,'/ext/bc/'+record.blockchainID+'/rpc','eth_getBlockByNumber',['0x0',false]),rpc(node,'/ext/bc/P','platform.getCurrentValidators',{subnetID:record.subnetID})]);assert.equal(BigInt(id),BigInt(record.chainID));assert.ok(genesis?.hash);assert.deepEqual(validators.validators.map(v=>v.nodeID).sort(),[...config.nodeIDs].sort());assert.ok(validators.validators.every(v=>Number(v.weight)===100));return {node,chainID:Number(BigInt(id)),genesisBlockHash:genesis.hash,validatorCount:validators.validators.length};}));
  assert.ok(observations.every(o=>o.genesisBlockHash===observations[0].genesisBlockHash));return {...record,observations};
}
async function l1Ready(budget=180000,nodes=all){const start=Date.now(),list=registeredL1s();let last='';while(Date.now()-start<budget){try{return {elapsedMs:Date.now()-start,chains:await Promise.all(list.map(record=>l1State(record,nodes)))};}catch(error){last=error.message;await delay(1000);}}throw new Error('Private L1 readiness deadline: '+last);}
let result;
if(mode==='ready')result=await ready();
else if(mode==='unavailable'){
  const observations=await Promise.allSettled(all.map((node,index)=>identity(node,index)));
  assert.ok(observations.slice(0,4).every(item=>item.status==='fulfilled'));assert.equal(observations[4].status,'rejected');
  await assert.rejects(()=>ready(all,5000),/Private readiness deadline/);
  result={negativeObserved:true,missingNode:all[4],available:4,normalFiveNodeReadinessRefused:true};
}
else if(mode==='transfer'||mode==='transfer-outage')result=await transfers();
else if(mode==='fund'){
  const initial=await ready();
  const origin='http://'+config.prefix+'-foundation-wallet:8090';
  const beforeResponse=await fetch(origin+'/api/info',{signal:AbortSignal.timeout(10000)});assert.equal(beforeResponse.status,200);const before=await beforeResponse.json();
  assert.ok(Number(before.xBalance)>10000,'Synthetic account must have sufficient liquid X balance before funding');
  const response=await fetch(origin+'/api/x-to-p',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({amount:'10000'}),signal:AbortSignal.timeout(90000)});
  assert.equal(response.status,200);const transactions=await response.json();assert.match(transactions.importTx,/^[1-9A-HJ-NP-Za-km-z]{40,55}$/);assert.match(transactions.exportTx,/^[1-9A-HJ-NP-Za-km-z]{40,55}$/);
  const status=await rpc(all[0],'/ext/bc/P','platform.getTxStatus',{txID:transactions.importTx});assert.equal(status.status,'Committed');
  const afterResponse=await fetch(origin+'/api/info',{signal:AbortSignal.timeout(10000)});assert.equal(afterResponse.status,200);const after=await afterResponse.json();assert.ok(Number(after.pBalance)>9999&&Number(after.pBalance)<=10000,'Import balance reflects its transaction fee');
  result={initial,before,after,transactions,status,scope:'One synthetic X-to-P funding transfer on the isolated network; no retry.'};
}
else if(mode==='genesis'){
  const env=fs.readFileSync('/material/faucet.env','utf8');const match=env.match(/^FAUCET_ADDR=(0x[a-fA-F0-9]{40})$/m);assert.ok(match);
  const template=JSON.parse(fs.readFileSync('/inputs/l1-template.json'));const files=[];
  for(let i=1;i<=3;i++){const genesis=structuredClone(template);genesis.config.chainId=8999900000+i;genesis.config.feeManagerConfig={adminAddresses:[match[1]],blockTimestamp:0};genesis.alloc={[match[1].slice(2).toLowerCase()]:{balance:'0x'+(1000000n*10n**18n).toString(16)}};genesis.gasLimit='0x'+BigInt(genesis.config.feeConfig.gasLimit).toString(16);assert.equal(JSON.stringify(genesis).toLowerCase().includes('8db97c7cece249c2b98bdc0226cc4c2a57bf52fc'),false);files.push({name:'PrivateL1'+i,genesis});}
  result={files,scope:'Fresh synthetic L1 genesis only; no operational genesis modified.'};
}
else if(mode==='fund-status'){
  const initial=await ready();const response=await fetch('http://'+config.prefix+'-foundation-wallet:8090/api/info',{signal:AbortSignal.timeout(10000)});assert.equal(response.status,200);const balances=await response.json();assert.ok(Number(balances.pBalance)>9999&&Number(balances.pBalance)<=10000);
  const blocks=await Promise.all(all.map(node=>rpc(node,'/ext/bc/P','platform.getBlockByHeight',{height:1,encoding:'json'})));
  const block=blocks[0].block;assert.equal(block.height,1);assert.equal(block.txs.length,1);const tx=block.txs[0];assert.equal(tx.unsignedTx.networkID,899999998);assert.equal(tx.unsignedTx.importedInputs.length,1);assert.equal(tx.unsignedTx.importedInputs[0].input.amount,10000000000000);assert.deepEqual(tx.unsignedTx.outputs[0].output.addresses,[balances.pAddr]);
  for(const observed of blocks){assert.equal(observed.block.id,block.id);assert.equal(observed.block.txs[0].id,tx.id);}
  const status=await Promise.all(all.map(node=>rpc(node,'/ext/bc/P','platform.getTxStatus',{txID:tx.id})));assert.ok(status.every(s=>s.status==='Committed'));
  result={initial,balances,importTx:tx.id,exportTx:tx.unsignedTx.importedInputs[0].txID,pBlockID:block.id,importedNano:10000000000000,outputNano:tx.unsignedTx.outputs[0].output.amount,importFeeNano:10000000000000-tx.unsignedTx.outputs[0].output.amount,confirmedBy:5,scope:'Read-only reconciliation of the first private funding import after an overly strict post-transfer balance assertion; no resubmission.'};
}
else if(mode==='l1-untracked'){
  const initial=await ready();const records=registeredL1s();assert.equal(records.length,1);const route='/ext/bc/'+records[0].blockchainID+'/rpc';const observations=await Promise.allSettled(all.map(node=>rpc(node,route,'eth_chainId',[])));for(const observation of observations){assert.equal(observation.status,'rejected');assert.match(observation.reason.message,/^RPC status 404/);}await assert.rejects(()=>l1Ready(5000),/Private L1 readiness deadline/);result={initial,negativeObserved:true,primaryHealthyButL1UnavailableOn:5,normalL1ReadinessRefused:true};
}
else if(mode==='l1-ready')result={initial:await ready(),l1:await l1Ready()};
else if(mode==='l1-transfer'||mode==='l1-transfer-outage'){
  const initial=await ready(),l1=await l1Ready(180000,active);const env=fs.readFileSync('/material/faucet.env','utf8'),match=env.match(/^FAUCET_PK=(0x[a-fA-F0-9]{64})$/m);assert.ok(match);const signer=new Wallet(match[1]),chains=[];
  for(const chain of registeredL1s()){
    const route='/ext/bc/'+chain.blockchainID+'/rpc',recipient=Wallet.createRandom().address,nonce=BigInt(await rpc(active[0],route,'eth_getTransactionCount',[signer.address,'pending'])),amount=1000000000n,records=[];
    for(let i=0;i<5;i++){const gasPrice=BigInt(await rpc(active[0],route,'eth_gasPrice',[]));const raw=await signer.signTransaction({type:0,chainId:BigInt(chain.chainID),nonce:Number(nonce)+i,gasLimit:21000n,gasPrice,to:recipient,value:amount});const start=Date.now(),hash=await rpc(active[0],route,'eth_sendRawTransaction',[raw]);const receipt=await receipts(active,hash,60000,route);records.push({...receipt,broadcastToAllReceiptsMs:Date.now()-start});}
    const balances=await Promise.all(active.map(node=>rpc(node,route,'eth_getBalance',[recipient,'latest'])));assert.ok(balances.every(b=>BigInt(b)===amount*5n));chains.push({name:chain.name,chainID:chain.chainID,recipient,records,balances,totalWei:String(amount*5n)});
  }
  result={initial,l1,chains,activeNodes:active.length,scope:'Five sequential transfers per private L1, every receipt and recipient balance compared on the explicitly measured active nodes; not a throughput or hostile-network benchmark.'};
}
else if(mode==='l1-recover'){
  const initial=await ready(),l1=await l1Ready(),previous=JSON.parse(fs.readFileSync('/inputs/results/l1-transfer-outage.json')).result,chains=[];
  for(const chain of previous.chains){const current=registeredL1s().find(record=>record.chainID===chain.chainID);assert.ok(current);const route='/ext/bc/'+current.blockchainID+'/rpc',records=[];for(const tx of chain.records)records.push(await receipts(all,tx.transactionHash,60000,route));const balances=await Promise.all(all.map(node=>rpc(node,route,'eth_getBalance',[chain.recipient,'latest'])));assert.ok(balances.every(b=>BigInt(b)===BigInt(chain.totalWei)));chains.push({chainID:chain.chainID,records,balances});}
  result={initial,l1,chains,recoveredAllFive:true};
}
else if(mode==='inventory'){
  const initial=await ready(),records=registeredL1s();assert.equal(records.length,3);const inventories=await Promise.all(all.map(node=>rpc(node,'/ext/bc/P','platform.getBlockchains')));const expected=records.map(r=>r.blockchainID);for(const inventory of inventories){assert.equal(inventory.blockchains.length,5);for(const record of records){const chain=inventory.blockchains.find(c=>c.id===record.blockchainID);assert.ok(chain);assert.equal(chain.name,record.name);assert.equal(chain.subnetID,record.subnetID);}}
  const genesis=[];for(const record of records){const transactions=await Promise.all(all.map(node=>rpc(node,'/ext/bc/P','platform.getTx',{txID:record.blockchainID,encoding:'json'})));for(const transaction of transactions){const tx=transaction.tx;assert.equal(tx.id,record.blockchainID);assert.equal(tx.unsignedTx.networkID,899999998);assert.equal(tx.unsignedTx.subnetID,record.subnetID);const bytes=Buffer.from(tx.unsignedTx.genesisData,'base64');assert.equal(createHash('sha256').update(bytes).digest('hex'),record.genesisSha256);}genesis.push({name:record.name,blockchainID:record.blockchainID,genesisSha256:record.genesisSha256,matchedBy:5});}
  const response=await fetch('http://'+config.prefix+'-foundation-wallet:8090/api/info',{signal:AbortSignal.timeout(10000)});assert.equal(response.status,200);const balances=await response.json();result={initial,registeredChains:5,userL1s:3,genesis,balances,scope:'Read-only final inventory and exact registered genesis comparison on all five private nodes.'};
}
else if(mode==='recover'){
  const initial=await ready();const previous=JSON.parse(fs.readFileSync('/inputs/results/transfer-outage.json')).result;
  const records=[];for(const record of previous.records)records.push(await receipts(all,record.transactionHash));
  const balances=await Promise.all(all.map(node=>rpc(node,'/ext/bc/C/rpc','eth_getBalance',[previous.recipient,'latest'])));
  assert.ok(balances.every(value=>BigInt(value)===BigInt(previous.totalWei)));result={initial,records,balances,recoveredAllFive:true};
} else throw new Error('Unsupported private client mode');
// The finite probe has no background work. Flush the report before ending aborted DNS/socket resources.
await new Promise(resolve=>process.stdout.write(JSON.stringify({mode,observedAt:new Date().toISOString(),result},null,2)+'\n',resolve));
process.exit(0);
