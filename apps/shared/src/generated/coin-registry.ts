export const coinRegistryAbi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "AlreadyAdded",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "NotAdded",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotAllowed",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "NotERC20",
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
    "inputs": [],
    "name": "ZeroPrice",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "beerPrice",
        "type": "uint256"
      }
    ],
    "name": "BeerPriceChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "beerPrice",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "addedBy",
        "type": "address"
      }
    ],
    "name": "CoinAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "CoinRemoved",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "beerPrice",
        "type": "uint256"
      }
    ],
    "name": "addCoin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "coins",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "beerPrice",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "addedBy",
            "type": "address"
          }
        ],
        "internalType": "struct CoinRegistry.Coin[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "implementsERC20",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "isAdded",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
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
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "removeCoin",
    "outputs": [],
    "stateMutability": "nonpayable",
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
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "beerPrice",
        "type": "uint256"
      }
    ],
    "name": "setBeerPrice",
    "outputs": [],
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
  }
] as const

export const coinRegistryBytecode = "0x6080604052348015600e575f5ffd5b503380603357604051631e4fbdf760e01b81525f600482015260240160405180910390fd5b603a81603f565b50608e565b5f80546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b610a9a8061009b5f395ff3fe608060405234801561000f575f5ffd5b5060043610610090575f3560e01c80638da5cb5b116100635780638da5cb5b146100e2578063958f2949146100fc578063b40148791461011f578063c8914edb14610132578063f2fde38b1461015c575f5ffd5b806322fcefbe14610094578063484717d0146100b2578063715018a6146100c757806388363bf6146100cf575b5f5ffd5b61009c61016f565b6040516100a99190610920565b60405180910390f35b6100c56100c03660046109a4565b6101f2565b005b6100c5610262565b6100c56100dd3660046109cc565b610275565b5f546040516001600160a01b0390911681526020016100a9565b61010f61010a3660046109cc565b610427565b60405190151581526020016100a9565b6100c561012d3660046109a4565b610583565b61010f6101403660046109cc565b6001600160a01b03165f90815260026020526040902054151590565b6100c561016a3660046109cc565b610737565b60606001805480602002602001604051908101604052809291908181526020015f905b828210156101e9575f848152602090819020604080516060810182526003860290920180546001600160a01b0390811684526001808301548587015260029092015416918301919091529083529092019101610192565b50505050905090565b805f0361021257604051634dfba02360e01b815260040160405180910390fd5b8061021c83610774565b600101556040518181526001600160a01b038316907fca7e546c322fdab16e48978583d580834101fc5643f5a3ee8674f015e38fadf89060200160405180910390a25050565b61026a610830565b6102735f61085c565b565b61027e81610774565b506001600160a01b0381165f908152600260205260408120546102a390600190610a00565b600180549192505f916102b7908290610a00565b815481106102c7576102c7610a13565b5f91825260209182902060408051606081018252600390930290910180546001600160a01b03908116845260018083015495850195909552600290910154169082015281549092508291908490811061032257610322610a13565b5f91825260209182902083516003929092020180546001600160a01b03199081166001600160a01b039384161782559284015160018083019190915560409094015160029091018054909316911617905561037e908390610a27565b81516001600160a01b03165f9081526002602052604090205560018054806103a8576103a8610a3a565b5f828152602080822060035f199094019384020180546001600160a01b0319908116825560018201849055600291820180549091169055929093556001600160a01b0386168082529190925260408083208390555190917ff680a11e2a133e545daf0e5d1c6f644c8913d22d0c7297e2ba919bf649ddbd9091a2505050565b5f5f826001600160a01b03163b11801561047057506040805160048152602481019091526020810180516001600160e01b03166318160ddd60e01b1790526104709083906108ab565b80156104b857506040513060248201526104b890839060440160408051601f198184030181529190526020810180516001600160e01b03166370a0823160e01b1790526108ab565b801561050757506040513060248201819052604482015261050790839060640160408051601f198184030181529190526020810180516001600160e01b0316636eb1769f60e11b1790526108ab565b801561054257506040805160048152602481019091526020810180516001600160e01b031663313ce56760e01b1790526105429083906108ab565b801561057d57506040805160048152602481019091526020810180516001600160e01b03166395d89b4160e01b17905261057d9083906108ab565b92915050565b805f036105a357604051634dfba02360e01b815260040160405180910390fd5b6001600160a01b0382165f90815260026020526040902054156105e95760405163b6a9704f60e01b81526001600160a01b03831660048201526024015b60405180910390fd5b6105f282610427565b61061a5760405163227c0e1f60e21b81526001600160a01b03831660048201526024016105e0565b604080516060810182526001600160a01b038085168083526020808401868152338587018181526001805480820182555f828152985160039091027fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf681018054928a166001600160a01b031993841617905594517fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf786015591517fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf89094018054949097169390911692909217909455548285526002909152928490209290925591517f71231fe80132682eb5ed9265bc392ea842023d356c98ba3a6c23ef24dbc8b9f19061072b9085815260200190565b60405180910390a35050565b61073f610830565b6001600160a01b03811661076857604051631e4fbdf760e01b81525f60048201526024016105e0565b6107718161085c565b50565b6001600160a01b0381165f908152600260205260408120548082036107b75760405163cdfa80ad60e01b81526001600160a01b03841660048201526024016105e0565b60016107c38183610a00565b815481106107d3576107d3610a13565b5f918252602090912060039091020160028101549092506001600160a01b0316331480159061080c57505f546001600160a01b03163314155b1561082a57604051631eb49d6d60e11b815260040160405180910390fd5b50919050565b5f546001600160a01b031633146102735760405163118cdaa760e01b81523360048201526024016105e0565b5f80546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b5f5f5f846001600160a01b0316846040516108c69190610a4e565b5f60405180830381855afa9150503d805f81146108fe576040519150601f19603f3d011682016040523d82523d5f602084013e610903565b606091505b509150915081801561091757506020815110155b95945050505050565b602080825282518282018190525f918401906040840190835b8181101561097e57835180516001600160a01b039081168552602080830151818701526040928301519091169185019190915290930192606090920191600101610939565b509095945050505050565b80356001600160a01b038116811461099f575f5ffd5b919050565b5f5f604083850312156109b5575f5ffd5b6109be83610989565b946020939093013593505050565b5f602082840312156109dc575f5ffd5b6109e582610989565b9392505050565b634e487b7160e01b5f52601160045260245ffd5b8181038181111561057d5761057d6109ec565b634e487b7160e01b5f52603260045260245ffd5b8082018082111561057d5761057d6109ec565b634e487b7160e01b5f52603160045260245ffd5b5f82518060208501845e5f92019182525091905056fea2646970667358221220525549af24b8b61fa141e0932f8abf1c731b7aa31860e65bc51724a896a7260864736f6c634300081c0033" as const
