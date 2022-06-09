const Migrations = artifacts.require("Migrations");
const PureFiRouter = artifacts.require('PureFiRouter');
const PureFiVerifier = artifacts.require('PureFiVerifier');
const PureFiIssuerRegistry = artifacts.require('PureFiIssuerRegistry');
const PureFiWhitelist = artifacts.require('PureFiWhitelist');
const PProxyAdmin = artifacts.require('PProxyAdmin');
const PProxy = artifacts.require('PPRoxy');
const WEB3 = require("web3");
const web3 = new WEB3('http://localhost:8545');
const BN = web3.utils.BN;
const { time } = require('@openzeppelin/test-helpers');
const TestBotProtection = artifacts.require('TestBotProtection');
const PureFiLockService = artifacts.require('PureFiLockService');
const PureFiSubscriptionService = artifacts.require('PureFiSubscriptionService');
const PureFiTokenBuyerBSC = artifacts.require('PureFiTokenBuyerBSC');
const TestToken = artifacts.require('TestToken');
const { ethers } = require("hardhat");




function toBN(number) {
    return web3.utils.toBN(number);
};

module.exports = async (network) => {
    // let provider = web3;
    // let addr = "0xcE14bda2d2BceC5247C97B65DBE6e6E570c4Bb6D";
    // // You can pass in either the from address or the index
    // let signer = WEB3.getSigner(addr);
   
    // let deployMaster = signer;
    // let deployMasterAddress = addr;
    // console.log("DeployMaster: " + deployMasterAddress);
    // console.log("DeployMaster: " + signer)


    const migration = await Migrations.new();
    Migrations.setAsDeployed(migration);
    let accounts = await  web3.eth.getAccounts();

    //2 migration
    let admin = accounts[0];
    console.log("Deploy: Admin: "+admin);

     //deploy master admin
     let proxyAdmin;
     await PProxyAdmin.new().then(instance => proxyAdmin = instance);
     console.log("Proxy Admin: ",proxyAdmin.address);

    let routerMasterCopy;
    await PureFiRouter.new().then(instance => routerMasterCopy = instance);
    console.log("routerMasterCopy=",routerMasterCopy.address);

    let router;
    await PProxy.new(routerMasterCopy.address,proxyAdmin.address,web3.utils.hexToBytes('0x')).
        then(function(instance){
            return PureFiRouter.at(instance.address);
        }).then(instance => router = instance);
    console.log("Router instance: ", router.address);
    await router.initialize.sendTransaction(accounts[0]);
    console.log("Using router version",(await router.version.call()).toString());

    let regsitryMasterCopy;
    await PureFiIssuerRegistry.new().then(instance => regsitryMasterCopy = instance);
    console.log("regsitryMasterCopy=",regsitryMasterCopy.address);

    let registry;
    await PProxy.new(regsitryMasterCopy.address,proxyAdmin.address,web3.utils.hexToBytes('0x')).
        then(function(instance){
            return PureFiIssuerRegistry.at(instance.address);
        }).then(instance => registry = instance);
    console.log("Registry instance: ", registry.address);
    await registry.initialize.sendTransaction(accounts[0]);
    console.log("Using Registry version",(await registry.version.call()).toString());

    let whitelistMasterCopy;
    await PureFiWhitelist.new().then(instance => whitelistMasterCopy = instance);
    console.log("whitelistMasterCopy=",whitelistMasterCopy.address);

    let whitelist;
    await PProxy.new(whitelistMasterCopy.address,proxyAdmin.address,web3.utils.hexToBytes('0x')).
        then(function(instance){
            return PureFiWhitelist.at(instance.address);
        }).then(instance => whitelist = instance);
    console.log("whitelist instance: ", whitelist.address);
    await whitelist.initialize.sendTransaction(router.address);
    console.log("Using whitelist version",(await whitelist.version.call()).toString());
    

    let verifier;
    const pureFiVerifier  = await PureFiVerifier.new(await registry.address);
    await PureFiVerifier.setAsDeployed(pureFiVerifier);

    
    console.log("PureFiVerifier instance: ", await  pureFiVerifier.address);
    verifier = await PureFiVerifier.at(await pureFiVerifier.address);
    

    console.log("Using verifier version",(await verifier.version.call()).toString());

    await router.setAddress.sendTransaction(1,registry.address);
    await router.setAddress.sendTransaction(2,verifier.address);
    await router.setAddress.sendTransaction(3,whitelist.address);
    await registry.register.sendTransaction('0x75597e9DEe0B7d88E98fCbcd82323BaED32c50FE',web3.utils.keccak256('PureFITestIssuer'));
    
    if(network == 'test'){
        await registry.register.sendTransaction(accounts[0],web3.utils.keccak256('issuer0'));
        await registry.register.sendTransaction(accounts[1],web3.utils.keccak256('issuer1'));
        await registry.register.sendTransaction('0x84a5B4B863610989197C957c8816cF6a3B91adD2',web3.utils.keccak256('testsinger'));
        
        //address _user, uint256 _sessionID, uint256 _ruleID, uint64 _verifiedOn, uint64 _validUntil
        let testAddress = accounts[9];
        let res = await whitelist.whitelist.sendTransaction(
            testAddress,
            toBN(1),
            toBN(0),
            toBN(1649652010),
            toBN(1670652010)
        );

        let isVerified = await router.isAddressVerified.call(testAddress);
        console.log("isVerified=",isVerified);

        let del = await whitelist.delist.sendTransaction(testAddress);
        let isVerified2 = await router.isAddressVerified.call(testAddress);
        console.log("isVerified2=",isVerified2);

    }

    //3d migrations
     
    admin = accounts[0];
    console.log("Deploy: Admin: "+admin);

     //deploy master admin
    proxyAdmin = await PProxyAdmin.at('0x3958341e490B8a8075F6C84de68563f3586840D9');
    router = await PureFiRouter.at('0x360B0586244404D0Ee67728F5bA5C4763D755218');
    let pureFiToken = await TestToken.at('0xe2a59D5E33c6540E18aAA46BF98917aC3158Db0D');
    let burnAddress = accounts[0];
      
    // let lockServiceMasterCopy;
    // await PureFiLockService.new().then(instance => lockServiceMasterCopy = instance);
    // console.log("PureFiLockService master copy=",lockServiceMasterCopy.address);

    let lockContract = await PureFiLockService.at('0xACD92EfaC7f5fC184a1d580E4C87c50A40f39B8F');
    // await PProxy.new(lockServiceMasterCopy.address,proxyAdmin.address,web3.utils.hexToBytes('0x')).
    //     then(function(instance){
    //         return PureFiLockService.at(instance.address);
    //     }).then(instance => lockContract = instance);
    // console.log("PureFiLockService instance: ", lockContract.address);
    // await lockContract.initialize(accounts[0]);
    console.log("Using PureFiLockService version",(await lockContract.version.call()).toString());

    // let tokenBuyer;
    // await PureFiTokenBuyerBSC.new().then(instance => tokenBuyer = instance); 
    // console.log("PureFiTokenBuyerBSC instance: ", tokenBuyer.address);


    // let subscriptionServiceMasterCopy;
    // await PureFiSubscriptionService.new().then(instance => subscriptionServiceMasterCopy = instance);
    // console.log("PureFiSubscriptionService master copy=",subscriptionServiceMasterCopy.address);

    let subscriptionContract = await PureFiSubscriptionService.at('0xb86d329f8f5eF34d72D270EAca7B27fDb7331229');
    // await PProxy.new(subscriptionServiceMasterCopy.address,proxyAdmin.address,web3.utils.hexToBytes('0x')).
    //     then(function(instance){
    //         return PureFiSubscriptionService.at(instance.address);
    //     }).then(instance => subscriptionContract = instance);
    // console.log("PureFiSubscriptionService instance: ", subscriptionContract.address);
    // await subscriptionContract.initialize(accounts[0],pureFiToken.address,lockContract.address,tokenBuyer.address,burnAddress);
    console.log("Using PureFiSubscriptionService version",(await subscriptionContract.version.call()).toString());

   
    // await lockContract.grantRole.sendTransaction(web3.utils.keccak256('UFI_TRUSTED_PAYMENT_SERVICE'),subscriptionContract.address,{from:admin});

    // if(network != 'test'){
    //     await router.setAddress.sendTransaction(4,lockContract.address);
    //     await router.setAddress.sendTransaction(5,subscriptionContract.address);
    // }
    // done();
   

};
