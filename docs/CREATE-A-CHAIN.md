# Create your own chain on 9Chain Testnet A1

**A guide for someone starting from nothing.** You need to know nothing about blockchains before
reading it. Allow about **15 minutes**, of which **3** are spent waiting while the network builds
your chain.

What you end up with: a blockchain **of your own**, owned by your wallet, genuinely running on the
test network — reachable from MetaMask, able to host contracts, open to anyone you invite.

> ⚠️ **This is a TEST network.** LOVE9 here **has no real value**. It exists so you have something
> to pay fees with while you experiment. Do not buy it, do not sell it, do not accept it as payment.

> 🔴 **Chains created before 2026-09-01 will be erased.** The network is being rebuilt that day, and
> every chain created on it disappears with it — including yours. This is not a risk, it is a
> scheduled event we already know about, so we would rather you hear it here than discover it.
> If you want to keep what you build, create it after the rebuild. A test network can be rebuilt
> again; we will say so before it happens.

---

## Before you start — three common questions

**What does "your own chain" mean?**
An independent blockchain with its own ledger, its own token and its own fee rules. It runs on
9Chain-A1's infrastructure, but the data and the control are yours. Avalanche calls this an **L1**.

**What does it cost?**
Nothing. The network pays the fee to build it. All you need is a wallet.

**Who owns the chain?**
The wallet you sign with in Step 4. The owner address is **taken from your signature** — nobody
types it, including you. Choose the right wallet from the start: that address goes into the chain's
foundations and **cannot be changed afterwards**.

---

## Step 1 · Install MetaMask

MetaMask is a crypto wallet that lives in your browser. It holds your keys and signs on your behalf.

1. Go to **https://metamask.io** and install the extension for your browser.
2. Create a new wallet and set a password.
3. 🔴 **Write the 12 recovery words on paper and store them safely.** Lose them and the wallet is
   gone for good — nobody can restore it for you, 9Chain included.

Already have MetaMask? Skip this step.

---

## Step 2 · Add the A1 network to your wallet

Out of the box MetaMask only knows about Ethereum. You have to tell it where A1 is.

1. Open **https://a1.9chain.org/faucet/**
2. Click **"Add network to wallet"**
3. MetaMask shows a confirmation box → click **Approve**

Done. **Do not type the settings by hand** — one wrong digit costs half an hour of searching.

<details>
<summary>If you would rather enter them manually (click to open)</summary>

| Field | Value |
|---|---|
| Network name | `9Chain Testnet A1` |
| RPC URL | `https://rpc-a1.9chain.org/ext/bc/C/rpc` |
| Chain ID | `9000000009` |
| Currency symbol | `LOVE9` |
| Decimals | `18` |
| Block explorer | `https://a1.9scan.org` |

</details>

> 🔴 **If you added the A1 network at some earlier point:** delete it and add it again with the
> button above. The old configuration may point at `rpc-testnet-a1.9chain.org`, an address that
> **no longer works**. A wallet pointing there reports a connection error that looks exactly like a
> dead network, while the network is running perfectly well.

---

## Step 3 · Get test tokens

You need a little LOVE9 to pay fees once you start using your chain.

1. Stay on **https://a1.9chain.org/faucet/**
2. Copy your wallet address from MetaMask (the string beginning `0x…`) and paste it into the box
3. Click **"Send me tokens"**

The tokens arrive in a few seconds. If MetaMask still shows zero, check that the wallet is on the
**9Chain Testnet A1** network — top left in MetaMask.

> **Why does my wallet show 18 decimals when elsewhere it says 9?**
> LOVE9 uses 18 decimals on the C-Chain, which is the one MetaMask talks to, and 9 decimals on the
> network's other two chains. **One coin, two scales** — not two different tokens.

---

## Step 4 · Create the chain

1. Open **https://a1.9chain.org/create-chain/**

   ⚠️ If the page says *"No wallet found in this browser"*, you have opened it in a browser without
   MetaMask. Go back to Step 1. The form only appears after a wallet connects — that is the design,
   not a fault.

2. Click **"Connect wallet"** and choose your wallet in MetaMask.

3. MetaMask asks you to **sign a message**. Sign it.

   This is **not a transaction**: it costs nothing and moves nothing. It only proves you hold the
   key to that wallet.

4. **Name your chain.** The name has to be unused. If it is taken, the page says so and you pick
   another. Capitalisation does not make a name free: `MyChain` and `mychain` count as the same name.

5. **Pick one of the six configurations** from the table below. If unsure, choose `standard`.

6. Press the create button, then **wait about three minutes**. The network has to build the chain
   and restart its nodes so they begin serving it.

