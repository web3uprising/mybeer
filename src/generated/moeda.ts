export const moedaAbi = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name_",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol_",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "initialSupply",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxSupply_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "inflationBps_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "feeBps_",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AboveMaxSupply",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FeeTooHigh",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BPS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "YEAR",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeBps",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "feeFor",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "inflationBps",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastInflationMint",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mintInflation",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pendingInflation",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "treasury_",
        "type": "address"
      }
    ],
    "name": "setTreasury",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "treasury",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

export const moedaBytecode = "0x60e060405234801561000f575f5ffd5b5060405161130a38038061130a83398101604081905261002e91610414565b338686600361003d8382610520565b50600461004a8282610520565b5050506001600160a01b03811661007b57604051631e4fbdf760e01b81525f60048201526024015b60405180910390fd5b61008481610111565b506103e88111156100a85760405163cd4e616760e01b815260040160405180910390fd5b82158015906100b657508284115b156100d4576040516376ca271560e11b815260040160405180910390fd5b608083905260a082905260c0819052600680546001600160a01b03191633908117909155426007556101069085610162565b50505050505061064a565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b6001600160a01b03821661018b5760405163ec442f0560e01b81525f6004820152602401610072565b6101965f838361019a565b5050565b6001600160a01b038316158015906101ba57506001600160a01b03821615155b80156101c7575060c05115155b80156101e157506006546001600160a01b03848116911614155b15610206576006546102069084906001600160a01b031661020184610216565b610251565b610211838383610251565b505050565b5f612710600161271060c0518561022d91906105ee565b6102379190610605565b6102419190610618565b61024b919061062b565b92915050565b6001600160a01b03831661027b578060025f8282546102709190610605565b909155506102eb9050565b6001600160a01b0383165f90815260208190526040902054818110156102cd5760405163391434e360e21b81526001600160a01b03851660048201526024810182905260448101839052606401610072565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b03821661030757600280548290039055610325565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161036a91815260200190565b60405180910390a3505050565b634e487b7160e01b5f52604160045260245ffd5b5f82601f83011261039a575f5ffd5b81516001600160401b038111156103b3576103b3610377565b604051601f8201601f19908116603f011681016001600160401b03811182821017156103e1576103e1610377565b6040528181528382016020018510156103f8575f5ffd5b8160208501602083015e5f918101602001919091529392505050565b5f5f5f5f5f5f60c08789031215610429575f5ffd5b86516001600160401b0381111561043e575f5ffd5b61044a89828a0161038b565b602089015190975090506001600160401b03811115610467575f5ffd5b61047389828a0161038b565b604089015160608a015160808b015160a0909b0151999c929b509099909890975095509350505050565b600181811c908216806104b157607f821691505b6020821081036104cf57634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561021157805f5260205f20601f840160051c810160208510156104fa5750805b601f840160051c820191505b81811015610519575f8155600101610506565b5050505050565b81516001600160401b0381111561053957610539610377565b61054d81610547845461049d565b846104d5565b6020601f82116001811461057f575f83156105685750848201515b5f19600385901b1c1916600184901b178455610519565b5f84815260208120601f198516915b828110156105ae578785015182556020948501946001909201910161058e565b50848210156105cb57868401515f19600387901b60f8161c191681555b50505050600190811b01905550565b634e487b7160e01b5f52601160045260245ffd5b808202811582820484141761024b5761024b6105da565b8082018082111561024b5761024b6105da565b8181038181111561024b5761024b6105da565b5f8261064557634e487b7160e01b5f52601260045260245ffd5b500490565b60805160a05160c051610c6c61069e5f395f81816101c00152818161056c01526108ed01525f81816102a5015261044f01525f81816102d401528181610499015281816104c301526105060152610c6c5ff3fe608060405234801561000f575f5ffd5b5060043610610148575f3560e01c806383914540116100bf578063c551a2f911610079578063c551a2f9146102c7578063d5abeb01146102cf578063dd62ed3e146102f6578063f0f442601461032e578063f2fde38b14610341578063ffe5bd6514610354575f5ffd5b806383914540146102565780638da5cb5b1461026157806395d89b4114610272578063a9059cbb1461027a578063ad6f49a31461028d578063b70b6b26146102a0575f5ffd5b806324a9d8531161011057806324a9d853146101bb578063313ce567146101e25780635fda4659146101f157806361d027b3146101f957806370a0823114610224578063715018a61461024c575f5ffd5b806306fdde031461014c578063095ea7b31461016a57806318160ddd1461018d57806323b872dd1461019f578063249d39e9146101b2575b5f5ffd5b61015461035d565b6040516101619190610a7b565b60405180910390f35b61017d610178366004610acb565b6103ed565b6040519015158152602001610161565b6002545b604051908152602001610161565b61017d6101ad366004610af3565b610406565b61019161271081565b6101917f000000000000000000000000000000000000000000000000000000000000000081565b60405160128152602001610161565b610191610429565b60065461020c906001600160a01b031681565b6040516001600160a01b039091168152602001610161565b610191610232366004610b2d565b6001600160a01b03165f9081526020819052604090205490565b610254610531565b005b6101916301e1338081565b6005546001600160a01b031661020c565b610154610544565b61017d610288366004610acb565b610553565b61019161029b366004610b46565b610560565b6101917f000000000000000000000000000000000000000000000000000000000000000081565b6101916105af565b6101917f000000000000000000000000000000000000000000000000000000000000000081565b610191610304366004610b5d565b6001600160a01b039182165f90815260016020908152604080832093909416825291909152205490565b61025461033c366004610b2d565b6105e5565b61025461034f366004610b2d565b61060f565b61019160075481565b60606003805461036c90610b8e565b80601f016020809104026020016040519081016040528092919081815260200182805461039890610b8e565b80156103e35780601f106103ba576101008083540402835291602001916103e3565b820191905f5260205f20905b8154815290600101906020018083116103c657829003601f168201915b5050505050905090565b5f336103fa818585610651565b60019150505b92915050565b5f33610413858285610663565b61041e8585856106df565b506001949350505050565b5f5f600754426104399190610bda565b90505f61044c6301e13380612710610bed565b827f000000000000000000000000000000000000000000000000000000000000000061047760025490565b6104819190610bed565b61048b9190610bed565b6104959190610c04565b90507f0000000000000000000000000000000000000000000000000000000000000000158015906104f857507f0000000000000000000000000000000000000000000000000000000000000000816104ec60025490565b6104f69190610c23565b115b156104005760025461052a907f0000000000000000000000000000000000000000000000000000000000000000610bda565b9392505050565b61053961073c565b6105425f610769565b565b60606004805461036c90610b8e565b5f336103fa8185856106df565b5f6127106001816105917f000000000000000000000000000000000000000000000000000000000000000086610bed565b61059b9190610c23565b6105a59190610bda565b6104009190610c04565b5f6105b861073c565b6105c0610429565b42600755905080156105e2576006546105e2906001600160a01b0316826107ba565b90565b6105ed61073c565b600680546001600160a01b0319166001600160a01b0392909216919091179055565b61061761073c565b6001600160a01b03811661064557604051631e4fbdf760e01b81525f60048201526024015b60405180910390fd5b61064e81610769565b50565b61065e83838360016107f2565b505050565b6001600160a01b038381165f908152600160209081526040808320938616835292905220545f198110156106d957818110156106cb57604051637dc7a0d960e11b81526001600160a01b0384166004820152602481018290526044810183905260640161063c565b6106d984848484035f6107f2565b50505050565b6001600160a01b03831661070857604051634b637e8f60e11b81525f600482015260240161063c565b6001600160a01b0382166107315760405163ec442f0560e01b81525f600482015260240161063c565b61065e8383836108c4565b6005546001600160a01b031633146105425760405163118cdaa760e01b815233600482015260240161063c565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b6001600160a01b0382166107e35760405163ec442f0560e01b81525f600482015260240161063c565b6107ee5f83836108c4565b5050565b6001600160a01b03841661081b5760405163e602df0560e01b81525f600482015260240161063c565b6001600160a01b03831661084457604051634a1406b160e11b81525f600482015260240161063c565b6001600160a01b038085165f90815260016020908152604080832093871683529290522082905580156106d957826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516108b691815260200190565b60405180910390a350505050565b6001600160a01b038316158015906108e457506001600160a01b03821615155b801561090f57507f000000000000000000000000000000000000000000000000000000000000000015155b801561092957506006546001600160a01b03848116911614155b1561094e5760065461094e9084906001600160a01b031661094984610560565b610955565b61065e8383835b6001600160a01b03831661097f578060025f8282546109749190610c23565b909155506109ef9050565b6001600160a01b0383165f90815260208190526040902054818110156109d15760405163391434e360e21b81526001600160a01b0385166004820152602481018290526044810183905260640161063c565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b038216610a0b57600280548290039055610a29565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610a6e91815260200190565b60405180910390a3505050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b0381168114610ac6575f5ffd5b919050565b5f5f60408385031215610adc575f5ffd5b610ae583610ab0565b946020939093013593505050565b5f5f5f60608486031215610b05575f5ffd5b610b0e84610ab0565b9250610b1c60208501610ab0565b929592945050506040919091013590565b5f60208284031215610b3d575f5ffd5b61052a82610ab0565b5f60208284031215610b56575f5ffd5b5035919050565b5f5f60408385031215610b6e575f5ffd5b610b7783610ab0565b9150610b8560208401610ab0565b90509250929050565b600181811c90821680610ba257607f821691505b602082108103610bc057634e487b7160e01b5f52602260045260245ffd5b50919050565b634e487b7160e01b5f52601160045260245ffd5b8181038181111561040057610400610bc6565b808202811582820484141761040057610400610bc6565b5f82610c1e57634e487b7160e01b5f52601260045260245ffd5b500490565b8082018082111561040057610400610bc656fea26469706673582212209d12d1cc6cab6c21dd18e85639be54b29f973ad286ff81434fb752a2859369d964736f6c634300081c0033" as const
