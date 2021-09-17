const Web3 = require("web3")
const rpcAddress =""

const pkey = ""











const web3 = new Web3(new Web3.providers.HttpProvider(rpcAddress))
const address = ""
const gasPrice = "4000000000" // 4 gwei

const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "strat",
        type: "address",
      },
    ],
    name: "AddPool",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "addAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pid",
        type: "uint256",
      },
    ],
    name: "getInformation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pid",
        type: "uint256",
      },
    ],
    name: "harvestAllx2",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "poolInfo",
    outputs: [
      {
        internalType: "address",
        name: "strat",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "lastTimeHarvest",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "last5MinProfit",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalProfit",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pid",
        type: "uint256",
      },
    ],
    name: "removeAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pid",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256",
      },
    ],
    name: "setFeeAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]

const main = async () => {
  try {
    const contract = new web3.eth.Contract(abi, address)
    console.log("running")
    const infinite = -1

    const b = await web3.eth.getBlockNumber()

    const { timestamp } = await web3.eth.getBlock(b)

    const length = await contract.methods.poolLength().call()

    console.log({ length })

    const doWeb3Stuff = async (i) => {
      let bool = false
      let pid = 0
      let lastHarvestTime = ""

      await contract.methods
        .getInformation(i)
        .call()
        .then(function (data1) {
          lastHarvestTime = data1[1]
          pid = i
        })

      await contract.methods
        .poolInfo(i)
        .call()
        .then(function (data2) {
          bool = data2[2]
        })

      console.log(pid)

      if (timestamp - lastHarvestTime >= 300 && bool == true) {
        const transaction = await contract.methods.harvestAllx2(pid)
        const signed = await web3.eth.accounts.signTransaction(
          {
            to: address,
            data: transaction.encodeABI(),
            gas: "2000000",
            gasPrice: gasPrice,
          },
          pkey
        )

        web3.eth
          .sendSignedTransaction(signed.rawTransaction)
          .on("transactionHash", (payload) => {
            console.log(`transaction: ${payload}`)
          })
          .then((receipt) => {
            console.log("done")
          })
          .catch((e) => {
            console.log(`error: ${e}`)
          })
      }
    }

    for (let i = 0; i < length; i++) {
      setTimeout(async () => {
        await doWeb3Stuff(i)
      }, 5000 * i)
    }
  } catch (err) {
    console.error(err)
  }
}

setInterval(main, 20000)
