import { BigNumber } from "ethers";
import hre from "hardhat";


const decimals = BigNumber.from(10).pow(18);
const SUPPLY = BigNumber.from("100000000").mul(decimals);
const NAME = "TestUFI";
const SYMBOL = "tUFI";

async function main(){
    const deployer = new hre.ethers.Wallet(process.env.PRIVATE_KEY as string, hre.ethers.provider);
    const ERC20 = await hre.ethers.getContractFactory("TestTokenFaucet");
    const token = await ERC20.connect(deployer).deploy(SUPPLY, NAME, SYMBOL);
    const contract = await token.deployed();
    console.log("Test UFI address : ", contract.address);
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  