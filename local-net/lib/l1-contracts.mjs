// l1-contracts.mjs — GENERATED ARTIFACT, do not edit by hand.
//
// Rebuild:  node local-net/contracts/genesis-lib/compile.mjs
//
// solc    : 0.8.26+commit.8a97fa7a.Linux.g++   (image ethereum/solc:0.8.26, --optimize --optimize-runs 200)
// sources : Erc20.sol sha256:6dd1ed440307f8c7\n//           TokenFactory.sol sha256:9f2d435f992e37ab\n//           Multicall3.sol sha256:4786aee1afad4bf7
// size    : 6761 bytes of code added to a genesis that includes the whole library
//
// 🔴 These are RUNTIME bytecodes. Genesis `alloc` installs code and never runs a constructor, so
// creation bytecode here would put a deployment script into the account permanently. See the
// compile script's header for the rest of the reasoning, including why TokenFactory's
// implementation address is a `constant`.
//
// 🔴 Multicall3 here is ABI-COMPATIBLE with the widely deployed one, compiled from this repo's
// source, at a 9Chain address. It is NOT byte-identical to the canonical deployment and NOT at
// `0xcA11bde0…`, because that address is produced by replaying a signed transaction and a genesis
// cannot do that. Tools that hard-code the canonical address will not find it.

