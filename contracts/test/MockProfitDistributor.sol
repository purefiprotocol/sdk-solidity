// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {Ownable} from "../../openzeppelin-contracts-master/contracts/access/Ownable.sol";
import "./MockUSD.sol";

interface IProfitDistributor {
    function setDistributionReadinessFlag() external;
}


contract MockProfitDistributor is IProfitDistributor, Ownable {

    MockUSD testToken;

    constructor(address token){
        testToken = MockUSD(token);
    }


    function setDistributionReadinessFlag() external {
        testToken.transfer(owner(), testToken.balanceOf(address(this)));
    }


}
