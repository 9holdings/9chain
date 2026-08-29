#!/usr/bin/env python3
"""Give every node its own Internet-reachable staking port (ipv4port shape, D-089).

Node N advertises the host's public IPv4 and listens on staking port 9650+N, and compose
publishes exactly that port on 0.0.0.0. --bootstrap-ips stays on the INTERNAL beacon address,
deliberately: Docker does not hairpin NAT, so a same-host container cannot dial the host's own
public IP (measured 2026-08-28, D-089).

Idempotent: running it twice changes nothing. Prints a summary and exits non-zero if the file
does not look like the expected 9-node compose, because a silent partial edit here means a
network that comes up looking healthy while peers cannot reach each other.
"""
import re
import sys

PUBLIC_IP = sys.argv[1] if len(sys.argv) > 1 else "139.99.145.13"
PATH = sys.argv[2] if len(sys.argv) > 2 else "docker-compose.multinode.yml"

with open(PATH, encoding="utf-8") as fh:
    lines = fh.read().split("\n")

# Locate each service block by its header line.
starts = {}
for i, line in enumerate(lines):
    m = re.match(r"^  (9chain-a1-node-(\d+)):\s*$", line)
    if m:
        starts[int(m.group(2))] = i
if len(starts) != 9:
    sys.exit(f"HALT: expected 9 node services, found {len(starts)} - not touching this file")

out = []
changed = {"public_ip": 0, "staking_port": 0, "port_published": 0}
ordered = sorted(starts.items())
bounds = {}
for idx, (n, start) in enumerate(ordered):
    end = ordered[idx + 1][1] if idx + 1 < len(ordered) else len(lines)
    bounds[n] = (start, end)

for n, (start, end) in bounds.items():
    port = 9650 + n
    block = lines[start:end]

    has_staking_port = any("--staking-port=" in ln for ln in block)
    has_published = any(f"0.0.0.0:{port}:{port}" in ln for ln in block)

    new_block = []
    for ln in block:
        # 1) advertise the public IPv4 instead of the bridge address
        if re.match(r"^\s+- --public-ip=172\.28\.0\.\d+\s*$", ln):
            ln = re.sub(r"--public-ip=[\d.]+", f"--public-ip={PUBLIC_IP}", ln)
            changed["public_ip"] += 1
            new_block.append(ln)
            # 2) each node needs its OWN listening port, or they collide on the host
            if not has_staking_port:
                new_block.append(f"      - --staking-port={port}")
                changed["staking_port"] += 1
            continue
        new_block.append(ln)

    # 3) publish that staking port on every interface. The API port stays bound to loopback -
    #    these two ports have opposite purposes and must bind opposite ways.
    if not has_published:
        pub = f'      - "0.0.0.0:{port}:{port}"'
        try:
            pi = next(i for i, ln in enumerate(new_block) if ln.strip() == "ports:")
            new_block.insert(pi + 1, pub)
        except StopIteration:
            ci = next(i for i, ln in enumerate(new_block) if "container_name:" in ln)
            new_block.insert(ci + 1, "    ports:")
            new_block.insert(ci + 2, pub)
        changed["port_published"] += 1

    lines[start:end] = new_block
    # rebuilding bounds is unnecessary: we edit from the last block backwards below
    for m, (s, e) in list(bounds.items()):
        if s > start:
            delta = len(new_block) - (end - start)
            bounds[m] = (s + delta, e + delta)
    bounds[n] = (start, start + len(new_block))

with open(PATH, "w", encoding="utf-8") as fh:
    fh.write("\n".join(lines))

print(f"  public-ip rewritten : {changed['public_ip']}")
print(f"  staking-port added  : {changed['staking_port']}")
print(f"  ports published     : {changed['port_published']}")
