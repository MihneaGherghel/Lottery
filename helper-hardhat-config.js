const { ethers } = require("hardhat");

const networkConfig = {
    11155111: {
        name: "sepolia",
        subscriptionId: "77581474838967428897021015815053359577082931689270798495550685029233854948510",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        interval: "30",
        raffleEntranceFee: "10000000000000000",
        callbackGasLimit: "500000", // 500,000 gas
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        entranceFee:"10000000000000000",
    },
    31337:{
        name:"hardhat",
        entranceFee:"10000000000000000",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        callbackGasLimit:"500000",
        interval:"30",
    }
}

const developmentChains=["hardhat","localhost"];


module.exports={
    networkConfig,
    developmentChains
}