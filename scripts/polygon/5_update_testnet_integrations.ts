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

    const proxy_admin = await ethers.getContractAt("PProxyAdmin", PROXY_ADMIN_ADDRESS);

    console.log("Proxy admin : ", proxy_admin.address);

    // const subscriptionMasterCopy = await SUBSCRIPTION.deploy();
    // await subscriptionMasterCopy.deployed();
    // console.log("Subscriptions master copy : ", subscriptionMasterCopy.address);

    // await(await proxy_admin.upgrade(SUBSCRIPTION_ADDRESS, subscriptionMasterCopy.address)).wait();

    const subscriptionsContract = await ethers.getContractAt("PureFiSubscriptionService", SUBSCRIPTION_ADDRESS);
    console.log("Upgraded version: ", (await subscriptionsContract.version()).toString());
    console.log("completed");


    // const TOKEN_BUYER = await ethers.getContractFactory("MockTokenBuyer");
    // const token_buyer = await TOKEN_BUYER.deploy();
    // await token_buyer.deployed();
    // console.log("Token_buyer address :", token_buyer.address);
    // await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec
    // await subscriptionsContract.setTokenBuyer(token_buyer.address);

    // const PANTERA_RESOLVER = await ethers.getContractFactory("PanteraResolver");
    // const PANTERA_ZACCOUNT_REGISTRY = "0x4B6442c837Ffefe2A6a14F6620E13E9212607705";
    // const pantera_resolver = await PANTERA_RESOLVER.deploy(PANTERA_ZACCOUNT_REGISTRY);
    // await pantera_resolver.deployed();
    // console.log("PANTERA_RESOLVER address :", pantera_resolver.address);
    // await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

    const pantera_resolver = await ethers.getContractAt("PanteraResolver", "0xE7D3713B91bEc410d0430948654D11c05700F6eE");

    //test pantera resolver;
    const nuladdr =  "0x0000000000000000000000000000000000000000";
    var result = await pantera_resolver.resolveRequest(2, 12345, "0xe7c246cFC1bb8CCe0054329B5502c65102E8053A", nuladdr, nuladdr);
    console.log("result=  ",result);
    console.log("completed");

    let yearTS = 86400*365;
    const decimals = BigNumber.from(10).pow(18);
    let USDdecimals = decimals;//10^18 // for current contract implementation
    // await(await subscriptionsContract.setTierData(10,yearTS,BigNumber.from(10000).mul(USDdecimals),0,3000,10000)).wait();
    // console.log("subscription added");

    const ufi_token = await ethers.getContractAt("TestTokenFaucet", UFI_ADDRESS);
    await(await ufi_token.approve(subscriptionsContract.address,BigNumber.from(100000).mul(USDdecimals)));
    await(await subscriptionsContract.subscribeFor(10, "0x4a8567455031ef4445A79bb64B90d7a54BE1E235"));
    console.log("address subscribed");
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  