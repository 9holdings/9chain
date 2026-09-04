// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/**
 * Erc20 — the token IMPLEMENTATION that ships inside every 9Chain L1's genesis.
 *
 * ═══ WHY AN IMPLEMENTATION AND NOT A TOKEN ═══
 *
 * A genesis is immutable and every chain born from it carries these bytes forever. A token with a
 * balance already in it would mean writing mapping slots by hand into `alloc[...].storage`
 * (`keccak256(abi.encode(holder, 0))`), and one wrong slot is a token that is dead in an immutable
 * genesis with no way to fix it. So genesis carries CODE ONLY: this implementation has no state of
 * its own, and an owner mints their real token by cloning it after the chain is running.
 *
 * That is also why `initialize` exists instead of a constructor. A clone (EIP-1167) runs the
 * implementation's code against the CLONE's storage; a constructor would only ever run for the
 * implementation itself, which is precisely the thing that must stay empty.
 *
 * ═══ WHY THE IMPLEMENTATION LOCKS ITSELF ═══
 *
 * `initialize` can be called exactly once per storage. On the implementation that call would give
 * a stranger a token whose address every chain shares — harmless in that nobody should hold it,
 * dangerous in that a wallet reading `name()` off the implementation would see whatever they set.
 * `_initialized` guards it and the guard costs nothing to a legitimate clone.
 *
 * ═══ WHAT IT DELIBERATELY IS NOT ═══
 *
 * No mint after initialisation, no burn, no owner, no pause, no upgrade. An L1 owner who needs
 * those deploys their own contract; native-token minting is a precompile question, not this one.
 * Every added power here is a power stamped into every future chain of the network with no way to
 * take it back.
 */
contract Erc20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    bool private _initialized;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    error AlreadyInitialized();
    error ZeroAddress();
    error InsufficientBalance();
    error InsufficientAllowance();

    /**
     * Set up a clone. Callable once per storage, so once on each clone and — because the
     * deployment leaves it untouched — once, by whoever is first, on the implementation itself.
     * Nothing of value lives there.
     */
    function initialize(
        string calldata name_,
        string calldata symbol_,
        uint8 decimals_,
        uint256 supply_,
        address holder_
    ) external {
        if (_initialized) revert AlreadyInitialized();
        if (holder_ == address(0)) revert ZeroAddress();
        _initialized = true;
        name = name_;
        symbol = symbol_;
        decimals = decimals_;
        totalSupply = supply_;
        balanceOf[holder_] = supply_;
        emit Transfer(address(0), holder_, supply_);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        // The usual exemption: an unlimited allowance is not decremented, so it stays unlimited.
        if (allowed != type(uint256).max) {
            if (allowed < value) revert InsufficientAllowance();
            allowance[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) private {
        if (to == address(0)) revert ZeroAddress();
        uint256 bal = balanceOf[from];
        if (bal < value) revert InsufficientBalance();
        unchecked {
            balanceOf[from] = bal - value;
            balanceOf[to] += value;
        }
        emit Transfer(from, to, value);
    }
}
