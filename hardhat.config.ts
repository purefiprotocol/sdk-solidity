import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-chai-matchers";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-contract-sizer";
import "hardhat-storage-layout";

require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: {
    version : "0.8.19",
    settings : {
      optimizer : {
        enabled : true,
        runs : 200
      }
    }
  },
  networks: {
    hardhat: {
    },
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com"
    }
  }
  

};
export default config;
