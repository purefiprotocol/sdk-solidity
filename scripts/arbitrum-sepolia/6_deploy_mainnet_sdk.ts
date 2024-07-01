import {ethers} from "hardhat";
import hre from "hardhat";
import {BigNumber, utils} from "ethers";

//**** PUREFI SDK DEPLOYMENT SCRIPT *******//

// params for verifier

const PARAM_DEFAULT_AML_GRACETIME_KEY = 3;
const DEFAULT_GRACETIME_VALUE = 300;

const DEFAULT_AML_RULE = 431050;
const DEFAULT_KYC_RULE = 777;
const DEFAULT_KYCAML_RULE = 731090;
const DEFAULT_CLEANING_TOLERANCE = 3600;

const PARAM_TYPE1_DEFAULT_AML_RULE = 4;
const PARAM_TYPE1_DEFAULT_KYC_RULE = 5;
const PARAM_TYPE1_DEFAULT_KYCAML_RULE = 6;
const PARAM_CLEANING_TOLERANCE = 10;

const PROXY_ADMIN_ADDRESS = "";
const decimals = BigNumber.from(10).pow(18);


const deployer = new hre.ethers.Wallet(process.env.PRIVATE_KEY as string, hre.ethers.provider);
// issuer_registry params

const VALID_ISSUER_ADDRESS = "0x592157ab4c6FADc849fA23dFB5e2615459D1E4e5";
const PROOF = utils.keccak256(utils.toUtf8Bytes("PureFi Stage Issuer"));
//const ADMIN = "0xcE14bda2d2BceC5247C97B65DBE6e6E570c4Bb6D";  // admin of issuer_registry
const ADMIN = deployer.address  // admin of issuer_registry


// SUBSCRIPTION_SERVICE params


const TOKEN_BUYER = "";
const PROFIT_COLLECTION_ADDRESS = "0xcE14bda2d2BceC5247C97B65DBE6e6E570c4Bb6D";


