const { time, expectRevert } = require('@openzeppelin/test-helpers');
const bigDecimal = require('js-big-decimal');
// const web3 = require("web3");
const web3Abi = require('web3-eth-abi');
const BN = web3.utils.BN;
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
chai.use(require('bn-chai')(BN));
chai.use(require('chai-match'));
const EthCrypto = require("eth-crypto");
const { ethers } = require("ethers");
// const { test } = require('chai/lib/chai/utils');
// const { convertSecretKey } = require('ed2curve');

const PureFiIssuerRegistry = artifacts.require('PureFiIssuerRegistry');
const PureFiRouter = artifacts.require('PureFiRouter');
const PureFiVerifier = artifacts.require('PureFiVerifier');
const PureFiWhitelist = artifacts.require('PureFiWhitelist');
const TestBotProtection = artifacts.require('TestBotProtection');
const PureFiLockService = artifacts.require('PureFiLockService');
const PureFiSubscriptionService = artifacts.require('PureFiSubscriptionService');
const PureFiTokenBuyerBSC = artifacts.require('PureFiTokenBuyerBSC');
const TestToken = artifacts.require('TestToken');

function toBN(number) {
    return web3.utils.toBN(number);
}

function printEvents(txResult, strdata){
    console.log(strdata," events:",txResult.logs.length);
    console.log(`${strdata} GasUsed: ${txResult.receipt.gasUsed} `);
    for(var i=0;i<txResult.logs.length;i++){
        let argsLength = Object.keys(txResult.logs[i].args).length;
        console.log("Event ",txResult.logs[i].event, "  length:",argsLength);
        for(var j=0;j<argsLength;j++){
            if(!(typeof txResult.logs[i].args[j] === 'undefined') && txResult.logs[i].args[j].toString().length>0)
                console.log(">",i,">",j," ",txResult.logs[i].args[j].toString());
        }
    }

}

const signMessage = async (message, privateKey) => {

    const publicKeySigner = EthCrypto.publicKeyByPrivateKey(privateKey);
    const signerAddress = EthCrypto.publicKey.toAddress(publicKeySigner);

    const signerIdentity = {
        privateKey: privateKey,
        publicKey: publicKeySigner,
        address: signerAddress
    }

    const publicKey = EthCrypto.publicKeyByPrivateKey(signerIdentity.privateKey);
    const magicAddress = EthCrypto.publicKey.toAddress(publicKey);
    // console.log("Magic address: ", magicAddress);
    const messageHash = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(signerIdentity.privateKey, messageHash);
    return signature;
}

