import {ethers, upgrades} from "hardhat";
import hre from "hardhat";
import {deployTestTokenFaucet} from "./2_deploy_testnet_faucet_token";
import {BigNumber} from "ethers";


async function main() {
    const deployer = new hre.ethers.Wallet(process.env.PRIVATE_KEY as string, hre.ethers.provider);


    //bsc
    const SUBSCRIPTION_ADDRESS = "0x50677234058b95A67857c14B7102bA097820a6D2";
    const tokenAddress = "0xa784295ec77D69917bCFa97200897393e04e1c65";

    //arb-sep
    // const SUBSCRIPTION_ADDRESS = "0xab071899f06d0C4ba8294A3451638e5d8f460B42";
    // const tokenAddress = "0x4C960866dACd8b4B2cb0287B7079F36631F0AB28";


    const subscriptionsContract = await ethers.getContractAt("PureFiSubscriptionService", SUBSCRIPTION_ADDRESS);


    const token = await ethers.getContractAt("ERC20PresetMinterPauser", tokenAddress);


    //await (await token.connect(deployer).mint(deployer.address, 100n ** 12n)).wait(1);
    // await (await token.connect(deployer).approve(SUBSCRIPTION_ADDRESS, 1000n * 10n ** 12n)).wait(1);
    // await (await subscriptionsContract.connect(deployer).subscribe(5n)).wait(1);

    // await deployTestTokenFaucet();
    let yearTS = 86400 * 365;
    let USDdecimals = 10n ** 6n;//10^18 // for current contract implementation

    await (await subscriptionsContract.connect(deployer).setTierData(1, yearTS, BigNumber.from(50).mul(USDdecimals), 100, 1, 5)).wait();
    await (await subscriptionsContract.connect(deployer).setTierData(2, yearTS, BigNumber.from(100).mul(USDdecimals), 100, 1, 15)).wait();
    await (await subscriptionsContract.connect(deployer).setTierData(3, yearTS, BigNumber.from(300).mul(USDdecimals), 100, 1, 45)).wait();
    await (await subscriptionsContract.connect(deployer).setTierData(10, yearTS, BigNumber.from(10000).mul(USDdecimals), 100, 3000, 10000)).wait();
    await (await subscriptionsContract.connect(deployer).setTierData(5, yearTS, BigNumber.from(5).mul(USDdecimals), 100, 1, 3)).wait();

    // console.log('burnrate changed');
    //
    console.log(await subscriptionsContract.connect(deployer).getTierData(1))
    console.log(await subscriptionsContract.connect(deployer).getTierData(2))
    console.log(await subscriptionsContract.connect(deployer).getTierData(3))
    console.log(await subscriptionsContract.connect(deployer).getTierData(10))
    console.log(await subscriptionsContract.connect(deployer).getTierData(5))

    // console.log(await subscriptionsContract.connect(deployer).getProfitDistributionData());

    const ProfitDistributorFactory = await hre.ethers.getContractFactory("MockProfitDistributor");
    const ProfitDistributor = await ProfitDistributorFactory.connect(deployer).deploy(tokenAddress);
    console.log("profitAddress:", (await ProfitDistributor.deployed()).address);

    await (await subscriptionsContract.connect(deployer).setProfitDistributionParams(ProfitDistributor.address, 100, 30 * 24 * 60 * 60)).wait(1)
    try {
        await (await subscriptionsContract.connect(deployer).distributeProfit()).wait(1)
    } catch (e) {
        console.log(e)
    }
    //console.log(await subscriptionsContract.connect(deployer).getProfitDistributionData());
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
  