> 🔴 **If your browser shows error `524` or "timed out" — DO NOT press the button again.**
> Building a chain takes roughly 170 seconds, and the protection layer in front cuts the connection
> at around 100. Your chain **is still being built normally**. Wait another two minutes, then open
> **https://a1.9chain.org/chains/** — if your chain is in the list, it finished.
> Pressing create again only produces a second chain.

---

## The six configurations — which one

| Configuration | Who it is for | The trade-off |
|---|---|---|
| **standard** — *Standard* | Most people. A plain EVM chain; you receive every genesis token and the right to change fees | Nothing special |
| **zero-fee** — *Near-zero fees* | Games, experiments, internal chains. Fees are effectively zero | Almost nothing stands in the way of spam |
| **high-throughput** — *High throughput* | Apps with a steady stream of small transactions. Five times as many transactions per block | Heavier blocks; whoever runs a node for this chain needs a stronger machine |
| **mintable** — *Mintable supply* | When you need to issue more tokens later | ⚠️ **The supply is not fixed.** Anyone using your chain has to be told this |
| **owner-deploy-only** — *Owner-only contract deployment* | A chain where only you may deploy contracts | Everyone else can still send transactions and use existing contracts |
| **permissioned** — *Permissioned* | An internal company chain | ⚠️ The strictest one: only listed addresses can **send** transactions at all |

**You do not choose the chain number (chainId).** The network assigns the first free one. You choose
a **name** and a **configuration**, and that is all.

---

## Step 5 · Add your chain to MetaMask

Once it is built, the page shows your chain's details. Two of them matter:

- **RPC** — the address of your chain
- **Chain ID** — your chain's number

In MetaMask go to *Settings → Networks → Add network → Add a network manually*, enter those two
values, and give the network and its token whatever name and symbol you like.

Your wallet now has **two** networks: A1 itself, for getting tokens and creating chains, and **your
own chain**. Switch between them from the menu at the top left of MetaMask.

---

## 🔴 The first transaction on a new chain — read this before you try

A newly created chain has no blocks except its first, and that makes **fee estimation wrong**. The
consequence: your first transaction **runs out of fee partway through and fails without giving a
reason** — it looks exactly like "this feature is not enabled". From the second block onwards
everything behaves normally.

**How to get past it:** make your first transaction an ordinary **transfer** — sending a little
LOVE9 from your wallet to your own wallet is fine. That kind of transaction costs exactly 21,000
fee units, fixed, with nothing to estimate. After that, deploying contracts and calling functions
all work normally.

If you must do something else first, set the fee limit manually to **300,000**.

---

## Common problems

| What you see | Why | What to do |
|---|---|---|
| The create page has no fields to fill in | MetaMask is not installed, or the wallet is not connected | Install MetaMask, reload, click *Connect wallet* |
| Wallet shows a balance of 0 after using the faucet | The wallet is on a different network | Switch to *9Chain Testnet A1*, top left |
| Wallet reports a network connection error | Old configuration pointing at an address that no longer works | Delete the A1 network in your wallet and add it again with the button in Step 2 |
| Error `524` while creating a chain | The chain is still being built; the browser simply ran out of patience | **Do not press again.** Wait 2 minutes, check `/chains/` |
| First transaction fails with no reason given | Fee estimation is wrong on the first block | See the section just above |
| Your chain is not in the directory yet | It has not finished coming up | Wait another minute and reload |

---

## Vocabulary — enough to read this whole page

| Term | Meaning |
|---|---|
| **Wallet** | Software that holds your keys and signs for you. Here, MetaMask |
| **Address** | A string beginning `0x…`. Like an account number — safe to share |
| **Key / 12 recovery words** | What opens the wallet. **Never give them to anyone**, including someone claiming to be 9Chain |
| **Fee (gas)** | What each transaction costs, paid in the network's token |
| **Faucet** | A tap that hands out free tokens on a test network |
| **Testnet** | A test network. Its tokens have no real value |
| **L1** | An independent blockchain — the thing you are about to create |
| **Chain ID** | The number a wallet uses to tell networks apart |
| **RPC** | The address a wallet calls to talk to a network |
| **Explorer** | A site for looking up blocks and transactions. A1's is 9Scan-A1 |

---

## Still stuck

- Directory of every running chain: **https://a1.9chain.org/chains/**
- Look up blocks and transactions: **https://a1.9scan.org**
- Network home page: **https://a1.9chain.org**

🔴 **Once more:** this is a test network. The tokens have no value. Do not send real assets here,
and never give your 12 recovery words to anyone.

---

<sub>This English text is the **source** for every other translation of this page. Vietnamese:
[`CREATE-A-CHAIN.vi.md`](CREATE-A-CHAIN.vi.md). Translate from this file, not from a translation.</sub>
