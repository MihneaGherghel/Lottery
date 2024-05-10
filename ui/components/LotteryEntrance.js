import { contractAddresses, abi } from "../constants"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"
import { Card, CardContent, Grid } from "@mui/material"
import Typography from "@mui/material/Typography"

export default function LotteryEntrance() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // State hooks
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables
    const [entranceFee, setEntranceFee] = useState("0")
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        msgValue: entranceFee,
        params: {},
    })

    /* View Functions */

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getPlayersNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUIValues() {
        // Another way we could make a contract call:
        // const options = { abi, contractAddress: raffleAddress }
        // const fee = await Moralis.executeFunction({
        //     functionName: "getEntranceFee",
        //     ...options,
        // })
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getPlayersNumber()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumberOfPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])
    // no list means it'll update everytime anything changes or happens
    // empty list means it'll run once after the initial rendering
    // and dependencies mean it'll run whenever those things in the list change

    // An example filter for listening for events, we will learn more on this next Front end lesson
    // const filter = {
    //     address: raffleAddress,
    //     topics: [
    //         // the name of the event, parnetheses containing the data type of each event, no spaces
    //         utils.id("RaffleEnter(address)"),
    //     ],
    // }

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUIValues()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="p-5 w-[100vw] w-full h-[90vh] flex items-center">
            {raffleAddress ? (
                <div className={'w-full'}>
                    <Grid container justifyContent="center" alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                            <StatsCard value={`${ethers.utils.formatUnits(entranceFee, "ether")} ETH`} text="Entrance Fee" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <StatsCard value={numberOfPlayers} text="Current Number Of Players" />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <StatsCard textSize={20} value={recentWinner} text="Previous Winner" />
                        </Grid>
                    </Grid>
                    <div className={'text-center py-2'}>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                            onClick={async () =>
                                await enterRaffle({
                                    // onComplete:
                                    // onError:
                                    onSuccess: handleSuccess,
                                    onError: (error) => console.log(error),
                                })
                            }
                            disabled={isLoading || isFetching}
                        >
                            {isLoading || isFetching ? (
                                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                            ) : (
                                "Enter Raffle"
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}

const StatsCard = ({ value, text, textSize = 44 }) => {
    return (
        <Card className={'sm:h-[100px] md:h-[300px]'} elevation={5} sx={{ minWidth: 200, borderRadius: 2, m: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography style={{ wordWrap: "break-word" }} className={'text-center max-w-full'}
                                sx={{ fontSize: textSize, fontWeight: 'bold', color: 'primary.main' }} gutterBottom>
                        {value}
                    </Typography>
                    <div className={'text-center max-w-full'}>
                        {text}
                    </div>
            </CardContent>
        </Card>
    );
}
