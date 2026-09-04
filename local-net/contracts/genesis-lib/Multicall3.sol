// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/**
 * Multicall3 — batch many `eth_call`s into one, so an explorer or wallet can read a chain's state
 * in a single round trip instead of hundreds.
 *
 * ═══ 🔴 READ THIS BEFORE TRUSTING THE NAME ═══
 *
 * This is ABI-COMPATIBLE with the widely deployed Multicall3, compiled from THIS source, and it
 * lives at a 9Chain address. It is **not** byte-identical to the canonical mainnet deployment and
 * it is **not** at the canonical `0xcA11bde0…` address, because that deployment is reproduced by
 * replaying a specific signed transaction, which a genesis `alloc` cannot do. Any tool that
 * hard-codes the canonical address will not find it; any tool that lets you configure the
 * multicall address will work. Saying otherwise in a document would be the kind of claim this repo
 * has learned to distrust: a name is not a measurement.
 *
 * ═══ WHY IT IS IN GENESIS AT ALL ═══
 *
 * Every indexer and most wallets want it, and on a brand-new L1 there is nobody to deploy it. It
 * holds no state, so putting it in `alloc` costs only its code — no storage slots to compute, and
 * nothing that can be wrong in a way an immutable genesis makes permanent.
 *
 * ⚠️ `aggregate3Value` is payable and forwards value. It holds nothing between calls, but a
 * mismatch between `msg.value` and the sum of the per-call values would strand funds here, so it
 * is checked.
 */
contract Multicall3 {
    struct Call {
        address target;
        bytes callData;
    }

    struct Call3 {
        address target;
        bool allowFailure;
        bytes callData;
    }

    struct Call3Value {
        address target;
        bool allowFailure;
        uint256 value;
        bytes callData;
    }

    struct Result {
        bool success;
        bytes returnData;
    }

    error CallFailed();
    error ValueMismatch();

    /// Every call must succeed, or the whole batch reverts.
    function aggregate(Call[] calldata calls)
        external
        payable
        returns (uint256 blockNumber, bytes[] memory returnData)
    {
        blockNumber = block.number;
        returnData = new bytes[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            (bool ok, bytes memory ret) = calls[i].target.call(calls[i].callData);
            if (!ok) revert CallFailed();
            returnData[i] = ret;
        }
    }

    /// Per-call tolerance of failure, decided per call.
    function aggregate3(Call3[] calldata calls) external payable returns (Result[] memory returnData) {
        returnData = new Result[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            (bool ok, bytes memory ret) = calls[i].target.call(calls[i].callData);
            if (!ok && !calls[i].allowFailure) revert CallFailed();
            returnData[i] = Result(ok, ret);
        }
    }

    /// As above, and sends value with each call. The sum must equal `msg.value` exactly.
    function aggregate3Value(Call3Value[] calldata calls) external payable returns (Result[] memory returnData) {
        uint256 total;
        returnData = new Result[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            total += calls[i].value;
            (bool ok, bytes memory ret) = calls[i].target.call{value: calls[i].value}(calls[i].callData);
            if (!ok && !calls[i].allowFailure) revert CallFailed();
            returnData[i] = Result(ok, ret);
        }
        if (total != msg.value) revert ValueMismatch();
    }

    /// One flag for the whole batch. Kept for tools written against the older interface.
    function tryAggregate(bool requireSuccess, Call[] calldata calls)
        public
        payable
        returns (Result[] memory returnData)
    {
        returnData = new Result[](calls.length);
        for (uint256 i = 0; i < calls.length; i++) {
            (bool ok, bytes memory ret) = calls[i].target.call(calls[i].callData);
            if (requireSuccess && !ok) revert CallFailed();
            returnData[i] = Result(ok, ret);
        }
    }

    function tryBlockAndAggregate(bool requireSuccess, Call[] calldata calls)
        public
        payable
        returns (uint256 blockNumber, bytes32 blockHash, Result[] memory returnData)
    {
        blockNumber = block.number;
        blockHash = blockhash(block.number);
        returnData = tryAggregate(requireSuccess, calls);
    }

    function blockAndAggregate(Call[] calldata calls)
        external
        payable
        returns (uint256 blockNumber, bytes32 blockHash, Result[] memory returnData)
    {
        (blockNumber, blockHash, returnData) = tryBlockAndAggregate(true, calls);
    }

    // ── the small getters batches ask for alongside real calls ──
    function getBlockHash(uint256 blockNumber) external view returns (bytes32) { return blockhash(blockNumber); }
    function getBlockNumber() external view returns (uint256) { return block.number; }
    function getCurrentBlockCoinbase() external view returns (address) { return block.coinbase; }
    function getCurrentBlockGasLimit() external view returns (uint256) { return block.gaslimit; }
    function getCurrentBlockTimestamp() external view returns (uint256) { return block.timestamp; }
    function getEthBalance(address addr) external view returns (uint256) { return addr.balance; }
    function getLastBlockHash() external view returns (bytes32) { return blockhash(block.number - 1); }
    function getBasefee() external view returns (uint256) { return block.basefee; }
    function getChainId() external view returns (uint256) { return block.chainid; }
}
