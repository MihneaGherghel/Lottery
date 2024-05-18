require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy");
require("chai");
require("@nomiclabs/hardhat-ethers");
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()



const SEPOLIA_RPC_URL=process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY=process.env.PRIVATE_KEY;
const COINMARKETCAP_API_KEY=process.env.COINMARKETCAP_API_KEY;
const ETHERSCAN_API_KEY=process.env.ETHERSCAN_API_KEY;

module.exports = {
  defaultNetwork:"hardhat",
  networks:{
    hardhat:{
      chainId: 31337,
      blockConfirmations:1,
      port:8545
    },
    sepolia:{
      chainId:11155111,
      blockConfirmations:6,
      url:"https://eth-sepolia.g.alchemy.com/v2/SC8d0OuBYTCL20fbIiacH8OKgbU14xIz",
      accounts:["975a9cb174561107d15b942e31ec6f05ad463467f524d4c061813c2536388b34"]
    }
  },
  gasReporter:{
    enabled:false,
    currency:"USD",
    outputFile:"gas-report.txt",
    noColors:true
  },
  solidity: "0.8.24",
  namedAccounts:{
    deployer:{
      default:0,
    },
    player:{
      default:1,
    }
  },
  etherscan: {
    apiKey: {
      sepolia: 'SW5CA6WESAU417FCYDC3TMN4PIEHD4IKS9'
    }
  }
};
