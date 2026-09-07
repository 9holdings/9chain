import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const config=JSON.parse(fs.readFileSync('work/private-network-current.json'));
const {id,prefix,directory,volume,network}=config;
assert.match(prefix,/^a1-private-[a-f0-9]{8}$/);
assert.equal(config.networkID,899999998);assert.equal(config.parentChainID,9000000909);
function docker(args,timeout=20000){const r=spawnSync('docker',args,{encoding:'utf8',timeout,windowsHide:true,maxBuffer:4<<20}); fs.appendFileSync(path.join(directory,'node-commands.log'),JSON.stringify({at:new Date().toISOString(),args,status:r.status,error:r.error?.code,stdout:r.stdout,stderr:r.stderr})+'\n');assert.equal(r.status,0,r.error?.message||r.stderr);return r.stdout.trim();}
assert.equal(JSON.parse(docker(['volume','inspect',volume]))[0].Labels['9chain.private-drill'],id);
assert.equal(JSON.parse(docker(['inspect',config.builder]))[0].State.ExitCode,0);
assert.equal(fs.existsSync(path.join(directory,'genesis.json')),false);
docker(['cp',config.builder+':/fixture/material/genesis.json',path.join(directory,'genesis.json')]);
const genesisBytes=fs.readFileSync(path.join(directory,'genesis.json')),genesis=JSON.parse(genesisBytes);
assert.equal(genesis.networkID,config.networkID); assert.equal(JSON.parse(genesis.cChainGenesis).config.chainId,config.parentChainID);
assert.equal(genesis.initialStakers.length,5);
config.genesisSha256=createHash('sha256').update(genesisBytes).digest('hex');
config.nodeIDs=genesis.initialStakers.map(item=>item.nodeID);
assert.equal(new Set(config.nodeIDs).size,5);
const runtime=JSON.parse(docker(['image','inspect','9chain-a1/node:autopilot-20260906']))[0];
assert.equal(runtime.Id,'sha256:aec9636e4d1d6ed45bbab0a1338b2d3aab08d07ae139958015a7512c746e267f');
config.runtimeImage=runtime.Id;
docker(['network','create','--internal','--subnet',config.subnet,'--label','9chain.private-drill='+id,network]);
const net=JSON.parse(docker(['network','inspect',network]))[0];assert.equal(net.Internal,true);assert.equal(net.Labels['9chain.private-drill'],id);
fs.mkdirSync(path.join(directory,'config','chains'),{recursive:true});
config.containers=[];config.stateVolumes=[];
function save(){fs.writeFileSync(path.join(directory,'nodes.json'),JSON.stringify(config,null,2)+'\n');}
for(let n=1;n<=5;n++){
  const name=prefix+'-node'+n,state=prefix+'-state'+n,ip='172.29.207.'+(10+n);
  docker(['volume','create','--label','9chain.private-drill='+id,state]);
  config.stateVolumes.push(state);config.containers.push(name);save();
  const args=['run','-d','--name',name,'--label','9chain.private-drill='+id,'--network',network,'--ip',ip,'--read-only','--cap-drop=ALL','--security-opt','no-new-privileges:true','--memory','2g','--cpus','1','--pids-limit','200','--tmpfs','/tmp:rw,nosuid,size=64m','--mount','type=volume,source='+volume+',target=/node,volume-subpath=material/node'+n+',readonly','--mount','type=volume,source=a1-autopilot-cold-build-20260906,target=/9chain-a1/build,volume-subpath=artifacts,readonly','--mount','type=volume,source='+state+',target=/state','--mount','type=bind,source='+path.join(directory,'genesis.json')+',target=/genesis.json,readonly','--mount','type=bind,source='+path.join(directory,'config')+',target=/config,readonly','-e','GOMAXPROCS=2',runtime.Id,'./avalanchego','--network-id=899999998','--genesis-file=/genesis.json','--data-dir=/state','--plugin-dir=/9chain-a1/build/plugins','--chain-config-dir=/config/chains','--staking-tls-cert-file=/node/staker.crt','--staking-tls-key-file=/node/staker.key','--staking-signer-key-file=/node/signer.key','--http-host=0.0.0.0','--http-allowed-hosts=*','--public-ip='+ip,'--bootstrap-ids='+(n===1?'':config.nodeIDs[0]),'--bootstrap-ips='+(n===1?'':'172.29.207.11:9651'),'--log-level=info'];
  // Default Sybil protection and consensus parameters remain enabled and unchanged.
  docker(args);
}
save();
const nodes=JSON.parse(docker(['inspect',...config.containers]));
for(const node of nodes){assert.equal(node.State.Running,true);assert.equal(node.HostConfig.ReadonlyRootfs,true);assert.equal(Object.keys(node.HostConfig.PortBindings??{}).length,0);assert.deepEqual(Object.keys(node.NetworkSettings.Networks),[network]);}
fs.writeFileSync(path.join(directory,'isolation.json'),JSON.stringify({internal:net.Internal,network,genesisSha256:config.genesisSha256,nodes:nodes.map(node=>({name:node.Name,startedAt:node.State.StartedAt,ports:node.HostConfig.PortBindings,networks:Object.keys(node.NetworkSettings.Networks),memoryLimit:node.HostConfig.Memory,nanoCpus:node.HostConfig.NanoCpus}))},null,2)+'\n');
console.log('Started5 isolated nodes with fresh keys, retained state volumes, no published ports and cold-build binaries. '+directory);
