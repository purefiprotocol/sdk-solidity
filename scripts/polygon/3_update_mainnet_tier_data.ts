import { ethers } from "hardhat";
import hre from "hardhat";
import { BigNumber, utils } from "ethers";

// const SUBSCRIPTION_SERVICE = "0x139D492Cce168c7B870383dF6b425FC5df447559";//POLYGON
const SUBSCRIPTION_SERVICE = "0x78c3De7461d893e1e9B15Ed2666Df3cDC033e851";//POLYGON_MUMBAI
// const SUBSCRIPTION_SERVICE = "0xbA5B61DFa9c182E202354F66Cb7f8400484d7071";//ETHEREUM MAINNET
// const SUBSCRIPTION_SERVICE = "0xBbC3Df0Af62b4a469DD44c1bc4e8804268dB1ea3";//BSC MAINNET
const decimals = ethers.BigNumber.from(10).pow(18);

const UFI_ADDRESS = "0x70892902C0BfFdEEAac711ec48F14c00b0fa7E3A";//POLYGON_MUMBAI

async function main(){

    const sub_service = await ethers.getContractAt("PureFiSubscriptionService", SUBSCRIPTION_SERVICE);

    let yearTS = 86400*365;
    let halfYearTS = yearTS/2;
    let USDdecimals = decimals;//10^18 // for current contract implementation
    // await(await sub_service.setTierData(1,yearTS,ethers.BigNumber.from(50).mul(USDdecimals),20,1,5)).wait();
    // await(await sub_service.setTierData(2,yearTS,ethers.BigNumber.from(100).mul(USDdecimals),20,1,15)).wait();
    // await(await sub_service.setTierData(3,yearTS,ethers.BigNumber.from(300).mul(USDdecimals),20,1,45)).wait();
    // await(await sub_service.setTierData(4,yearTS,ethers.BigNumber.from(10000).mul(USDdecimals),20,3000,10000)).wait();
    // await(await sub_service.setTierData(5,yearTS,ethers.BigNumber.from(5).mul(USDdecimals),20,1,3)).wait();
    // await(await sub_service.setTierData(10,yearTS,ethers.BigNumber.from(10000).mul(USDdecimals),20,1000,10000)).wait();
    //alpha-guilty
    await(await sub_service.setTierData(11,halfYearTS,ethers.BigNumber.from(500).mul(USDdecimals),20,0,600)).wait();
    // const ufi_token = await ethers.getContractAt("TestTokenFaucet", UFI_ADDRESS);
    // await(await ufi_token.approve(sub_service.address,BigNumber.from(500).mul(USDdecimals)));
    // await(await sub_service.subscribeFor(11, "0x10dE8d05576e9fc9DfEEd7254C03d544521dfE42"));
    // console.log("address subscribed");
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });