const burnContractPerNetwork = {
  mainnet: '',
  testnet: 'dbio-burn5.testnet'
}

const tokenContractPerNetwork = {
  mainnet: '',
  testnet: 'debio-token4.testnet'
}

export const NetworkId = 'testnet'
export const BurnContract = burnContractPerNetwork[NetworkId]
export const TokenContract = tokenContractPerNetwork[NetworkId]
