import { BigNumber } from "ethers";
import hre from "hardhat";


const deployer = new hre.ethers.Wallet(process.env.PRIVATE_KEY as string, hre.ethers.provider);
const decimals = BigNumber.from(10).pow(18);
const SUPPLY = BigNumber.from("100000000").mul(decimals);
const NAME = "TestUFI";
const SYMBOL = "tUFI";

export async function deployTestTokenFaucet(tokenAddress: string){
    const FaucetFactory = await hre.ethers.getContractFactory("MockUSDFaucet");
    const faucet = await FaucetFactory.connect(deployer).deploy(tokenAddress);
    const contract = await faucet.deployed();
    console.log("Faucet address : ", contract.address);

    return contract.address;
}
