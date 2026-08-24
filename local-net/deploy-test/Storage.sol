// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// Contract kiểm thử trên L1 EVM của 9Chain-A1.
contract Storage {
    uint256 public value;
    address public lastSetter;

    event ValueChanged(address indexed by, uint256 value);

    function set(uint256 v) external {
        value = v;
        lastSetter = msg.sender;
        emit ValueChanged(msg.sender, v);
    }
}
