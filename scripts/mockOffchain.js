const { ethers } = require("hardhat")

async function mockKeepers() {
    const raffle = await ethers.getContract("Raffle")
    const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x")
    console.log(await raffle.getNumberOfPlayers())
    console.log(await raffle.getRaffleState())
    console.log(await raffle.getLatestTimeStamp())
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    if (upkeepNeeded==true) {
        const tx = await raffle.performUpkeep("0x")
        const txReceipt = await tx.wait(1)
        const requestId = txReceipt.logs[1].args.requestId
        console.log(`Performed upkeep with RequestId: ${requestId}`)
        if (network.chainId == 31337) {
            await mockVrf(requestId, raffle)
        }
    } else {
        console.log("No upkeep needed!")
    }
}

async function mockVrf(requestId, raffle) {
    const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
    await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, raffle.target)
    const recentWinner = await raffle.getRecentWinner()
    console.log(`The winner is: ${recentWinner}`)
}

mockKeepers()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })