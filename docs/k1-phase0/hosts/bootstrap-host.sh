#!/usr/bin/env bash
# Apply hosts/cloud-init.yaml by hand on a machine that did not run cloud-init (Hetzner dedicated after
# installimage). Idempotent. Run as root: bash bootstrap-host.sh
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl gnupg chrony nftables jq htop
install -m 0755 -d /etc/apt/keyrings
[ -f /etc/apt/keyrings/docker.asc ] || curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

cat > /etc/sysctl.d/90-k1.conf <<'EOF'
vm.max_map_count = 1048576
net.core.somaxconn = 4096
net.ipv4.ip_local_port_range = 10240 65000
fs.file-max = 4194304
EOF
mkdir -p /etc/systemd/system/docker.service.d
cat > /etc/systemd/system/docker.service.d/override.conf <<'EOF'
[Service]
LimitNOFILE=1048576
LimitNPROC=infinity
EOF
cat > /etc/docker/daemon.json <<'EOF'
{ "log-driver": "json-file", "log-opts": { "max-size": "50m", "max-file": "5" },
  "default-ulimits": { "nofile": { "Name": "nofile", "Hard": 1048576, "Soft": 1048576 } } }
EOF
sysctl --system >/dev/null
systemctl daemon-reload
systemctl enable --now docker chrony
mkdir -p /opt/k1
echo "✓ host bootstrapped: $(docker --version | cut -d, -f1) · compose $(docker compose version --short) · nofile $(systemctl show docker -p LimitNOFILE --value)"
echo "  next: fill ADMIN in /etc/nftables.conf (from hosts/cloud-init.yaml), then hosts/accept-host.sh"
