const { network, ethers } = require("hardhat");
const {developmentChains, networkConfig}=require('../helper-hardhat-config');
const {verify}=require("../utils/verify")
const FUND_AMOUNT="2000000000000000000";


module.exports=async function({getNamedAccounts,deployments}){
    const {deploy,log}=deployments;
    const {deployer}=await getNamedAccounts();
    const chainId=network.config.chainId;
    let vrfCoordinatorV2Address,subscriptionId,VRFCoordinatorV2Mock;
    if(developmentChains.includes(network.name)){
        VRFCoordinatorV2Mock=await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address=VRFCoordinatorV2Mock.target;
        const transactionResponse = await VRFCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait()
        subscriptionId = transactionReceipt.logs[0].args.subId
        await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    }else{
        vrfCoordinatorV2Address=networkConfig[chainId]["vrfCoordinatorV2"];
        subscriptionId=networkConfig[chainId]["subscriptionId"]
    }
    const entranceFee=networkConfig[chainId]["entranceFee"];
    const gasLane=networkConfig[chainId]["gasLane"];
    const callbackGasLimit=networkConfig[chainId]["callbackGasLimit"];
    const interval=networkConfig[chainId]["interval"];
    const args=[
        vrfCoordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackGasLimit,
        interval
    ]
    const raffle=await deploy("Raffle",{
        from:deployer,
        args:args,
        log:true,
        waitConfirmation:network.config.blockConfirmations|| 1,
    });
    const abi = JSON.stringify(raffle.abi);
    if(developmentChains.includes(network.name)){
        await VRFCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address)
    }
    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(raffle.address,args)
    }
}

module.exports.tags=["all","raffle"];