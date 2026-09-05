// k1.go — the parts of l1-batch that phase 0 did not need and K1 does (PROCUREMENT-K1 §5):
//
//	keygen   identities for the ledger-host nodes (staker.crt/key + signer.key), exactly as netgen
//	         makes them for mother nodes — but hosts are NOT genesis stakers, so netgen must not
//	         know about them.
//	compose  one deploy directory per machine from an inventory: mother nodes (netgen output) on
//	         the machines that carry them, host nodes everywhere, ipv4port semantics (every node its
//	         own staking port, --public-ip = machine IP, beacons on the SAME machine reached by the
//	         Docker-internal address because Docker does not hairpin — patch 0024 measured it).
//	workers  split the fund key's P-Chain balance into W worker keys so `apply -workers W` can issue
//	         in parallel: one wallet is one UTXO chain, and 3,000 sequential txs is 50 minutes.
//	router   a Caddyfile that sends /ext/bc/<blockchainID>/* to the node that tracks that chain,
//	         from assignment.json; unknown ids get a JSON 404 instead of a stranger's error page.
//	measure  prometheus.yml + compose for the measure VM: every node's /ext/metrics, the four
//	         validator-set metrics and network_peers that phase 0 found by name.
package main

import (
	"encoding/json"
	"encoding/pem"
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/ava-labs/avalanchego/ids"
	"github.com/ava-labs/avalanchego/staking"
	"github.com/ava-labs/avalanchego/utils/crypto/bls/signer/localsigner"
	"github.com/ava-labs/avalanchego/utils/crypto/secp256k1"
	"github.com/ava-labs/avalanchego/vms/components/avax"
	"github.com/ava-labs/avalanchego/vms/secp256k1fx"
	"github.com/ava-labs/avalanchego/wallet/subnet/primary"
	"context"
	"time"
)

// ── inventory (hosts/inventory.example.json) ────────────────────────────────────────────────

type Machine struct {
	Name           string `json:"name"`
	DC             string `json:"dc"`
	IP             string `json:"ip"`
	HostNodes      int    `json:"hostNodes"`
	MotherNodes    int    `json:"motherNodes"`
	CommunityChain bool   `json:"communityChain"`
}

type VM struct {
	Name string `json:"name"`
	Role string `json:"role"`
	IP   string `json:"ip"`
}

type Inventory struct {
	Provider string    `json:"provider"`
	Machines []Machine `json:"machines"`
	VMs      []VM      `json:"vms"`
}

func readInventory(p string) (*Inventory, error) {
	b, err := os.ReadFile(p)
	if err != nil {
		return nil, err
	}
	var inv Inventory
	if err := json.Unmarshal(b, &inv); err != nil {
		return nil, err
	}
	if len(inv.Machines) == 0 {
		return nil, errors.New("inventory has no machines")
	}
	return &inv, nil
}

// Port plan (PROCUREMENT-K1 §3): host node i on a machine → staking 9651+i-1, API 9650+10*(i-1) on the host
// side (9650 inside the container); mother node j on a machine → staking 9661+j-1, API 9800+10*(j-1).
// The mother API base was 9700 in the first draft, which collides with host h06–h08 (9700/9710/9720) on
// the machines that carry both — caught by reading the generated compose, not by any tool. 9800 clears
// eight hosts (9650…9720) with room for fifteen (…9790).
const (
	hostStakingBase   = 9651
	hostAPIBase       = 9650
	motherStakingBase = 9661
	motherAPIBase     = 9800
	apiStep           = 10
)

type placedNode struct {
	Name        string // h01…, M1…
	Machine     Machine
	Mother      bool
	Index       int    // 1-based within its kind on the machine
	InternalIP  string // docker bridge address on that machine
	StakingPort int
	APIPort     int // host-side API port
	Service     string
	NodeID      string // known for mothers (netgen) and hosts (keygen)
	IdentityDir string // path to staker.crt/key + signer.key
}

// placement knobs. Production: each machine gets its own bridge 172.30.<m>.0/24. Local test
// (-external-network): nodes join an existing network, so the prefix is that network's and the
// addresses start high enough not to collide with what is already there.
type placement struct {
	Prefix string // "172.30.%d" (machine index substituted) or a literal like "172.31.0"
	IPBase int    // added to the per-kind offsets (10+j mothers, 20+i hosts)
}

