import {ethers, upgrades} from "hardhat";
import hre from "hardhat";
import {PProxyAdmin__factory, PureFiVerifier__factory} from "../../typechain-types";


const UFI_ADDRESS = "0x70892902C0BfFdEEAac711ec48F14c00b0fa7E3A";
const ISSUER_REGISTRY = "0xba7ABC3149c3670b11Dc9B87d56009b8377DEa2A";
const WHITELIST = "0x1c33d50aFbb45305e730c65Fc2d7B9B8E89B46b9";
// const VERIFIER_ADDRESS = "0x6ae5e97F3954F64606A898166a294B3d54830979";
const TOKEN_BUYER_ADDRESS = "0x9571958bf9Ec24edc9787dFf938398F50c163698";

const PROXY_ADMIN_ADDRESS = "0x4cDD791Cab032C3294FA5Dd2C60DeC1b7a213cdd";
const SUBSCRIPTION_ADDRESS = "0x50677234058b95A67857c14B7102bA097820a6D2";

const VERIFIER_ADDRESS = "0x33962E4b101dd947ef35200c151B0fa56Fb6670E";

// params 

const PARAM_DEFAULT_AML_GRACETIME_KEY = 3;
const DEFAULT_GRACETIME_VALUE = 300;

const DEFAULT_AML_RULE = "431050";
const DEFAULT_KYC_RULE = "777";
const DEFAULT_KYCAML_RULE = "731090";
const PARAM_DEFAULT_KYCPLUS_RULE = "778";

const PARAM_TYPE1_DEFAULT_AML_RULE = 4;
const PARAM_TYPE1_DEFAULT_KYC_RULE = 5;
const PARAM_TYPE1_DEFAULT_KYCAML_RULE = 6;
const PARAM_TYPE1_DEFAULT_KYCPLUS_RULE = 7;


const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY as string, hre.ethers.provider);

async function main() {

    console.log(wallet.address);
    //const PROXY = await ethers.getContractFactory("PPRoxy");
    //const SUBSCRIPTION = await ethers.getContractFactory("PureFiSubscriptionService");
    //const ProxyAdminFactory = await ethers.getContractFactory("PProxyAdmin");

    const proxy_admin = PProxyAdmin__factory.connect(PROXY_ADMIN_ADDRESS, hre.ethers.provider);

    console.log("Proxy admin : ", await proxy_admin.getAddress());
    const VerifierFactory = await hre.ethers.getContractFactory("PureFiVerifier");
    //await hre.ethers.getContractFactory("PureFiVerifier");

    const implementationDeploymentTransaction = await VerifierFactory.connect(wallet).deploy();

    const Verifier = await implementationDeploymentTransaction.waitForDeployment();
    console.log(`[Verifier] implementation deployed to: ${Verifier.target}`);

    await (await proxy_admin.connect(wallet).upgrade(VERIFIER_ADDRESS, Verifier.target)).wait(1);
    console.log("[Verifier] upgraded");

    // const subscriptionMasterCopy = await SUBSCRIPTION.deploy();
    // await subscriptionMasterCopy.deployed();
    // console.log("Subscriptions master copy : ", subscriptionMasterCopy.address);

    // await(await proxy_admin.upgrade(SUBSCRIPTION_ADDRESS, subscriptionMasterCopy.address)).wait();

    // const subscriptionsContract = await ethers.getContractAt("PureFiSubscriptionService", SUBSCRIPTION_ADDRESS);
    // await (await subscriptionsContract.connect(wallet).unsubsribeContract("0x7A345cfcad0Ca2bC82EFBFcC85A8e211Afc8b05F")).wait(1);
    // await (await subscriptionsContract.connect(wallet).unsubsribeContract("0xd1a45975E231c704668e32cFd06a92349768A244")).wait(1);
    //console.log("Current version: ", (await subscriptionsContract.version()).toString());

    // console.log("completed");
    //
    //
    // const TOKEN_BUYER = await ethers.getContractFactory("MockTokenBuyer");
    // const token_buyer = await TOKEN_BUYER.deploy();
    // await token_buyer.deployed();
    // console.log("Token_buyer address :", token_buyer.address);
    // await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec
    //
    // await subscriptionsContract.setTokenBuyer(token_buyer.address);
    // console.log("completed");

}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
  