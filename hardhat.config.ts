import "@nomicfoundation/hardhat-toolbox";
import {HardhatUserConfig} from "hardhat/types";


require('dotenv').config();
// import { infuraApiKey, privateKey, mnemonic, etherscanApiKey, bscnode } from "./network_keys/secrets.json";
// const Infura = {
//   Mainnet: "https://mainnet.infura.io/v3/" + infuraApiKey,
//   Ropsten: "https://ropsten.infura.io/v3/" + infuraApiKey,
//   Rinkeby: "https://rinkeby.infura.io/v3/" + infuraApiKey,
//   Kovan: "https://kovan.infura.io/v3/" + infuraApiKey,
//   Polygon: "https://polygon.infura.io/v3/" + infuraApiKey,
//   BSC: "https://bsc-dataseed1.binance.org "
// };

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
                url:"https://ethereum-sepolia-rpc.publicnode.com"
            }
        },
        sepolia: {
            url: "https://eth-sepolia-public.unifra.io"
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
        },
        amoy: {
            url: "https://rpc.ankr.com/polygon_amoy"
        }
  },
    etherscan: {
        apiKey: {
            amoy: "TEQ19XID1J62XH8XZJF2AF35A628RCZN6X",
        },
        customChains: [
            {
                network: "amoy",
                chainId: 80002,
                urls: {
                    apiURL: "https://api-amoy.polygonscan.com/api",
                    browserURL: "https://amoy.polygonscan.com/"
                },
            }
        ]
    },
    sourcify:{
        enabled:"true"
    }

};
export default config;