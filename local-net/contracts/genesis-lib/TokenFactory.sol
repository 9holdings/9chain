// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/**
 * TokenFactory — clones the genesis Erc20 implementation, so an L1 owner can create a token with
 * one transaction and no compiler.
 *
 * ═══ WHY CLONES AND NOT A FULL DEPLOYMENT ═══
 *
 * EIP-1167 minimal proxy: 45 bytes of runtime that delegatecall everything to a fixed
 * implementation. A token therefore costs a few tens of thousands of gas instead of a full
 * contract deployment, and every token on the chain runs code that was reviewed once — the bytes
 * already frozen into the genesis. It also means a wallet can verify a token by checking that its
 * proxy points at the implementation address the chain published, rather than by reading bytecode.
 *
 * ═══ 🔴 WHY THE IMPLEMENTATION ADDRESS IS `constant` AND NOT `immutable` ═══
 *
 * Genesis `alloc` installs CODE. It does not run a constructor. An `immutable` is written into the
 * deployed bytecode BY the constructor, so a factory placed in genesis with an `immutable` field
 * would carry a zeroed slot: every clone it made would delegatecall to address zero, and the chain
 * could never be fixed. Nothing would report it — the factory deploys, the transaction succeeds,
 * and the token is a proxy in front of nothing.
 *
 * `constant` is inlined by the compiler, so it is already in the bytes solc emits and needs no
 * constructor at all. The price is that the address must be decided BEFORE compiling. That is the
 * right way round here: 9Chain chooses these addresses, and `lib/l1-contracts.mjs` places the
 * implementation at exactly this one. The compile step asserts the two agree.
 *
 * ═══ WHAT `create2` BUYS ═══
 *
 * A salt chosen by the caller makes the token's address knowable before it exists — the same
 * token address can be arranged on several 9Chain L1s, which is what makes cross-chain messaging
 * about a token bearable to reason about. `predict` returns it without spending anything.
 */
contract TokenFactory {
    /// The Erc20 implementation frozen into this chain's genesis. See the header for why `constant`.
    address public constant implementation = 0x0900000000000000000000000000000000000001;

    event TokenCreated(address indexed token, address indexed creator, bytes32 salt);

    error CloneFailed();
    error AlreadyTaken();

    /**
     * Create a token at a deterministic address and initialise it in the same transaction.
     * Initialising here, rather than leaving it to a second call, closes the window in which
     * somebody else could initialise a freshly created clone with their own numbers.
     */
    function createToken(
        bytes32 salt,
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_,
        uint256 supply_,
        address holder_
    ) external returns (address token) {
        token = _clone(salt);
        Erc20Initializer(token).initialize(name_, symbol_, decimals_, supply_, holder_);
        emit TokenCreated(token, msg.sender, salt);
    }

    /// The address `createToken` would produce for this salt. Costs nothing; answers before the fact.
    function predict(bytes32 salt) external view returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff), address(this), salt, keccak256(_initCode())
        )))));
    }

    function _clone(bytes32 salt) private returns (address token) {
        bytes memory code = _initCode();
        assembly {
            token := create2(0, add(code, 0x20), mload(code), salt)
        }
        if (token == address(0)) revert AlreadyTaken();
        if (token.code.length == 0) revert CloneFailed();
    }

    /// EIP-1167 minimal proxy init code, with `implementation` spliced into its 20-byte slot.
    function _initCode() private pure returns (bytes memory) {
        return abi.encodePacked(
            hex"3d602d80600a3d3981f3363d3d373d3d3d363d73",
            implementation,
            hex"5af43d82803e903d91602b57fd5bf3"
        );
    }
}

interface Erc20Initializer {
    function initialize(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_,
        uint256 supply_,
        address holder_
    ) external;
}
