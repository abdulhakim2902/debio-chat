import { createContext } from 'react'
import { Wallet } from '../services/near'

export type NearContextValue = {
  wallet?: Wallet
  signedAccountId?: string
}

export const NearContext = createContext<NearContextValue>({
  wallet: undefined,
  signedAccountId: undefined
})
