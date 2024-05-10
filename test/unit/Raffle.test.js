const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {developmentChains, networkConfig}=require("../../helper-hardhat-config");
const {assert,expect}=require("chai");

!developmentChains.includes(network.name)? describe.skip: describe("Raffle",async function(){
    let raffle,vrfCoordinatorV2Mock,raffleEntranceFee,deployer,interval,log;
    const chainId=network.config.chainId;
    beforeEach(async function(){
        deployer=(await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle=await ethers.getContract("Raffle",deployer);
        vrfCoordinatorV2Mock=await ethers.getContract("VRFCoordinatorV2Mock",deployer);
        raffleEntranceFee=await raffle.getEntranceFee();
        interval=await raffle.getInterval();
    })
    describe("constructor",function(){
        it("initializes the raffle correctly",async function(){
            const raffleState=await raffle.getRaffleState();
            assert.equal(raffleState.toString(),"0");
            assert.equal(interval.toString(),networkConfig[chainId]["interval"]);
        })
    })
    describe("enterRaffle", function(){
        it("reverts when you don't pay enough",async function(){
            await expect(raffle.enterRaffle({ value: 0 })).to.be.revertedWith('Not enough ETH!');
        })

        it("records players when they enter",async function(){
            await raffle.enterRaffle({value:raffleEntranceFee});
            const playerFromContract=await raffle.getPlayer(0);
            assert.equal(playerFromContract,deployer);
        })

        it("emit event on enter",async function(){
            await expect(raffle.enterRaffle({value:raffleEntranceFee})).to.emit(raffle,"RaffleEnter");
        })

        it("doesn't allow entrance when raffle is calculating",async function(){
            await raffle.enterRaffle({value:raffleEntranceFee});
            const time=31
            await network.provider.send("evm_increaseTime",[time]);
            await network.provider.send("evm_mine",[]);
            await raffle.performUpkeep("0x");
            await expect(raffle.enterRaffle({value: raffleEntranceFee})).to.be.revertedWith("Not open");
        })
    })

    describe("checkUpkeep", function(){
        it("returns false if people have not send any ETH",async function(){
            const time=31;
            await network.provider.send("evm_increaseTime",[time]);
            await network.provider.send("evm_mine",[]);
            const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
            assert(!upkeepNeeded);
        })
        it("returns false if raffle isn't open",async function(){
            await raffle.enterRaffle({value:raffleEntranceFee});
            const time=31;
            await network.provider.send("evm_increaseTime",[time]);
            await network.provider.send("evm_mine",[]);
            await raffle.performUpkeep("0x");
            const raffleState=await raffle.getRaffleState();
            const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
            assert.equal(raffleState.toString(),"1");
            assert.equal(upkeepNeeded,false)
        })
    })
    describe("performUpkeep",function(){
        it("it can only run if checkupkeep is true",async function(){
            await raffle.enterRaffle({value:raffleEntranceFee})
            const time=31
            await network.provider.send("evm_increaseTime",[time])
            await network.provider.send("evm_mine",[]);
            const tx=await raffle.performUpkeep("0x");
            assert(tx);
        })
        it("revert when checkupkeep is false",async function(){
            await expect(raffle.performUpkeep("0x")).to.be.revertedWith("Upkeep not needed");
        })
        it("updates the raffle state, emits and event, and calls the vrf coordinator",async function(){
            await raffle.enterRaffle({value:raffleEntranceFee})
            const time=31
            await network.provider.send("evm_increaseTime",[time])
            await network.provider.send("evm_mine",[]);
            const txResponse= await raffle.performUpkeep("0x");
            const txReceipt=await txResponse.wait(1)
            const requestId=txReceipt.logs[1].args.requestId;
            const raffleState=await raffle.getRaffleState()
            assert(requestId>0)
            assert(raffleState.toString()=="1")
        })
    })
    
})