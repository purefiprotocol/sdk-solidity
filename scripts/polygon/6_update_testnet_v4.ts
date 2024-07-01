import { ethers, upgrades} from "hardhat";
import hre from "hardhat";
import { BigNumber, utils } from "ethers";


const UFI_ADDRESS = "0x70892902C0BfFdEEAac711ec48F14c00b0fa7E3A";
const ISSUER_REGISTRY = "0xba7ABC3149c3670b11Dc9B87d56009b8377DEa2A";
const WHITELIST = "0x1c33d50aFbb45305e730c65Fc2d7B9B8E89B46b9";
const VERIFIER_ADDRESS = "0x6ae5e97F3954F64606A898166a294B3d54830979";
const PROXY_ADMIN_ADDRESS = "0x91C9149093d5bc72706B4Abe75c7d4639644cb06";
const TOKEN_BUYER_ADDRESS = "0x9571958bf9Ec24edc9787dFf938398F50c163698";
const SUBSCRIPTION_ADDRESS = "0x78c3De7461d893e1e9B15Ed2666Df3cDC033e851";

// params 

const PARAM_DEFAULT_AML_GRACETIME_KEY = 3;
const DEFAULT_GRACETIME_VALUE = 300;

const DEFAULT_AML_RULE = "431050";
const DEFAULT_KYC_RULE = "777";
const DEFAULT_KYCAML_RULE = "731090";

const PARAM_TYPE1_DEFAULT_AML_RULE = 4;
const PARAM_TYPE1_DEFAULT_KYC_RULE = 5;
const PARAM_TYPE1_DEFAULT_KYCAML_RULE = 6;




async function main(){
    
    const PROXY = await ethers.getContractFactory("PPRoxy");
    const SUBSCRIPTION = await ethers.getContractFactory("PureFiSubscriptionService");
    const VERIFIER = await ethers.getContractFactory("PureFiVerifier");

    const BUYER = await ethers.getContractFactory("UFIBuyerDemo");
    const PPROXY = await ethers.getContractFactory("PPRoxy");

    const proxy_admin = await ethers.getContractAt("PProxyAdmin", PROXY_ADMIN_ADDRESS);

    console.log("Proxy admin : ", proxy_admin.address);

    // const subscriptionMasterCopy = await SUBSCRIPTION.deploy();
    // await subscriptionMasterCopy.deployed();
    // console.log("Subscriptions master copy : ", subscriptionMasterCopy.address);

    // await(await proxy_admin.upgrade(SUBSCRIPTION_ADDRESS, subscriptionMasterCopy.address)).wait();

    // const subscriptionsContract = await ethers.getContractAt("PureFiSubscriptionService", SUBSCRIPTION_ADDRESS);
    // console.log("Upgraded version: ", (await subscriptionsContract.version()).toString());
    // console.log("completed");

    const verifierMasterCopy = await VERIFIER.deploy();
    await verifierMasterCopy.deployed();
    console.log("verifier master copy : ", verifierMasterCopy.address);

    await(await proxy_admin.upgrade(VERIFIER_ADDRESS, verifierMasterCopy.address)).wait();

    const verifierContract = await ethers.getContractAt("PureFiVerifier", VERIFIER_ADDRESS);
    console.log("Upgraded version: ", (await verifierContract.version()).toString());




    // const buyerDemoCode = await BUYER.deploy();
    // await buyerDemoCode.deployed();

    // console.log("buyerDemoCode address : ", buyerDemoCode.address);
    // await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

    // const buyerDemo = await PPROXY.deploy(buyerDemoCode.address, proxy_admin.address, "0x");
    // await buyerDemo.deployed();

    // console.log("buyerDemo address : ", buyerDemo.address);
    // await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

    // const buyer = await ethers.getContractAt("UFIBuyerDemo", buyerDemo.address);

    // // initialize whitelist
    // await(await buyer.initialize(UFI_ADDRESS, VERIFIER_ADDRESS)).wait();
    // const ufi_token = await ethers.getContractAt("TestTokenFaucet", UFI_ADDRESS);
    // const decimals = BigNumber.from(10).pow(18);
    // ufi_token.transfer(buyer.address,BigNumber.from(1000000).mul(decimals));




    // const DEFAULT_CLEANING_TOLERANCE = 3600;
    // const PARAM_CLEANING_TOLERANCE = 10;
    // await(await verifierContract.setUint256(PARAM_CLEANING_TOLERANCE, DEFAULT_CLEANING_TOLERANCE)).wait();
    console.log("completed");

    /**
     (, uint256 ruleID, uint256 sessionID, address sender) = abi.decode(_purefipackage, (uint8, uint256, uint256, address));
      package = VerificationPackage({
          packagetype : 1,
          session: sessionID,
          rule : ruleID,
          from : sender,
          to : 0xD722f3d3F1814C48e3E36988745086F6c43bD469,
          token : address(0),
          amount : 0,
          payload : ''
        }); 

     */

}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  