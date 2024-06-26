import { createContext } from 'react'
import { Wallet } from '../services/near'

export type NearContextValue = {
  wallet?: Wallet
  signedAccountId?: string
  onChangeSignedAccountId: (value: string) => void
}

export const NearContext = createContext<NearContextValue>({
  wallet: undefined,
  signedAccountId: undefined,
  onChangeSignedAccountId: () => ({})
})