var defaultPlacement = placement{Prefix: "172.30.%d", IPBase: 0}

func (p placement) ip(machineIdx, offset int) string {
	prefix := p.Prefix
	if strings.Contains(prefix, "%d") {
		prefix = fmt.Sprintf(prefix, machineIdx+1)
	}
	return fmt.Sprintf("%s.%d", prefix, p.IPBase+offset)
}

// serviceName is the compose service / container name: "<machine>-<node>", with a single k1- prefix.
func serviceName(machine, node string) string {
	if strings.HasPrefix(machine, "k1-") {
		return machine + "-" + node
	}
	return "k1-" + machine + "-" + node
}

// placeNodes walks the inventory and assigns names, ports and internal addresses. Names are
// global (h01…h72, M1…M9) so plan/render/assignment can use them unchanged.
func placeNodes(inv *Inventory) []placedNode { return placeNodesWith(inv, defaultPlacement) }

func placeNodesWith(inv *Inventory, p placement) []placedNode {
	var out []placedNode
	h, m := 0, 0
	for mi, mc := range inv.Machines {
		for j := 1; j <= mc.MotherNodes; j++ {
			m++
			out = append(out, placedNode{
				Name: fmt.Sprintf("M%d", m), Machine: mc, Mother: true, Index: j,
				InternalIP:  p.ip(mi, 10+j),
				StakingPort: motherStakingBase + j - 1, APIPort: motherAPIBase + apiStep*(j-1),
				Service:     serviceName(mc.Name, fmt.Sprintf("M%d", m)),
			})
		}
		for i := 1; i <= mc.HostNodes; i++ {
			h++
			out = append(out, placedNode{
				Name: fmt.Sprintf("h%02d", h), Machine: mc, Mother: false, Index: i,
				InternalIP:  p.ip(mi, 20+i),
				StakingPort: hostStakingBase + i - 1, APIPort: hostAPIBase + apiStep*(i-1),
				Service:     serviceName(mc.Name, fmt.Sprintf("h%02d", h)),
			})
		}
	}
	return out
}

// nodesFromInventory is what `plan -inventory` uses instead of -nodes: host nodes only, URI = machine IP + API port.
func nodesFromInventory(inv *Inventory) []NodeRef {
	var refs []NodeRef
	for _, n := range placeNodes(inv) {
		if n.Mother {
			continue
		}
		refs = append(refs, NodeRef{Name: n.Name, URI: fmt.Sprintf("http://%s:%d", n.Machine.IP, n.APIPort), Service: n.Service})
	}
	return refs
}

// ── keygen ───────────────────────────────────────────────────────────────────────────────────

type hostIdentity struct {
	Name   string `json:"name"`
	NodeID string `json:"nodeID"`
	Dir    string `json:"dir"`
}

func cmdKeygen(args []string) error {
	fs := flag.NewFlagSet("keygen", flag.ExitOnError)
	out := fs.String("out", "out/hosts", "directory for <name>/{staker.crt,staker.key,signer.key} and hosts.json")
	count := fs.Int("count", 72, "how many host identities (ignored when -inventory is given)")
	invPath := fs.String("inventory", "", "derive names (h01…) and count from the inventory")
	fs.Parse(args)

	var names []string
	if *invPath != "" {
		inv, err := readInventory(*invPath)
		if err != nil {
			return err
		}
		for _, n := range placeNodes(inv) {
			if !n.Mother {
				names = append(names, n.Name)
			}
		}
	} else {
		for i := 1; i <= *count; i++ {
			names = append(names, fmt.Sprintf("h%02d", i))
		}
	}
	var ids_ []hostIdentity
	for _, name := range names {
		dir := filepath.Join(*out, name)
		if _, err := os.Stat(filepath.Join(dir, "signer.key")); err == nil {
			// never overwrite an identity: a NodeID that changes is a validator that vanishes
			id, err := nodeIDFromDir(dir)
			if err != nil {
				return err
			}
			ids_ = append(ids_, hostIdentity{Name: name, NodeID: id, Dir: dir})
			continue
		}
		if err := os.MkdirAll(dir, 0o700); err != nil {
			return err
		}
		certPEM, keyPEM, err := staking.NewCertAndKeyBytes()
		if err != nil {
			return err
		}
		ls, err := localsigner.New()
		if err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(dir, "staker.crt"), certPEM, 0o600); err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(dir, "staker.key"), keyPEM, 0o600); err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(dir, "signer.key"), ls.ToBytes(), 0o600); err != nil {
			return err
		}
		id, err := nodeIDFromDir(dir)
		if err != nil {
			return err
		}
		ids_ = append(ids_, hostIdentity{Name: name, NodeID: id, Dir: dir})
	}
	if err := writeJSON(filepath.Join(*out, "hosts.json"), ids_); err != nil {
		return err
	}
	fmt.Printf("✓ keygen: %d host identities in %s (existing ones kept)\n", len(ids_), *out)
	for _, h := range ids_[:min(3, len(ids_))] {
		fmt.Printf("   %s %s\n", h.Name, h.NodeID)
	}
	if len(ids_) > 3 {
		fmt.Printf("   … %d more in hosts.json\n", len(ids_)-3)
	}
	return nil
}

