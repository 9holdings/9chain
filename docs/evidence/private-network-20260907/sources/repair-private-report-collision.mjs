import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const config=JSON.parse(fs.readFileSync('work/private-network-KSW52y/nodes.json'));
assert.equal(config.prefix,'a1-private-c3bb2102');
const file=path.join(config.directory,'genesis.json'),overwritten=fs.readFileSync(file);
assert.equal(JSON.parse(overwritten).mode,'genesis');
const results=path.join(config.directory,'results');fs.mkdirSync(results);
fs.writeFileSync(path.join(results,'genesis.json'),overwritten,{flag:'wx'});
fs.copyFileSync(path.join(config.directory,'transfer-outage.json'),path.join(results,'transfer-outage.json'),fs.constants.COPYFILE_EXCL);
const original=path.join(config.directory,'generated-original.json');assert.equal(fs.existsSync(original),false);
const copied=spawnSync('docker',['cp',config.builder+':/fixture/material/genesis.json',original],{encoding:'utf8',timeout:10000,windowsHide:true});assert.equal(copied.status,0,copied.stderr);
const bytes=fs.readFileSync(original),sha=data=>createHash('sha256').update(data).digest('hex');assert.equal(sha(bytes),config.genesisSha256);
// Repair only this newly generated synthetic fixture after retaining the collided report.
fs.writeFileSync(file,bytes);assert.equal(sha(fs.readFileSync(file)),config.genesisSha256);
fs.writeFileSync(path.join(results,'report-collision-repair.json'),JSON.stringify({repairedAt:new Date().toISOString(),fixture:config.prefix,overwrittenReportSha256:sha(overwritten),restoredExactGeneratedGenesisSha256:config.genesisSha256,cause:'Prototype result filename collided with synthetic parent genesis; reports now use a separate directory and before/after genesis hash assertions.',publicOrExistingOperationalDataTouched:false},null,2)+'\n',{flag:'wx'});
console.log('Retained collided report and restored exact original synthetic genesis from untouched generator volume; public and pre-existing networks were never involved.');