export const SOLC_VERSION = "0.8.26+commit.8a97fa7a.Linux.g++";
export const SOURCE_HASHES = Object.freeze({
  "Erc20.sol": "6dd1ed440307f8c7",
  "TokenFactory.sol": "9f2d435f992e37ab",
  "Multicall3.sol": "4786aee1afad4bf7"
});
export const CONTRACTS = Object.freeze({
  "erc20Implementation": {
    "address": "0x0900000000000000000000000000000000000001",
    "code": "0x608060405234801561000f575f80fd5b506004361061009b575f3560e01c806370a082311161006357806370a082311461012957806395d89b4114610148578063a9059cbb14610150578063dd62ed3e14610163578063f35718191461018d575f80fd5b806306fdde031461009f578063095ea7b3146100bd57806318160ddd146100e057806323b872dd146100f7578063313ce5671461010a575b5f80fd5b6100a76101a2565b6040516100b491906104f3565b60405180910390f35b6100d06100cb366004610543565b61022d565b60405190151581526020016100b4565b6100e960035481565b6040519081526020016100b4565b6100d061010536600461056b565b610299565b6002546101179060ff1681565b60405160ff90911681526020016100b4565b6100e96101373660046105a5565b60046020525f908152604090205481565b6100a7610329565b6100d061015e366004610543565b610336565b6100e96101713660046105c5565b600560209081525f928352604080842090915290825290205481565b6101a061019b36600461063b565b61034b565b005b5f80546101ae906106da565b80601f01602080910402602001604051908101604052809291908181526020018280546101da906106da565b80156102255780601f106101fc57610100808354040283529160200191610225565b820191905f5260205f20905b81548152906001019060200180831161020857829003601f168201915b505050505081565b335f8181526005602090815260408083206001600160a01b038716808552925280832085905551919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925906102879086815260200190565b60405180910390a35060015b92915050565b6001600160a01b0383165f9081526005602090815260408083203384529091528120545f19811461031357828110156102e5576040516313be252b60e01b815260040160405180910390fd5b6102ef8382610712565b6001600160a01b0386165f9081526005602090815260408083203384529091529020555b61031e858585610426565b506001949350505050565b600180546101ae906106da565b5f610342338484610426565b50600192915050565b60065460ff161561036e5760405162dc149f60e41b815260040160405180910390fd5b6001600160a01b0381166103955760405163d92e233d60e01b815260040160405180910390fd5b6006805460ff191660011790555f6103ae878983610791565b5060016103bc858783610791565b506002805460ff191660ff851617905560038290556001600160a01b0381165f818152600460209081526040808320869055518581527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef910160405180910390a350505050505050565b6001600160a01b03821661044d5760405163d92e233d60e01b815260040160405180910390fd5b6001600160a01b0383165f908152600460205260409020548181101561048657604051631e9acf1760e31b815260040160405180910390fd5b6001600160a01b038085165f8181526004602052604080822086860390559286168082529083902080548601905591517fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef906104e59086815260200190565b60405180910390a350505050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b038116811461053e575f80fd5b919050565b5f8060408385031215610554575f80fd5b61055d83610528565b946020939093013593505050565b5f805f6060848603121561057d575f80fd5b61058684610528565b925061059460208501610528565b929592945050506040919091013590565b5f602082840312156105b5575f80fd5b6105be82610528565b9392505050565b5f80604083850312156105d6575f80fd5b6105df83610528565b91506105ed60208401610528565b90509250929050565b5f8083601f840112610606575f80fd5b50813567ffffffffffffffff81111561061d575f80fd5b602083019150836020828501011115610634575f80fd5b9250929050565b5f805f805f805f60a0888a031215610651575f80fd5b873567ffffffffffffffff811115610667575f80fd5b6106738a828b016105f6565b909850965050602088013567ffffffffffffffff811115610692575f80fd5b61069e8a828b016105f6565b909650945050604088013560ff811681146106b7575f80fd5b9250606088013591506106cc60808901610528565b905092959891949750929550565b600181811c908216806106ee57607f821691505b60208210810361070c57634e487b7160e01b5f52602260045260245ffd5b50919050565b8181038181111561029357634e487b7160e01b5f52601160045260245ffd5b634e487b7160e01b5f52604160045260245ffd5b601f82111561078c57805f5260205f20601f840160051c8101602085101561076a5750805b601f840160051c820191505b81811015610789575f8155600101610776565b50505b505050565b67ffffffffffffffff8311156107a9576107a9610731565b6107bd836107b783546106da565b83610745565b5f601f8411600181146107ee575f85156107d75750838201355b5f19600387901b1c1916600186901b178355610789565b5f83815260208120601f198716915b8281101561081d57868501358255602094850194600190920191016107fd565b5086821015610839575f1960f88860031b161c19848701351681555b505060018560011b018355505050505056fea2646970667358221220e2223992a578f2cb6aeb121ac0610b5491efc11c68f2ca5fe00dfe1885533cf064736f6c634300081a0033",
    "bytes": 2177,
    "abi": [
      {
        "inputs": [],
        "name": "AlreadyInitialized",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InsufficientAllowance",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ZeroAddress",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "name_",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol_",
            "type": "string"
          },
          {
            "internalType": "uint8",
            "name": "decimals_",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "supply_",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "holder_",
            "type": "address"
          }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  "tokenFactory": {
    "address": "0x0900000000000000000000000000000000000002",
    "code": "0x608060405234801561000f575f80fd5b506004361061003f575f3560e01c80630e787cce146100435780635c60da1b146100725780638db89ec414610080575b5f80fd5b61005661005136600461029b565b610093565b6040516001600160a01b03909116815260200160405180910390f35b6100566001600960981b0181565b61005661008e3660046102f7565b610111565b5f6001600160f81b031930836100a76101cf565b80516020918201206040516100f395949392016001600160f81b031994909416845260609290921b6bffffffffffffffffffffffff191660018401526015830152603582015260550190565b60408051601f19818403018152919052805160209091012092915050565b5f61011b8961022d565b60405163f357181960e01b81529091506001600160a01b0382169063f357181990610156908b908b908b908b908b908b908b906004016103d6565b5f604051808303815f87803b15801561016d575f80fd5b505af115801561017f573d5f803e3d5ffd5b50506040518b81523392506001600160a01b03841691507f9ea39db4a398b469ed3a81a577108b4218a8642c91546deb19e4e16ba351d34e9060200160405180910390a398975050505050505050565b60408051733d602d80600a3d3981f3363d3d373d3d3d363d7360601b6020820152600160601b600960f81b0160348201526e5af43d82803e903d91602b57fd5bf360881b604882015281516037818303018152605790910190915290565b5f806102376101cf565b9050828151602083015ff591506001600160a01b03821661026b57604051630c0e5cf760e21b815260040160405180910390fd5b816001600160a01b03163b5f03610295576040516342bcb05b60e11b815260040160405180910390fd5b50919050565b5f602082840312156102ab575f80fd5b5035919050565b5f8083601f8401126102c2575f80fd5b50813567ffffffffffffffff8111156102d9575f80fd5b6020830191508360208285010111156102f0575f80fd5b9250929050565b5f805f805f805f8060c0898b03121561030e575f80fd5b88359750602089013567ffffffffffffffff81111561032b575f80fd5b6103378b828c016102b2565b909850965050604089013567ffffffffffffffff811115610356575f80fd5b6103628b828c016102b2565b909650945050606089013560ff8116811461037b575f80fd5b92506080890135915060a08901356001600160a01b038116811461039d575f80fd5b809150509295985092959890939650565b81835281816020850137505f828201602090810191909152601f909101601f19169091010190565b60a081525f6103e960a08301898b6103ae565b82810360208401526103fc81888a6103ae565b60ff969096166040840152505060608101929092526001600160a01b031660809091015294935050505056fea2646970667358221220ab5a9614a8475ca20d4ec8f01a254d8fefd61df0afc1c45ae5792a725cad24f364736f6c634300081a0033",
    "bytes": 1118,
    "abi": [
      {
        "inputs": [],
        "name": "AlreadyTaken",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "CloneFailed",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "salt",
            "type": "bytes32"
          }
        ],
        "name": "TokenCreated",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "salt",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "name_",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol_",
            "type": "string"
          },
          {
            "internalType": "uint8",
            "name": "decimals_",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "supply_",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "holder_",
            "type": "address"
          }
        ],
        "name": "createToken",
        "outputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "implementation",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "salt",
            "type": "bytes32"
          }
        ],
        "name": "predict",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  },
  "multicall3": {
    "address": "0x0900000000000000000000000000000000000003",
    "code": "0x6080604052600436106100e4575f3560e01c806342cbb15c11610087578063a8b0574e11610057578063a8b0574e14610202578063bce38bd71461021c578063c3077fa91461022f578063ee82ac5e14610242575f80fd5b806342cbb15c146101a45780634d2301cc146101b657806382ad56cb146101dd57806386d516e8146101f0575f80fd5b806327e86d6e116100c257806327e86d6e1461014a5780633408e4701461015e578063399542e9146101705780633e64a69614610192575f80fd5b80630f28c97d146100e8578063174dea7114610109578063252dba4214610129575b5f80fd5b3480156100f3575f80fd5b50425b6040519081526020015b60405180910390f35b61011c610117366004610a11565b610260565b6040516101009190610af1565b61013c610137366004610a11565b6104af565b604051610100929190610b0a565b348015610155575f80fd5b506100f6610619565b348015610169575f80fd5b50466100f6565b61018361017e366004610b88565b61062b565b60405161010093929190610bd7565b34801561019d575f80fd5b50486100f6565b3480156101af575f80fd5b50436100f6565b3480156101c1575f80fd5b506100f66101d0366004610bfe565b6001600160a01b03163190565b61011c6101eb366004610a11565b610646565b3480156101fb575f80fd5b50456100f6565b34801561020d575f80fd5b50604051418152602001610100565b61011c61022a366004610b88565b61080f565b61018361023d366004610a11565b6109ab565b34801561024d575f80fd5b506100f661025c366004610c24565b4090565b60605f8267ffffffffffffffff81111561027c5761027c610c3b565b6040519080825280602002602001820160405280156102c157816020015b604080518082019091525f81526060602082015281526020019060019003908161029a5790505b5091505f5b83811015610487578484828181106102e0576102e0610c4f565b90506020028101906102f29190610c63565b610300906040013583610c95565b91505f8086868481811061031657610316610c4f565b90506020028101906103289190610c63565b610336906020810190610bfe565b6001600160a01b031687878581811061035157610351610c4f565b90506020028101906103639190610c63565b6040013588888681811061037957610379610c4f565b905060200281019061038b9190610c63565b610399906060810190610cae565b6040516103a7929190610cf1565b5f6040518083038185875af1925050503d805f81146103e1576040519150601f19603f3d011682016040523d82523d5f602084013e6103e6565b606091505b50915091508115801561042b575086868481811061040657610406610c4f565b90506020028101906104189190610c63565b610429906040810190602001610d00565b155b1561044957604051633204506f60e01b815260040160405180910390fd5b604051806040016040528083151581526020018281525085848151811061047257610472610c4f565b602090810291909101015250506001016102c6565b503481146104a85760405163dd8e4af760e01b815260040160405180910390fd5b5092915050565b4360608267ffffffffffffffff8111156104cb576104cb610c3b565b6040519080825280602002602001820160405280156104fe57816020015b60608152602001906001900390816104e95790505b5090505f5b83811015610611575f8086868481811061051f5761051f610c4f565b90506020028101906105319190610d19565b61053f906020810190610bfe565b6001600160a01b031687878581811061055a5761055a610c4f565b905060200281019061056c9190610d19565b61057a906020810190610cae565b604051610588929190610cf1565b5f604051808303815f865af19150503d805f81146105c1576040519150601f19603f3d011682016040523d82523d5f602084013e6105c6565b606091505b5091509150816105e957604051633204506f60e01b815260040160405180910390fd5b808484815181106105fc576105fc610c4f565b60209081029190910101525050600101610503565b509250929050565b5f610625600143610d2d565b40905090565b438040606061063b86868661080f565b905093509350939050565b60608167ffffffffffffffff81111561066157610661610c3b565b6040519080825280602002602001820160405280156106a657816020015b604080518082019091525f81526060602082015281526020019060019003908161067f5790505b5090505f5b828110156104a8575f808585848181106106c7576106c7610c4f565b90506020028101906106d99190610d40565b6106e7906020810190610bfe565b6001600160a01b031686868581811061070257610702610c4f565b90506020028101906107149190610d40565b610722906040810190610cae565b604051610730929190610cf1565b5f604051808303815f865af19150503d805f8114610769576040519150601f19603f3d011682016040523d82523d5f602084013e61076e565b606091505b5091509150811580156107b3575085858481811061078e5761078e610c4f565b90506020028101906107a09190610d40565b6107b1906040810190602001610d00565b155b156107d157604051633204506f60e01b815260040160405180910390fd5b60405180604001604052808315158152602001828152508484815181106107fa576107fa610c4f565b602090810291909101015250506001016106ab565b60608167ffffffffffffffff81111561082a5761082a610c3b565b60405190808252806020026020018201604052801561086f57816020015b604080518082019091525f8152606060208201528152602001906001900390816108485790505b5090505f5b828110156109a3575f8085858481811061089057610890610c4f565b90506020028101906108a29190610d19565b6108b0906020810190610bfe565b6001600160a01b03168686858181106108cb576108cb610c4f565b90506020028101906108dd9190610d19565b6108eb906020810190610cae565b6040516108f9929190610cf1565b5f604051808303815f865af19150503d805f8114610932576040519150601f19603f3d011682016040523d82523d5f602084013e610937565b606091505b5091509150868015610947575081155b1561096557604051633204506f60e01b815260040160405180910390fd5b604051806040016040528083151581526020018281525084848151811061098e5761098e610c4f565b60209081029190910101525050600101610874565b509392505050565b5f8060606109bb6001868661062b565b919790965090945092505050565b5f8083601f8401126109d9575f80fd5b50813567ffffffffffffffff8111156109f0575f80fd5b6020830191508360208260051b8501011115610a0a575f80fd5b9250929050565b5f8060208385031215610a22575f80fd5b823567ffffffffffffffff811115610a38575f80fd5b610a44858286016109c9565b90969095509350505050565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b5f82825180855260208501945060208160051b830101602085015f5b83811015610ae557601f1985840301885281518051151584526020810151905060406020850152610ace6040850182610a50565b6020998a0199909450929092019150600101610a9a565b50909695505050505050565b602081525f610b036020830184610a7e565b9392505050565b5f604082018483526040602084015280845180835260608501915060608160051b8601019250602086015f5b82811015610b6757605f19878603018452610b52858351610a50565b94506020938401939190910190600101610b36565b5092979650505050505050565b80358015158114610b83575f80fd5b919050565b5f805f60408486031215610b9a575f80fd5b610ba384610b74565b9250602084013567ffffffffffffffff811115610bbe575f80fd5b610bca868287016109c9565b9497909650939450505050565b838152826020820152606060408201525f610bf56060830184610a7e565b95945050505050565b5f60208284031215610c0e575f80fd5b81356001600160a01b0381168114610b03575f80fd5b5f60208284031215610c34575f80fd5b5035919050565b634e487b7160e01b5f52604160045260245ffd5b634e487b7160e01b5f52603260045260245ffd5b5f8235607e19833603018112610c77575f80fd5b9190910192915050565b634e487b7160e01b5f52601160045260245ffd5b80820180821115610ca857610ca8610c81565b92915050565b5f808335601e19843603018112610cc3575f80fd5b83018035915067ffffffffffffffff821115610cdd575f80fd5b602001915036819003821315610a0a575f80fd5b818382375f9101908152919050565b5f60208284031215610d10575f80fd5b610b0382610b74565b5f8235603e19833603018112610c77575f80fd5b81810381811115610ca857610ca8610c81565b5f8235605e19833603018112610c77575f80fdfea2646970667358221220643d6d8ceca0fd81d2e243f65371466f8f3942e56a1ce025ea9132a4a641b4b464736f6c634300081a0033",
    "bytes": 3466,
    "abi": [
      {
        "inputs": [],
        "name": "CallFailed",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ValueMismatch",
        "type": "error"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "target",
                "type": "address"
              },
              {
                "internalType": "bytes",
                "name": "callData",
                "type": "bytes"
              }
            ],
            "internalType": "struct Multicall3.Call[]",
            "name": "calls",
            "type": "tuple[]"
          }
        ],
        "name": "aggregate",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "blockNumber",
            "type": "uint256"
          },
          {
            "internalType": "bytes[]",
            "name": "returnData",
            "type": "bytes[]"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "target",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "allowFailure",
                "type": "bool"
              },
              {
                "internalType": "bytes",
                "name": "callData",
                "type": "bytes"
              }
            ],
            "internalType": "struct Multicall3.Call3[]",
            "name": "calls",
            "type": "tuple[]"
          }
        ],
        "name": "aggregate3",
        "outputs": [
          {
            "components": [
              {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
              },
              {
                "internalType": "bytes",
                "name": "returnData",
                "type": "bytes"
              }
            ],
            "internalType": "struct Multicall3.Result[]",
            "name": "returnData",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "target",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "allowFailure",
                "type": "bool"
              },
              {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
              },
              {
                "internalType": "bytes",
                "name": "callData",
                "type": "bytes"
              }
            ],
            "internalType": "struct Multicall3.Call3Value[]",
            "name": "calls",
            "type": "tuple[]"
          }
        ],
        "name": "aggregate3Value",
        "outputs": [
          {
            "components": [
              {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
              },
              {
                "internalType": "bytes",
                "name": "returnData",
                "type": "bytes"
              }
            ],
            "internalType": "struct Multicall3.Result[]",
            "name": "returnData",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "target",
                "type": "address"
              },
              {
                "internalType": "bytes",
                "name": "callData",
                "type": "bytes"
              }
            ],
            "internalType": "struct Multicall3.Call[]",
            "name": "calls",
            "type": "tuple[]"
          }
        ],
        "name": "blockAndAggregate",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "blockNumber",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "blockHash",
            "type": "bytes32"
          },
          {
            "components": [
              {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
              },
              {
                "internalType": "bytes",
                "name": "returnData",
                "type": "bytes"
              }
            ],
            "internalType": "struct Multicall3.Result[]",
            "name": "returnData",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getBasefee",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "blockNumber",
            "type": "uint256"
          }
        ],
        "name": "getBlockHash",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getBlockNumber",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getChainId",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getCurrentBlockCoinbase",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getCurrentBlockGasLimit",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getCurrentBlockTimestamp",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "addr",
            "type": "address"
          }
        ],
        "name": "getEthBalance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getLastBlockHash",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bool",
            "name": "requireSuccess",
            "type": "bool"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "target",
                "type": "address"
              },
              {
                "internalType": "bytes",
                "name": "callData",
                "type": "bytes"
              }
            ],
            "internalType": "struct Multicall3.Call[]",
            "name": "calls",
            "type": "tuple[]"
          }
        ],
        "name": "tryAggregate",
        "outputs": [
          {
            "components": [
              {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
              },
              {
                "internalType": "bytes",
                "name": "returnData",
                "type": "bytes"
              }
            ],
            "internalType": "struct Multicall3.Result[]",
            "name": "returnData",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bool",
            "name": "requireSuccess",
            "type": "bool"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "target",
                "type": "address"
              },
              {
                "internalType": "bytes",
                "name": "callData",
                "type": "bytes"
              }
            ],
            "internalType": "struct Multicall3.Call[]",
            "name": "calls",
            "type": "tuple[]"
          }
        ],
        "name": "tryBlockAndAggregate",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "blockNumber",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "blockHash",
            "type": "bytes32"
          },
          {
            "components": [
              {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
              },
              {
                "internalType": "bytes",
                "name": "returnData",
                "type": "bytes"
              }
            ],
            "internalType": "struct Multicall3.Result[]",
            "name": "returnData",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      }
    ]
  }
});

/** The contract library, in the shape genesis `alloc` wants: address -> { code }. */
export function libraryAlloc() {
  const alloc = {};
  for (const c of Object.values(CONTRACTS)) {
    // `alloc` keys are BARE lower-case hex, no `0x` — the convention the console already uses.
    alloc[c.address.slice(2).toLowerCase()] = { balance: "0x0", code: c.code };
  }
  return alloc;
}
