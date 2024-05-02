// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;

import "./MockUSD.sol";


contract MockUSDFaucet {

    mapping(address => uint64) public faucetPeriod; // address => timestamp for next faucet trigger
    uint64 blockPeriod;
    address MockUSDToken;

    constructor(address token) {
        blockPeriod = 24 * 60 * 60;
        MockUSDToken = token;
    }

    function giveMeTokens() external {
        uint64 nextMintTimestamp = faucetPeriod[msg.sender];
        require(block.timestamp >= nextMintTimestamp, "TestToken : Not enough time has passed");
        faucetPeriod[msg.sender] += blockPeriod;

        MockUSD(MockUSDToken).transfer(msg.sender, 50_000 * 10 ** 6);
    }

}