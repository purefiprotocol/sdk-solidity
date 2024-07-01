// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity ^0.8.0;

import {Ownable} from "../../openzeppelin-contracts-master/contracts/access/Ownable.sol";
import "../../openzeppelin-contracts-master/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract MockTokenBuyer is Ownable {
    uint256 public exchangeRate;
    uint256 public  denominator;
    //IERC20Metadata public token;


    constructor(
    //    address exchangeToken
    ) {
        exchangeRate = 100_000;
        denominator = 100_000;
       // token = IERC20Metadata(exchangeToken);
    }


    function setExchangeRate(uint256 newRate) external onlyOwner {
        exchangeRate = newRate;
    }

    function setDenominator(uint256 newDenominator) external onlyOwner {
        denominator = newDenominator;
    }

    function busdToUFI(uint256 _amountBUSD)
    external
    view
    returns (uint256, uint256)
    {
        //(uint newSubscriptionPriceInWBNB, uint256 newSubscriptionPriceInUFI) = tokenBuyer.busdToUFI(tiers[_tier].priceInUSD);

        return (1, (exchangeRate * _amountBUSD) / denominator);
    }
}
