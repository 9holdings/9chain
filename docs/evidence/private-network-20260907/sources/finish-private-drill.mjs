import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const current=JSON.parse(fs.readFileSync('work/private-network-current.json'));
const config=JSON.parse(fs.readFileSync(path.join(current.directory,'nodes.json')));
assert.match(config.prefix,/^a1-private-[a-f0-9]{8}$/);
assert.equal(process.argv[2],'--stop');
const expected=new Map(fs.readFileSync('work/cold-build-20260906/artifacts/SHA256SUMS.txt','utf8').trim().split(/\r?\n/).map(line=>{const [sha,name]=line.split(/\s+/);return [name,sha];}));assert.equal(expected.size,5);
assert.equal(expected.get('avalanchego'),'d27ad07d03ea61da71e45ca2fe7fc7c487dce3cc32b9c043418d03a252c88cd0');
function docker(args,timeout=10000){const result=spawnSync('docker',args,{encoding:'utf8',timeout,windowsHide:true,maxBuffer:4<<20});assert.equal(result.status,0,result.error?.code||result.stderr);return result.stdout;}
const network=JSON.parse(docker(['network','inspect',config.network]))[0];assert.equal(network.Internal,true);assert.equal(network.Labels['9chain.private-drill'],config.id);
const report={startedAt:new Date().toISOString(),network:config.network,internal:true,nodes:[],helpers:[],volumesRetained:true,containersRetained:true};
for(const name of config.containers){
 const node=JSON.parse(docker(['inspect',name]))[0];assert.equal(node.State.Running,true);assert.equal(node.State.OOMKilled,false);assert.equal(node.Config.Labels['9chain.private-drill'],config.id);assert.deepEqual(Object.keys(node.NetworkSettings.Networks),[config.network]);assert.equal(Object.keys(node.HostConfig.PortBindings??{}).length,0);assert.equal(node.HostConfig.ReadonlyRootfs,true);assert.ok(!node.Config.Cmd.some(arg=>arg.startsWith('--sybil-protection-enabled=')));
 const actual=new Map(docker(['exec',name,'sha256sum',...expected.keys(),'/genesis.json']).trim().split(/\r?\n/).map(line=>{const [hash,file]=line.split(/\s+/);return[file,hash];}));for(const [file,hash] of expected)assert.equal(actual.get(file),hash);assert.equal(actual.get('/genesis.json'),config.genesisSha256);
 const disk=docker(['exec',name,'du','-sk','/state']).trim();assert.match(disk,/^\d+\s+\/state$/);report.nodes.push({name,binaryHashes:Object.fromEntries(expected),genesisSha256:actual.get('/genesis.json'),stateDiskKiB:Number(disk.split(/\s+/)[0]),before:node.State});
}
assert.equal(createHash('sha256').update(fs.readFileSync(path.join(config.directory,'genesis.json'))).digest('hex'),config.genesisSha256);
for(const node of report.nodes){docker(['stop','--time','30',node.name],45000);const state=JSON.parse(docker(['inspect',node.name]))[0].State;assert.equal(state.Running,false);assert.equal(state.ExitCode,0);assert.equal(state.OOMKilled,false);node.after=state;}
for(const name of [config.prefix+'-wallet',config.prefix+'-foundation-wallet']){const helper=JSON.parse(docker(['inspect',name]))[0];assert.equal(helper.Config.Labels['9chain.private-drill'],config.id);if(helper.State.Running)docker(['stop','--time','5',name],15000);const after=JSON.parse(docker(['inspect',name]))[0].State;assert.equal(after.Running,false);report.helpers.push({name,after});}
report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(config.directory,'results','shutdown.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log('Verified exact cold-build binaries/genesis and stopped all5 private nodes plus wallet helpers. All state and evidence retained.');
