require('dotenv').config()

require("@nomiclabs/hardhat-ethers")
require('hardhat-docgen')
require('hardhat-deploy')
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-web3")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("hardhat-tracer");
require("solidity-coverage");

// npm i "dotenv" "@nomiclabs/hardhat-ethers" 'hardhat-docgen' 'hardhat-deploy' "@nomiclabs/hardhat-waffle" "@nomiclabs/hardhat-web3" "@nomiclabs/hardhat-etherscan" "solidity-coverage" "hardhat-gas-reporter" "hardhat-tracer"


const { INFURA_ID_PROJECT, BSCSCAN_API_KEY, MNEMONIC } = process.env;

const kovanURL = `https://kovan.infura.io/v3/${INFURA_ID_PROJECT}`
const goerliURL = `https://goerli.infura.io/v3/${INFURA_ID_PROJECT}`
const rinkebyURL = `https://rinkeby.infura.io/v3/${INFURA_ID_PROJECT}`
const mainnetURL = `https://mainnet.infura.io/v3/${INFURA_ID_PROJECT}`

module.exports = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    kovan: {
      url: kovanURL,
      chainId: 42,
      gas: 12000000,
      accounts: [`0x${MNEMONIC}`],
      saveDeployments: true
    },
    goerli: {
      url: goerliURL,
      chainId: 5,
      gasPrice: "auto",
      accounts: [`0x${MNEMONIC}`],
      saveDeployments: true
    },
    rinkeby: {
      url: rinkebyURL,
      chainId: 4,
      gasPrice: "auto",
      accounts: [`0x${MNEMONIC}`],
      saveDeployments: true
    },
    mainnet: {
      url: mainnetURL,
      chainId: 1,
      gasPrice: 20000000000,
      accounts: [`0x${MNEMONIC}`],
      saveDeployments: true
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s3.binance.org:8545/",
      chainId: 97,
      gasPrice: "auto",
      accounts: [`0x${MNEMONIC}`],
      saveDeployments: true
    },
    bsc: {
      url: "https://bsc-dataseed.binance.org",
      chainId: 56,
      gasPrice: 10000000000,
      accounts: [`0x${MNEMONIC}`],
      saveDeployments: true
    },
    fantomTest: {
      url: "https://rpc.testnet.fantom.network",
      accounts: [`0x${MNEMONIC}`],
      chainId: 4002,
      live: false,
      saveDeployments: true,
      gasMultiplier: 2,
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: [`0x${MNEMONIC}`],
      saveDeployments: true
    },
  },
  gasReporter: {
    enabled: true,
  },
  etherscan: {
    apiKey: BSCSCAN_API_KEY
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: false,
            runs: 200,
          },
        },
      },
    ],


  },

  namedAccounts: {
    deployer: 0,
  },

  paths: {
    sources: "contracts",
  },
  gasReporter: {
    enabled: true
  },
  mocha: {
    timeout: 200000
  }
}