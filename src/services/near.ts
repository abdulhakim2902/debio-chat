// near api js
import { providers } from 'near-api-js'

// wallet selector
import { distinctUntilChanged, map } from 'rxjs'
import '@near-wallet-selector/modal-ui/styles.css'
import { setupModal } from '@near-wallet-selector/modal-ui'
import { NetworkId, WalletSelector, setupWalletSelector } from '@near-wallet-selector/core'
import { setupHereWallet } from '@near-wallet-selector/here-wallet'
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet'

const THIRTY_TGAS = '30000000000000'
const NO_DEPOSIT = '0'

export class Wallet {
  networkId: NetworkId
  createAccessKeyFor: string

  constructor(networkId?: NetworkId, createAccessKeyFor?: string) {
    this.createAccessKeyFor = createAccessKeyFor || ''
    this.networkId = networkId || 'testnet'
  }

  async selector(): Promise<WalletSelector> {
    return setupWalletSelector({
      network: this.networkId,
      modules: [setupMyNearWallet(), setupHereWallet()]
    })
  }

  async startUp(accountChangeHook: (value: string) => void) {
    const walletSelector = await this.selector()
    const isSignedIn = walletSelector.isSignedIn()
    const accountId = isSignedIn ? walletSelector.store.getState().accounts[0].accountId : ''

    walletSelector.store.observable
      .pipe(
        map(state => state.accounts),
        distinctUntilChanged()
      )
      .subscribe(accounts => {
        const signedAccount = accounts.find(account => account.active)?.accountId
        if (signedAccount) {
          accountChangeHook(signedAccount)
        }
      })

    return accountId
  }

  /**
   * Displays a modal to login the user
   */
  signIn = async () => {
    const selector = await this.selector()
    const modal = setupModal(selector, { contractId: this.createAccessKeyFor })
    modal.show()
  }

  /**
   * Logout the user
   */
  signOut = async () => {
    const selector = await this.selector()
    const selectedWallet = await selector.wallet()
    selectedWallet.signOut()
  }

  async viewMethod<T>(contractId: string, method: string, args: Record<string, any> = {}): Promise<T> {
    const url = `https://rpc.${this.networkId}.near.org`
    const provider = new providers.JsonRpcProvider({ url })
    const res: any = await provider.query({
      request_type: 'call_function',
      account_id: contractId,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
      finality: 'optimistic'
    })

    return JSON.parse(Buffer.from(res.result).toString())
  }

  callMethod = async (
    contractId: string,
    method: string,
    args: Record<string, any> = {},
    gas = THIRTY_TGAS,
    deposit = NO_DEPOSIT
  ) => {
    // Sign a transaction with the "FunctionCall" action
    const selector = await this.selector()
    const selectedWallet = await selector.wallet()
    const outcome = await selectedWallet.signAndSendTransaction({
      receiverId: contractId,
      actions: [
        {
          type: 'FunctionCall',
          params: {
            methodName: method,
            args,
            gas,
            deposit
          }
        }
      ]
    })

    if (outcome) {
      return providers.getTransactionLastResult(outcome)
    }

    return null
  }

  /**
   * Makes a call to a contract
   * @param {string} txhash - the transaction hash
   * @returns {Promise<JSON.value>} - the result of the transaction
   */
  getTransactionResult = async (txhash: string) => {
    const walletSelector = await this.selector()
    const { network } = walletSelector.options
    const provider = new providers.JsonRpcProvider({ url: network.nodeUrl })

    // Retrieve transaction result from the network
    const transaction = await provider.txStatus(txhash, 'unnused')
    return providers.getTransactionLastResult(transaction)
  }
}