async function main() {
    console.log(deployer.address)

    let addressOfUSDC = "";

    if (hre.network.name === "hardhat") {
        const accounts = await hre.ethers.getSigners();
        await (await accounts[0].sendTransaction({
            to: deployer.address,
            value: 10n ** 20n
        })).wait(1);
    }

    if (hre.network.name === "arbitrum") {
        addressOfUSDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
    } else if (hre.network.name === "optimism") {
        addressOfUSDC = "0x0b2c639c533813f4aa9d7837caf62653d097ff85";
    } else if (hre.network.name === "base") {
        addressOfUSDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    } else {
        throw new Error("Wrong network")
    }

    console.log('StableCoin:', addressOfUSDC);


    if (PROOF.length == 0 || ADMIN.length == 0) {
        throw new Error('ADMIN or PROOF variable is missed');
    }

    const PPROXY = await ethers.getContractFactory("PPRoxy");
    const PPROXY_ADMIN = await ethers.getContractFactory("PProxyAdmin");

    const WHITELIST = await ethers.getContractFactory("PureFiWhitelist");
    const ISSUER_REGISTRY = await ethers.getContractFactory("PureFiIssuerRegistry");
    const VERIFIER = await ethers.getContractFactory("PureFiVerifier");
    const SUBSCRIPTION_SERVICE = await ethers.getContractFactory("PureFiSubscriptionService");
    const TOKEN_BUYER = await ethers.getContractFactory("MockTokenBuyer");

    // DEPLOY PROXY_ADMIN //
    // ------------------------------------------------------------------- //
    let actual_proxy_admin;
    if (PROXY_ADMIN_ADDRESS.length > 0) {
        actual_proxy_admin = await ethers.getContractAt("PProxyAdmin", PROXY_ADMIN_ADDRESS);
    } else {
        console.log("Deploying new proxy admin...");
        actual_proxy_admin = await PPROXY_ADMIN.connect(deployer).deploy();
        await actual_proxy_admin.deployed();
        //await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec
    }
    const proxy_admin = actual_proxy_admin

    console.log("PROXY_ADMIN address : ", proxy_admin.address);


    // DEPLOY ISSUER_REGISTRY //
    // ------------------------------------------------------------------- //
    const issuer_registry_mastercopy = await ISSUER_REGISTRY.connect(deployer).deploy();
    await issuer_registry_mastercopy.connect(deployer).deployed();

    console.log("ISSUER_REGISTRY_MASTERCOPY address : ", issuer_registry_mastercopy.address);
    //await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

    const issuer_registry_proxy = await PPROXY.connect(deployer).deploy(issuer_registry_mastercopy.address, proxy_admin.address, "0x");
    await issuer_registry_proxy.connect(deployer).deployed();

    console.log("issuer_registry address : ", issuer_registry_proxy.address);
    //await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

    // initialize issuer_registry
    const issuer_registry = await ethers.getContractAt("PureFiIssuerRegistry", issuer_registry_proxy.address);

    await (await issuer_registry.connect(deployer).initialize(ADMIN)).wait();

    // set issuer
    await (await issuer_registry.connect(deployer).register(VALID_ISSUER_ADDRESS, PROOF)).wait(1);
    // DEPLOY WHITELIST // 
    // ------------------------------------------------------------------- //

    const whitelist_mastercopy = await WHITELIST.connect(deployer).deploy();
    await whitelist_mastercopy.deployed();

    console.log("whitelist_mastercopy address : ", whitelist_mastercopy.address);
    //await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

    const whitelist_proxy = await PPROXY.connect(deployer).deploy(whitelist_mastercopy.address, proxy_admin.address, "0x");
    await whitelist_proxy.connect(deployer).deployed();

    console.log("whitelist_proxy address : ", whitelist_proxy.address);
    //await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

    const whitelist = await ethers.getContractAt("PureFiWhitelist", whitelist_proxy.address);

    // initialize whitelist
    await (await whitelist.connect(deployer).initialize(issuer_registry.address)).wait();

    // DEPLOY VERIFIER // 
    // ------------------------------------------------------------------- //

    console.log("Deploying verifier...");
    const verifier_mastercopy = await VERIFIER.connect(deployer).deploy();
    await verifier_mastercopy.connect(deployer).deployed();

    console.log("verifier_mastercopy address : ", verifier_mastercopy.address);
    //await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

    const verifier_proxy = await PPROXY.connect(deployer).deploy(verifier_mastercopy.address, proxy_admin.address, "0x");
    await verifier_proxy.connect(deployer).deployed();

    console.log("verifier_proxy address : ", verifier_proxy.address);
    //await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

    // initialize verifier
    const verifier = await ethers.getContractAt("PureFiVerifier", verifier_proxy.address);
    await (await verifier.connect(deployer).initialize(issuer_registry.address, whitelist.address)).wait();

    // set verifier params

    await (await verifier.connect(deployer).setUint256(PARAM_DEFAULT_AML_GRACETIME_KEY, DEFAULT_GRACETIME_VALUE)).wait();
    await (await verifier.connect(deployer).setUint256(PARAM_TYPE1_DEFAULT_AML_RULE, DEFAULT_AML_RULE)).wait();
    await (await verifier.connect(deployer).setUint256(PARAM_TYPE1_DEFAULT_KYC_RULE, DEFAULT_KYC_RULE)).wait();
    await (await verifier.connect(deployer).setUint256(PARAM_TYPE1_DEFAULT_KYCAML_RULE, DEFAULT_KYCAML_RULE)).wait();
    await (await verifier.connect(deployer).setUint256(PARAM_CLEANING_TOLERANCE, DEFAULT_CLEANING_TOLERANCE)).wait();

    await (await verifier.connect(deployer).setString(1, "PureFiVerifier: Issuer signature invalid")).wait();
    await (await verifier.connect(deployer).setString(2, "PureFiVerifier: Funds sender doesn't match verified wallet")).wait();
    await (await verifier.connect(deployer).setString(3, "PureFiVerifier: Verification data expired")).wait();
    await (await verifier.connect(deployer).setString(4, "PureFiVerifier: Rule verification failed")).wait();
    await (await verifier.connect(deployer).setString(5, "PureFiVerifier: Credentials time mismatch")).wait();
    await (await verifier.connect(deployer).setString(6, "PureFiVerifier: Data package invalid")).wait();

    // DEPLOY TOKEN_BUYER // 
    // ------------------------------------------------------------------- //

    const token_buyer = await TOKEN_BUYER.connect(deployer).deploy();
    await token_buyer.connect(deployer).deployed();
    console.log("Token_buyer address :", token_buyer.address);
    //await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

    // DEPLOY SUBSCRIPTION_SERVICE // 
    // ------------------------------------------------------------------- //

    const sub_service_mastercopy = await SUBSCRIPTION_SERVICE.connect(deployer).deploy();
    await sub_service_mastercopy.deployed();

    console.log("Subscription master copy : ", sub_service_mastercopy.address);
    //await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

    const sub_service_proxy = await PPROXY.connect(deployer).deploy(sub_service_mastercopy.address, proxy_admin.address, "0x");
    await sub_service_proxy.connect(deployer).deployed();

    console.log("Subscription service address : ", sub_service_proxy.address);
    //await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec

    // initialize sub_service 
    const sub_service = await ethers.getContractAt("PureFiSubscriptionService", sub_service_proxy.address);
    await (await sub_service.connect(deployer).initialize(
        ADMIN,
        addressOfUSDC,
        token_buyer.address,
        PROFIT_COLLECTION_ADDRESS
    )).wait();

    let yearTS = 86400 * 365;
    //let USDdecimals = decimals;//10^18 // for current contract implementation
    let USDdecimals = 10n ** 6n;//10^18 // for current contract implementation
    await (await sub_service.connect(deployer).setTierData(1, yearTS, BigNumber.from(50).mul(USDdecimals), 20, 1, 5)).wait();
    await (await sub_service.connect(deployer).setTierData(2, yearTS, BigNumber.from(100).mul(USDdecimals), 20, 1, 15)).wait();
    await (await sub_service.connect(deployer).setTierData(3, yearTS, BigNumber.from(300).mul(USDdecimals), 20, 1, 45)).wait();
    await (await sub_service.connect(deployer).setTierData(10, yearTS, BigNumber.from(10000).mul(USDdecimals), 0, 3000, 10000)).wait();
    await (await sub_service.connect(deployer).setTierData(5, yearTS, BigNumber.from(5).mul(USDdecimals), 20, 1, 3)).wait();

    // pause profitDistribution functionality

    await (await sub_service.connect(deployer).pauseProfitDistribution()).wait();

    console.log("isProfitDistibutionPaused : ", await sub_service.connect(deployer).isProfitDistributionPaused());

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
  