func nodeIDFromDir(dir string) (string, error) {
	certPEM, err := os.ReadFile(filepath.Join(dir, "staker.crt"))
	if err != nil {
		return "", err
	}
	block, _ := pem.Decode(certPEM)
	if block == nil {
		return "", fmt.Errorf("%s: staker.crt is not PEM", dir)
	}
	cert, err := staking.ParseCertificate(block.Bytes)
	if err != nil {
		return "", err
	}
	return ids.NodeIDFromCert(cert).String(), nil
}

// ── compose ──────────────────────────────────────────────────────────────────────────────────

func cmdCompose(args []string) error {
	fs := flag.NewFlagSet("compose", flag.ExitOnError)
	invPath := fs.String("inventory", "hosts/inventory.example.json", "machines and IPs")
	netDir := fs.String("net", "out/net", "netgen output: genesis.json + node1…nodeN (the mother nodes, in order)")
	hostsDir := fs.String("hosts", "out/hosts", "keygen output")
	chainsPath := fs.String("chains", "out/plan/chains.jsonl", "converted ledgers (for AVAGO_TRACK_SUBNETS); optional")
	configDir := fs.String("config-dir", "config", "chains/ and subnets/ from `render`")
	image := fs.String("image", "9chain-a1/node:g1-81", "node image")
	networkID := fs.Uint("network-id", 899999998, "must match the genesis in -net")
	out := fs.String("out", "out/deploy", "one directory per machine, ready to rsync to /opt/k1")
	external := fs.String("external-network", "", "LOCAL TEST ONLY: join this existing docker network instead of creating one, and use internal IPs as --public-ip")
	ipPrefix := fs.String("ip-prefix", "172.30.%d", "internal address prefix; %d = machine index. Local test: the existing network's prefix, e.g. 172.31.0")
	ipBase := fs.Int("ip-base", 0, "added to internal address offsets (local test: 100 to stay clear of running nodes)")
	beacons := fs.String("beacons", "", "LOCAL TEST ONLY, when the inventory has no mother nodes: NodeID@ip:port,… of already-running beacons")
	fs.Parse(args)

	inv, err := readInventory(*invPath)
	if err != nil {
		return err
	}
	placed := placeNodesWith(inv, placement{Prefix: *ipPrefix, IPBase: *ipBase})

	// mother identities come from netgen: node1..nodeN in -net, NodeIDs from their certs
	mothers := 0
	for i := range placed {
		if placed[i].Mother {
			mothers++
			dir := filepath.Join(*netDir, fmt.Sprintf("node%d", mothers))
			id, err := nodeIDFromDir(dir)
			if err != nil {
				return fmt.Errorf("mother %s: %w (netgen must have been run with N ≥ %d)", placed[i].Name, err, mothers)
			}
			placed[i].NodeID = id
			placed[i].IdentityDir = dir
		}
	}
	// host identities from keygen
	hostIDs := map[string]hostIdentity{}
	if b, err := os.ReadFile(filepath.Join(*hostsDir, "hosts.json")); err == nil {
		var list []hostIdentity
		if err := json.Unmarshal(b, &list); err != nil {
			return err
		}
		for _, h := range list {
			hostIDs[h.Name] = h
		}
	}
	for i := range placed {
		if !placed[i].Mother {
			h, ok := hostIDs[placed[i].Name]
			if !ok {
				return fmt.Errorf("no identity for %s — run keygen -inventory first", placed[i].Name)
			}
			placed[i].NodeID = h.NodeID
			placed[i].IdentityDir = h.Dir
		}
	}
	// track lists per host node
	track := map[string][]string{}
	if chains, err := readChains(*chainsPath); err == nil {
		for _, c := range chains {
			track[c.Node] = append(track[c.Node], c.SubnetID)
		}
	}

	genesis, err := os.ReadFile(filepath.Join(*netDir, "genesis.json"))
	if err != nil {
		return err
	}

	// beacons = all mothers; address depends on where the CALLER sits (same machine → internal)
	var beaconIDs []string
	for _, n := range placed {
		if n.Mother {
			beaconIDs = append(beaconIDs, n.NodeID)
		}
	}
	var externalBeacons []string // "ip:port" for -beacons
	if *beacons != "" {
		if mothers > 0 {
			return errors.New("-beacons is for inventories WITHOUT mother nodes (local test against a running cluster)")
		}
		for _, b := range strings.Split(*beacons, ",") {
			id, addr, ok := strings.Cut(strings.TrimSpace(b), "@")
			if !ok {
				return fmt.Errorf("-beacons entry %q must be NodeID@ip:port", b)
			}
			beaconIDs = append(beaconIDs, id)
			externalBeacons = append(externalBeacons, addr)
		}
	}
	if len(beaconIDs) == 0 {
		return errors.New("no beacons: the inventory has no mother nodes and -beacons was not given")
	}
	beaconAddr := func(caller placedNode) []string {
		if len(externalBeacons) > 0 {
			return externalBeacons
		}
		var addrs []string
		for _, b := range placed {
			if !b.Mother {
				continue
			}
			if *external != "" || b.Machine.Name == caller.Machine.Name {
				addrs = append(addrs, fmt.Sprintf("%s:%d", b.InternalIP, b.StakingPort))
			} else {
				addrs = append(addrs, fmt.Sprintf("%s:%d", b.Machine.IP, b.StakingPort))
			}
		}
		return addrs
	}

	for mi, mc := range inv.Machines {
		dir := filepath.Join(*out, mc.Name)
		if err := os.MkdirAll(filepath.Join(dir, "nodes"), 0o755); err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(dir, "genesis.json"), genesis, 0o644); err != nil {
			return err
		}
		// config dir: copy chains/ and subnets/ (small files) so the machine is self-contained
		if err := copyTree(*configDir, filepath.Join(dir, "config")); err != nil {
			return err
		}
		var b strings.Builder
		fmt.Fprintf(&b, "# K1 · %s (%s, %s) — generated by l1-batch compose. Run on the machine:\n", mc.Name, mc.DC, mc.IP)
		b.WriteString("#   cd /opt/k1 && docker compose up -d\n")
		b.WriteString("services:\n")
		for _, n := range placed {
			if n.Machine.Name != mc.Name {
				continue
			}
			// identity files travel with the deploy dir
			if err := copyTree(n.IdentityDir, filepath.Join(dir, "nodes", n.Name)); err != nil {
				return err
			}
			publicIP := mc.IP
			if *external != "" {
				publicIP = n.InternalIP
			}
			fmt.Fprintf(&b, "  %s:\n", n.Service)
			fmt.Fprintf(&b, "    image: %s\n    container_name: %s\n    restart: unless-stopped\n", *image, n.Service)
			b.WriteString("    ports:\n")
			fmt.Fprintf(&b, "      - \"%d:%d\"\n", n.StakingPort, n.StakingPort)
			fmt.Fprintf(&b, "      - \"%d:9650\"\n", n.APIPort)
			b.WriteString("    volumes:\n")
			fmt.Fprintf(&b, "      - ./nodes/%s:/9chain-a1/node:ro\n", n.Name)
			b.WriteString("      - ./genesis.json:/9chain-a1/net/genesis.json:ro\n")
			b.WriteString("      - ./config:/9chain-a1/config:ro\n")
			fmt.Fprintf(&b, "      - data-%s:/root/.avalanchego\n", n.Name)
			b.WriteString("    command:\n      - ./avalanchego\n")
			fmt.Fprintf(&b, "      - --network-id=%d\n", *networkID)
			b.WriteString("      - --genesis-file=/9chain-a1/net/genesis.json\n")
			b.WriteString("      - --plugin-dir=/9chain-a1/build/plugins\n")
			b.WriteString("      - --chain-config-dir=/9chain-a1/config/chains\n")
			b.WriteString("      - --subnet-config-dir=/9chain-a1/config/subnets\n")
			b.WriteString("      - --staking-tls-cert-file=/9chain-a1/node/staker.crt\n")
			b.WriteString("      - --staking-tls-key-file=/9chain-a1/node/staker.key\n")
			b.WriteString("      - --staking-signer-key-file=/9chain-a1/node/signer.key\n")
			b.WriteString("      - --http-host=0.0.0.0\n      - --http-allowed-hosts=*\n")
			fmt.Fprintf(&b, "      - --public-ip=%s\n", publicIP)
			fmt.Fprintf(&b, "      - --staking-port=%d\n", n.StakingPort)
			if n.Mother && n.Name == "M1" {
				b.WriteString("      - --bootstrap-ids=\n      - --bootstrap-ips=\n")
			} else {
				fmt.Fprintf(&b, "      - --bootstrap-ids=%s\n", strings.Join(beaconIDs, ","))
				fmt.Fprintf(&b, "      - --bootstrap-ips=%s\n", strings.Join(beaconAddr(n), ","))
			}
			if !n.Mother {
				// hosts are L1 validators only: P-Chain is all they need of the primary network
				b.WriteString("      - --partial-sync-primary-network=true\n")
			}
			b.WriteString("      - --log-level=info\n")
			ids := track[n.Name]
			sort.Strings(ids)
			b.WriteString("    environment:\n")
			fmt.Fprintf(&b, "      - AVAGO_TRACK_SUBNETS=%s\n", strings.Join(ids, ","))
			b.WriteString("    networks:\n      k1net:\n")
			fmt.Fprintf(&b, "        ipv4_address: %s\n", n.InternalIP)
		}
		b.WriteString("networks:\n  k1net:\n")
		if *external != "" {
			fmt.Fprintf(&b, "    external: true\n    name: %s\n", *external)
		} else {
			fmt.Fprintf(&b, "    driver: bridge\n    ipam:\n      config:\n        - subnet: 172.30.%d.0/24\n", mi+1)
		}
		b.WriteString("volumes:\n")
		for _, n := range placed {
			if n.Machine.Name == mc.Name {
				fmt.Fprintf(&b, "  data-%s:\n", n.Name)
			}
		}
		if err := os.WriteFile(filepath.Join(dir, "docker-compose.yml"), []byte(b.String()), 0o644); err != nil {
			return err
		}
	}
	// nodes.json: everything a router/measure/plan needs about every node
	if err := writeJSON(filepath.Join(*out, "nodes.json"), placed); err != nil {
		return err
	}
	fmt.Printf("✓ compose: %d machines, %d nodes (%d mother, %d host) → %s\n", len(inv.Machines), len(placed), mothers, len(placed)-mothers, *out)
	for _, mc := range inv.Machines {
		fmt.Printf("   %-8s %-15s %d host + %d mother\n", mc.Name, mc.IP, mc.HostNodes, mc.MotherNodes)
	}
	return nil
}

