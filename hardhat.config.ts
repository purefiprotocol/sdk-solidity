import "@nomicfoundation/hardhat-toolbox";
import {HardhatUserConfig} from "hardhat/types";
import "@nomicfoundation/hardhat-chai-matchers";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-contract-sizer";
import "hardhat-storage-layout";

require('dotenv').config();
import { infuraApiKey, privateKey, mnemonic, etherscanApiKey, bscnode } from "./network_keys/secrets.json";
const Infura = {
  Mainnet: "https://mainnet.infura.io/v3/" + infuraApiKey,
  Ropsten: "https://ropsten.infura.io/v3/" + infuraApiKey,
  Rinkeby: "https://rinkeby.infura.io/v3/" + infuraApiKey,
  Kovan: "https://kovan.infura.io/v3/" + infuraApiKey,
  Polygon: "https://polygon.infura.io/v3/" + infuraApiKey,
  BSC: "https://bsc-dataseed1.binance.org "
};

const config: HardhatUserConfig = {
  solidity: {
      version: "0.8.25",
      settings: {
          optimizer: {
              enabled: true,
              runs: 200
          }
      }
  },
  networks: {
    hardhat: {
        forking: {
            url: "https://arb-pokt.nodies.app"
        }
    },
    sepolia: {
        url: "https://ethereum-sepolia-rpc.publicnode.com"
    },
    arbitrumSepolia: {
        url: 'https://sepolia-rollup.arbitrum.io/rpc',
        chainId: 421614,
    },
    tbsc: {
        url: "https://data-seed-prebsc-2-s1.bnbchain.org:8545"
    },
    arbitrum: {
        url: "https://arb-pokt.nodies.app"
    },
    optimism: {
        url: "https://op-pokt.nodies.app"
    },
    base: {
        url: "https://base-pokt.nodies.app"
    },
    rinkeby: {
      url: Infura.Rinkeby,
      gas: 10000000,
      gasPrice: 10000000000,
      accounts: { mnemonic : mnemonic }
    },
    mainnet : {
      url : Infura.Mainnet,
      gas: "auto",
      gasPrice: "auto",
      minGasPrice: 10000000000,
      accounts : { mnemonic : mnemonic }
    },
    ropsten : {
      url : Infura.Ropsten,
      gas: 5000000,
      gasPrice: 6000000000,
      accounts : { mnemonic : mnemonic }
    },
    kovan : {
      url : Infura.Kovan,
      gas: 10000000,
      accounts : { mnemonic : mnemonic }
    },
    bsc : {
      url : bscnode,
      gas: 5000000,
      gasPrice: 2000000000,
      accounts : { mnemonic : mnemonic }
    },

    bsctest : {
      url : "https://data-seed-prebsc-1-s1.binance.org:8545",
      gas: 5000000,
      gasPrice: 10000000000,
      accounts : { mnemonic : mnemonic }
    },
    auroratest : {
      url : "https://testnet.aurora.dev",
      accounts : { mnemonic : mnemonic }
    },
    auroramainnet : {
      url : "https://mainnet.aurora.dev",
      accounts : { mnemonic : mnemonic }
    },
    polygon_mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: { mnemonic : mnemonic }
    },
    polygon_mainnet : {
      url : Infura.Polygon,
      accounts : { mnemonic : mnemonic }
    },
    bitgert_testnet: {
      url: "https://testnet-rpc.brisescan.com",
      gasPrice: 20000000000,
      accounts: {mnemonic: mnemonic}
    },
    bitgert_mainnet: {
      url: "https://rpc.icecreamswap.com",
      chainId: 32520,
      gasPrice: 20000000000,
      accounts: {mnemonic: mnemonic}
    }
  },
  etherscan : {
    apiKey : etherscanApiKey,
  }
};
export default config;