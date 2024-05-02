import "@nomicfoundation/hardhat-toolbox";
import {HardhatUserConfig} from "hardhat/types";
import "@nomicfoundation/hardhat-chai-matchers";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-contract-sizer";
import "hardhat-storage-layout";

require('dotenv').config();

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.19",
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
                url: "https://sepolia-rollup.arbitrum.io/rpc"
            }
        },
        sepolia: {
            url: "https://ethereum-sepolia-rpc.publicnode.com"
        },
        arbitrumSepolia: {
            url: 'https://sepolia-rollup.arbitrum.io/rpc',
            chainId: 421614,
            //accounts: [Sepolia_TESTNET_PRIVATE_KEY]
        },
        tbsc: {
            url: "https://data-seed-prebsc-2-s1.bnbchain.org:8545"
        },
        arbitrum: {
            url: "https://arbitrum.llamarpc.com"
        },
        optimism: {
            url: "https://optimism-rpc.publicnode.com"
        },
        base: {
            url: "https://base.llamarpc.com"
        }
    }


};
export default config;
