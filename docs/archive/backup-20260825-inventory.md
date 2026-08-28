# INVENTORY - backup bundle 9chain-a1-backup-20260825-064053 (deleted 2026-08-28)

Recorded immediately before deletion, per D-107 (LIST -> DELETE -> VERIFY).
David approved deletion twice: once assuming it was a dead-network bundle, and again
after being shown it was the ONLY backup holding validator identities and chain data.
This file is what survives it.

Reason: it carried dev/net-public/chain-factory-key.txt, byte-identical to the key
holding ~90 LOVE9 on the LIVE g0 network (D-117b). The bundle was unencrypted - its own
MANIFEST said so - and sat on the same single drive as everything else.

Everything below belonged to networkID 9001, a generation that died on 2026-08-26.

```
       10445  6d9ed2def934043b  MANIFEST.txt
        9198  a2783a403ee3a76c  RESTORE.md
   682323768  f6dbb7b622968fa0  chaindata/a1-chaindata-node5.tar.gz
        2983  03eecf888b0d34b1  dev/net-public/allocation.md
         495  ced0f04f784db89e  dev/net-public/chain-factory-key.txt
        5510  805864c74c4eb805  dev/net-public/docker-compose.multinode.yml
         258  f69599dbe15034c9  dev/net-public/faucet.env
        5345  8fdb4603f47ee185  dev/net-public/genesis.json
        2871  180a2aa16720f1e4  dev/net-public/keys.txt
          32  2dd95706d06e5dfd  dev/net-public/node1/signer.key
         432  1f557149f955cacf  dev/net-public/node1/staker.crt
         241  efaeadac8316f391  dev/net-public/node1/staker.key
          32  f5835a7d802f1ea6  dev/net-public/node2/signer.key
         428  a9cd9993e5719f65  dev/net-public/node2/staker.crt
         241  b75cbf6f2524a0d2  dev/net-public/node2/staker.key
          32  55e59be98b7c4102  dev/net-public/node3/signer.key
         428  78d56f5ef7968f2c  dev/net-public/node3/staker.crt
         241  d6de2aa8c377eeed  dev/net-public/node3/staker.key
          32  f93400f5f18ad743  dev/net-public/node4/signer.key
         432  0678f2bca57947ae  dev/net-public/node4/staker.crt
         241  4b0b006a1d23a33d  dev/net-public/node4/staker.key
          32  f7f8b0203445b0b5  dev/net-public/node5/signer.key
         428  afe36536c900575a  dev/net-public/node5/staker.crt
         241  ed8f0e63311d331c  dev/net-public/node5/staker.key
      295044  c0c82fbe68c77f31  git/9chain-a1.bundle
        1293  6196b77cb052b7d1  git/avalanchego-patches/0001-9chain-a1-tat-chuan-hoa-xuong-dong-cho-cay-fork-chon.patch
       11694  2c30eb35e408c0e7  git/avalanchego-patches/0002-9chain-a1-lop-identity-tham-so-mang-chu-quyen.patch
       52463  809a18ca9d817982  git/avalanchego-patches/0003-9chain-a1-bo-cong-cu-chu-quyen-netgen-cli-create-l1-.patch
        2455  12c8c3abcb6827de  git/avalanchego-patches/0004-9chain-a1-netgen-sinh-them-upstream-du-phong-cho-RPC.patch
         294  71f1abe1f7a82cbf  git/avalanchego-patches/BASE.txt
       25490  02f319aed02c6d94  server/a1-server-critical.tar.gz
```
