// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC20PresetMinterPauser} from "../../openzeppelin-contracts-master/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract MockUSD is ERC20PresetMinterPauser {
    constructor(string memory name, string memory symbol) ERC20PresetMinterPauser(name, symbol) {

    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }


}