func copyTree(src, dst string) error {
	return filepath.Walk(src, func(p string, info os.FileInfo, err error) error {
		if err != nil {
			if errors.Is(err, os.ErrNotExist) && p == src {
				return nil
			}
			return err
		}
		rel, _ := filepath.Rel(src, p)
		target := filepath.Join(dst, rel)
		if info.IsDir() {
			return os.MkdirAll(target, 0o755)
		}
		b, err := os.ReadFile(p)
		if err != nil {
			return err
		}
		return os.WriteFile(target, b, info.Mode().Perm())
	})
}

// ── workers ──────────────────────────────────────────────────────────────────────────────────

type workerKeys struct {
	Keys []string `json:"keys"` // PrivateKey-<cb58>
}

func cmdWorkers(args []string) error {
	fs := flag.NewFlagSet("workers", flag.ExitOnError)
	keyStr := fs.String("key", os.Getenv("K1_FUND_KEY"), "fund key with P-Chain balance (after `fund`)")
	uri := fs.String("uri", "http://172.31.0.11:9650", "node API URI")
	n := fs.Int("n", 10, "number of worker keys")
	each := fs.Uint64("each", 50_000_000_000, "nLOVE9 per worker (50 LOVE9 ≈ 4,000 ledgers of fees + balances)")
	out := fs.String("out", "out/plan/workers.json", "worker keys file (drill band only — still, keep it out of git)")
	timeout := fs.Duration("tx-timeout", 90*time.Second, "")
	fs.Parse(args)
	if *keyStr == "" {
		return errors.New("-key (or K1_FUND_KEY) is required")
	}
	fund, err := parseKey(*keyStr)
	if err != nil {
		return err
	}
	var wk workerKeys
	if b, err := os.ReadFile(*out); err == nil {
		_ = json.Unmarshal(b, &wk)
	}
	for len(wk.Keys) < *n {
		k, err := secp256k1.NewPrivateKey()
		if err != nil {
			return err
		}
		wk.Keys = append(wk.Keys, keyString(k))
	}
	if err := writeJSON(*out, wk); err != nil {
		return err
	}
	kc := secp256k1fx.NewKeychain(fund)
	ctx, cancel := context.WithTimeout(context.Background(), *timeout)
	defer cancel()
	pw, err := primary.MakePWallet(ctx, *uri, kc, primary.WalletConfig{})
	if err != nil {
		return fmt.Errorf("wallet: %w", err)
	}
	asset := pw.Builder().Context().AVAXAssetID
	var outs []*avax.TransferableOutput
	for _, ks := range wk.Keys[:*n] {
		k, err := parseKey(ks)
		if err != nil {
			return err
		}
		outs = append(outs, &avax.TransferableOutput{
			Asset: avax.Asset{ID: asset},
			Out:   &secp256k1fx.TransferOutput{Amt: *each, OutputOwners: secp256k1fx.OutputOwners{Threshold: 1, Addrs: []ids.ShortID{k.Address()}}},
		})
	}
	t0 := time.Now()
	tx, err := pw.IssueBaseTx(outs)
	if err != nil {
		return fmt.Errorf("BaseTx to %d workers: %w", *n, err)
	}
	fmt.Printf("✓ workers: %d keys funded with %d nLOVE9 each in one BaseTx %s (%s) → %s\n", *n, *each, tx.ID(), time.Since(t0).Round(time.Millisecond), *out)
	return nil
}

