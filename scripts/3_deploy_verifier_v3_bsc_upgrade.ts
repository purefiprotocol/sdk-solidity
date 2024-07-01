import { ethers, upgrades} from "hardhat";
import hre from "hardhat";



const ISSUER_REGISTRY = "0x8bc1862398D2c03A1dBeE2238E97c8fC9FABB7eC";
const WHITELIST = "0xF2292e44f294b406484A05942b6717B07a063A23";
const VERIFIER_ADDRESS = "0x62351A3F17a2c4640f45907faB74901a37FaD3C2";
const PROXY_ADMIN_ADDRESS = "0x3958341e490B8a8075F6C84de68563f3586840D9";
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
    const VERIFIER = await ethers.getContractFactory("PureFiVerifier");

    const proxy_admin = await ethers.getContractAt("PProxyAdmin", PROXY_ADMIN_ADDRESS);

    console.log("Proxy admin : ", proxy_admin.address);

    const verifierMasterCopy = await VERIFIER.deploy();
    await verifierMasterCopy.deployed();
    console.log("Verififer master copy : ", verifierMasterCopy.address);

    await(await proxy_admin.upgrade(VERIFIER_ADDRESS, verifierMasterCopy.address)).wait();

    const verifier = await ethers.getContractAt("PureFiVerifier", VERIFIER_ADDRESS);
    console.log("Verifier version: ", (await verifier.version()).toString());
    console.log("completed");
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  