contract('PureFi Subscription Test', (accounts) => {
 
    let admin   = accounts[0];
    const decimals = toBN(10).pow(toBN(18));
  
    console.log("Test: Admin: "+admin);

    let pureFiToken;
    let botProtector;
    let verifier;
    let issuerRegistry;

    let lockContract;
    let subscriptionContract;
    let burnAddress;
    let tokenBuyer;
    let signer;

    before(async () => {
        burnAddress = accounts[9];
        await PureFiVerifier.deployed().then(instance => verifier = instance);

        let issuerRegAddress = await verifier.issuerRegistry.call();

        issuerRegistry = await PureFiIssuerRegistry.at(issuerRegAddress);

        console.log("verifier = ",verifier.address);
        console.log("issuerRegistry = ",issuerRegistry.address);


        await TestToken.new(toBN(100000000).mul(decimals),"TestUFI","UFI").then(instance => pureFiToken = instance); 
        await PureFiLockService.new().then(instance => lockContract = instance);
        await lockContract.initialize(accounts[0]);
        

        await TestBotProtection.new(pureFiToken.address, lockContract.address).then(instance => botProtector = instance); 
        await pureFiToken.setBotProtector.sendTransaction(botProtector.address);
        
        await PureFiTokenBuyerBSC.new().then(instance => tokenBuyer = instance); 
        await PureFiSubscriptionService.new().then(instance => subscriptionContract = instance); 

        // address _admin, address _ufi, address _lock, address _tokenBuyer, address _burnAddress
        await subscriptionContract.initialize(accounts[0],pureFiToken.address,lockContract.address,tokenBuyer.address,burnAddress);
        await lockContract.grantRole.sendTransaction(web3.utils.keccak256('UFI_TRUSTED_PAYMENT_SERVICE'),subscriptionContract.address);

    });

    it('set tiers', async () => {
        let yearTS = 86400*365;
        await subscriptionContract.setTierData.sendTransaction(web3.utils.toBN(1),web3.utils.toBN(yearTS),web3.utils.toBN(50).mul(decimals),web3.utils.toBN(20),web3.utils.toBN(1),web3.utils.toBN(5));
        await subscriptionContract.setTierData.sendTransaction(web3.utils.toBN(2),web3.utils.toBN(yearTS),web3.utils.toBN(100).mul(decimals),web3.utils.toBN(20),web3.utils.toBN(1),web3.utils.toBN(15));
        await subscriptionContract.setTierData.sendTransaction(web3.utils.toBN(3),web3.utils.toBN(yearTS),web3.utils.toBN(300).mul(decimals),web3.utils.toBN(20),web3.utils.toBN(1),web3.utils.toBN(45));

        let sData = await subscriptionContract.getTierData.call(toBN(1));
        console.log("Tier data:");
        for(let i=0;i<5;i++){
            console.log(i," = ",sData[i].toString());
        }
  
    });

    it('subscribe having tokens', async () => {

        let tierToBuy = toBN(1);
        let buyer = accounts[0];
        //-----------------------
        let tierData = await subscriptionContract.getTierData.call(tierToBuy);

        let tierPackageTokens = (await tokenBuyer.busdToUFI.call(tierData[1]))[1];
        console.log("tierPackageTokens = ",tierPackageTokens.toString(), (tierPackageTokens.div(decimals)).toString());

        {
            let balanceUFI = await pureFiToken.balanceOf.call(buyer);
            let balanceUFILocker = (await lockContract.getLockData.call(buyer))[0];
            console.log("BEFORE: Balance: ",balanceUFI.toString()," locked: ",balanceUFILocker.toString());
        }
        {
            let estimateData = await subscriptionContract.estimateSubscriptionPrice.call(buyer, tierToBuy);
            console.log("UFI Required",estimateData[0].toString());
            console.log("ETH Required",estimateData[1].toString());
            console.log("UFI Locked for tier",estimateData[2].toString());
        }
        let subRec = await subscriptionContract.subscribe(tierToBuy, {from: buyer});
        printEvents(subRec,"subscribe");

        let userData = await subscriptionContract.getUserData.call(buyer);
        console.log("Subscription data: ");
        for(let i=0;i<5;i++){
            console.log(i," = ",userData[i].toString());
        }
        {
            let balanceUFI = await pureFiToken.balanceOf.call(buyer);
            let balanceUFILocker = (await lockContract.getLockData.call(buyer))[0];
            console.log("AFTER: Balance: ",balanceUFI.toString()," locked: ",balanceUFILocker.toString());
        }
  
    });

    it('subscribe having no tokens', async () => {

        let tierToBuy = toBN(1);
        let buyer = accounts[1];
        console.log("Buyer ",accounts[1]);
        //-----------------------
        //send 1000 tokens so that function has to buy less
        await pureFiToken.transfer(buyer,toBN(1000).mul(decimals),{from:"0xcE14bda2d2BceC5247C97B65DBE6e6E570c4Bb6D"});
        //-----------------------
        let tierData = await subscriptionContract.getTierData.call(tierToBuy);

        let tierPackageTokens = (await tokenBuyer.busdToUFI.call(tierData[1]))[1];
        console.log("tierPackageTokens = ",tierPackageTokens.toString(), (tierPackageTokens.div(decimals)).toString());

        {
            let balanceUFI = await pureFiToken.balanceOf.call(buyer);
            let balanceUFILocker = (await lockContract.getLockData.call(buyer))[0];
            console.log("BEFORE: Balance: ",balanceUFI.toString()," locked: ",balanceUFILocker.toString());
        }
        
            let estimateData = await subscriptionContract.estimateSubscriptionPrice.call(buyer, tierToBuy);
            console.log("UFI Required",estimateData[0].toString());
            console.log("ETH Required",estimateData[1].toString());
            console.log("UFI Locked for tier",estimateData[2].toString());
        
        let subRec = await subscriptionContract.subscribe(tierToBuy, {from: buyer, value: estimateData[1]});
        printEvents(subRec,"subscribe");

        let userData = await subscriptionContract.getUserData.call(buyer);
        console.log("Subscription data: ");
        for(let i=0;i<5;i++){
            console.log(i," = ",userData[i].toString());
        }
        {
            let balanceUFI = await pureFiToken.balanceOf.call(buyer);
            let balanceUFILocker = (await lockContract.getLockData.call(buyer))[0];
            console.log("AFTER: Balance: ",balanceUFI.toString()," locked: ",balanceUFILocker.toString());
        }
        {
            //real UFI check
            let realUFIToken = await TestToken.at('0xe2a59D5E33c6540E18aAA46BF98917aC3158Db0D');
            let balanceUFI = await realUFIToken.balanceOf.call(buyer);
            console.log("AFTER: REAL UFI Balance: ",balanceUFI.toString());
        }
  
    });


    it('re-subscribe having tokens', async () => {

        let tierToBuy = toBN(2);
        let buyer = accounts[0];
        // approve so that some tokens could be burned
        {
            let balanceUFILocker = (await lockContract.getLockData.call(buyer))[0];
            await pureFiToken.approve.sendTransaction(subscriptionContract.address,balanceUFILocker,{from:buyer});
        }
        //-----------------------
        let tierData = await subscriptionContract.getTierData.call(tierToBuy);

        let tierPackageTokens = (await tokenBuyer.busdToUFI.call(tierData[1]))[1];
        console.log("tierPackageTokens = ",tierPackageTokens.toString(), (tierPackageTokens.div(decimals)).toString());

        {
            let balanceUFI = await pureFiToken.balanceOf.call(buyer);
            let balanceUFILocker = (await lockContract.getLockData.call(buyer))[0];
            console.log("BEFORE: Balance: ",balanceUFI.toString()," locked: ",balanceUFILocker.toString());
        }
        {
            let estimateData = await subscriptionContract.estimateSubscriptionPrice.call(buyer, tierToBuy);
            console.log("UFI Required",estimateData[0].toString());
            console.log("ETH Required",estimateData[1].toString());
            console.log("UFI Locked for tier",estimateData[2].toString());
        }
        let subRec = await subscriptionContract.subscribe(tierToBuy, {from: buyer});
        printEvents(subRec,"subscribe");

        let userData = await subscriptionContract.getUserData.call(buyer);
        console.log("Subscription data: ");
        for(let i=0;i<5;i++){
            console.log(i," = ",userData[i].toString());
        }
        {
            let balanceUFI = await pureFiToken.balanceOf.call(buyer);
            let balanceUFILocker = (await lockContract.getLockData.call(buyer))[0];
            console.log("AFTER: Balance: ",balanceUFI.toString()," locked: ",balanceUFILocker.toString());
        }
  
    });
   
    
   
});
