// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.6;

import "../../openzeppelin-contracts-master/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract PPRoxy is TransparentUpgradeableProxy {
  
   constructor(
      address _logic,
      address admin_,
      bytes memory _data
    ) payable TransparentUpgradeableProxy(_logic, admin_, _data) {
    } 
}