// ── router ───────────────────────────────────────────────────────────────────────────────────

func cmdRouter(args []string) error {
	fs := flag.NewFlagSet("router", flag.ExitOnError)
	assignmentPath := fs.String("assignment", "out/plan/assignment.json", "from `render`")
	listen := fs.String("listen", ":8545", "Caddy listen address")
	out := fs.String("out", "out/router/Caddyfile", "Caddyfile to write")
	fs.Parse(args)
	b, err := os.ReadFile(*assignmentPath)
	if err != nil {
		return err
	}
	var assignment map[string]struct {
		Node    string `json:"node"`
		URI     string `json:"uri"`
		ChainID uint64 `json:"chainId"`
		Name    string `json:"name"`
	}
	if err := json.Unmarshal(b, &assignment); err != nil {
		return err
	}
	keys := make([]string, 0, len(assignment))
	for k := range assignment {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	var sb strings.Builder
	sb.WriteString("# Generated by l1-batch router — one route per blockchainID, to the node that tracks it.\n")
	sb.WriteString("# A node only answers RPC for chains it tracks (PLAN-108 §3); this table is the only thing that knows which.\n")
	sb.WriteString("{\n\tadmin off\n\tauto_https off\n}\n\n")
	fmt.Fprintf(&sb, "%s {\n", *listen)
	sb.WriteString("\thandle /health {\n\t\trespond `{\"ok\":true,\"chains\":" + fmt.Sprint(len(keys)) + "}` 200\n\t}\n")
	for _, id := range keys {
		a := assignment[id]
		up := strings.TrimPrefix(strings.TrimPrefix(a.URI, "http://"), "https://")
		fmt.Fprintf(&sb, "\t# %s chainId %d on %s\n\thandle /ext/bc/%s/* {\n\t\treverse_proxy %s\n\t}\n", a.Name, a.ChainID, a.Node, id, up)
	}
	sb.WriteString("\thandle {\n\t\theader Content-Type application/json\n\t\trespond `{\"error\":\"unknown chain\",\"detail\":\"this blockchainID is not in the K1 assignment table\"}` 404\n\t}\n}\n")
	if err := os.MkdirAll(filepath.Dir(*out), 0o755); err != nil {
		return err
	}
	if err := os.WriteFile(*out, []byte(sb.String()), 0o644); err != nil {
		return err
	}
	compose := fmt.Sprintf(`# Router VM: docker compose up -d   (Caddyfile next to this file)
services:
  k1-router:
    image: caddy:2
    container_name: k1-router
    restart: unless-stopped
    ports: ["%s:%s"]
    volumes: ["./Caddyfile:/etc/caddy/Caddyfile:ro"]
`, strings.TrimPrefix(*listen, ":"), strings.TrimPrefix(*listen, ":"))
	if err := os.WriteFile(filepath.Join(filepath.Dir(*out), "docker-compose.yml"), []byte(compose), 0o644); err != nil {
		return err
	}
	fmt.Printf("✓ router: %d routes → %s (+ docker-compose.yml)\n", len(keys), *out)
	return nil
}

// ── measure ──────────────────────────────────────────────────────────────────────────────────

func cmdMeasure(args []string) error {
	fs := flag.NewFlagSet("measure", flag.ExitOnError)
	nodesPath := fs.String("nodes", "out/deploy/nodes.json", "from `compose`")
	out := fs.String("out", "out/measure", "prometheus.yml + docker-compose.yml")
	scrape := fs.String("interval", "15s", "scrape interval")
	fs.Parse(args)
	b, err := os.ReadFile(*nodesPath)
	if err != nil {
		return err
	}
	var placed []placedNode
	if err := json.Unmarshal(b, &placed); err != nil {
		return err
	}
	if err := os.MkdirAll(*out, 0o755); err != nil {
		return err
	}
	var sb strings.Builder
	fmt.Fprintf(&sb, "global:\n  scrape_interval: %s\nscrape_configs:\n  - job_name: k1-nodes\n    metrics_path: /ext/metrics\n    static_configs:\n", *scrape)
	for _, n := range placed {
		kind := "host"
		if n.Mother {
			kind = "mother"
		}
		fmt.Fprintf(&sb, "      - targets: [\"%s:%d\"]\n        labels: { node: %s, machine: %s, kind: %s }\n", n.Machine.IP, n.APIPort, n.Name, n.Machine.Name, kind)
	}
	sb.WriteString(`
# The gates read these series (names found on the drill, EVIDENCE 0.5):
#   avalanche_platformvm_validator_sets_created / _cached / _duration_sum / _height_diff_sum
#   avalanche_network_peers                      (≈ 80 on every node)
#   process_resident_memory_bytes                (per node; plugins are separate processes → use 10-measure-plugins.sh)
`)
	if err := os.WriteFile(filepath.Join(*out, "prometheus.yml"), []byte(sb.String()), 0o644); err != nil {
		return err
	}
	compose := `# Measure VM: docker compose up -d ; UI on :9090
services:
  prometheus:
    image: prom/prometheus:v2.53.0
    container_name: k1-prometheus
    restart: unless-stopped
    ports: ["9090:9090"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prom-data:/prometheus
    command: ["--config.file=/etc/prometheus/prometheus.yml", "--storage.tsdb.retention.time=45d"]
volumes:
  prom-data:
`
	if err := os.WriteFile(filepath.Join(*out, "docker-compose.yml"), []byte(compose), 0o644); err != nil {
		return err
	}
	fmt.Printf("✓ measure: %d scrape targets → %s\n", len(placed), *out)
	return nil
}
