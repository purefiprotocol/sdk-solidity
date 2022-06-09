/**
 * @type import('hardhat/config').HardhatUserConfig
 */
//  require("@nomiclabs/hardhat-ganache");
 require("@nomiclabs/hardhat-truffle5");

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    test: {
      fork:"https://bsc-dataseed1.binance.org",
      url: "http://127.0.0.1:8545",
      networkId: 5777,
      gasLimit: 40000000,
      defaultBalanceEther:10000,
    }

},
  solidity: "0.8.12",
  
};
