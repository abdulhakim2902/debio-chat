import { createContext, FC, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { useNearWallet } from './NearContext'
import { formatUnits, parseUnits } from '@/src/utils/number'
import { enqueueSnackbar } from 'notistack'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { AppConfig } from '../config'

type ContractContextValue = {
  loading: {
    buy: boolean
    burn: boolean
    balance: boolean
    conversation: boolean
  }
  conversation: Omit<Token, 'symbol'>
  token: Token
  balance: () => void
  buy: (amount?: string) => void
  burn: (amount?: string) => void
  converse: (amount?: string, cb?: (err: unknown) => void) => void
}

export type Token = {
  balance: number
  decimals: number
  symbol: string
  formatted: string
}

export const ContractContext = createContext<ContractContextValue>({
  loading: {
    buy: false,
    burn: false,
    balance: false,
    conversation: false
  },
  conversation: { balance: 0, decimals: 18, formatted: '0' },
  token: { balance: 0, decimals: 18, symbol: '', formatted: '0' },

  balance: () => {},
  buy: () => {},
  burn: () => {},
  converse: () => {}
})

type ContractProviderProps = {
  children: ReactNode
}

export const ContractProvider: FC<ContractProviderProps> = ({ children }) => {
  const { signedAccountId, wallet } = useNearWallet()

  const [loading, setLoading] = useState({
    buy: false,
    burn: false,
    balance: false,
    conversation: false
  })

  const [conversation, setConversation] = useState({ balance: 0, decimals: 18, formatted: '0' })
  const [token, setToken] = useState({ balance: 0, decimals: 18, symbol: '', formatted: '0' })

  const balance = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, balance: true }))

      if (!signedAccountId || !wallet) {
        throw 'WALLET_NOT_CONNECTED'
      }

      const [tokenBalance, tokenMetadata, conversation] = await Promise.all([
        wallet.viewMethod({
          contractId: AppConfig.NEAR_CONTRACTS.TOKEN,
          method: 'ft_balance_of',
          args: { account_id: signedAccountId }
        }),
        wallet.viewMethod({ contractId: AppConfig.NEAR_CONTRACTS.TOKEN, method: 'ft_metadata' }),
        wallet.viewMethod({
          contractId: AppConfig.NEAR_CONTRACTS.BURN,
          method: 'balance_of',
          args: {
            token_id: AppConfig.NEAR_CONTRACTS.TOKEN,
            account_id: signedAccountId
          }
        })
      ])

      setConversation({
        balance: conversation,
        decimals: tokenMetadata.decimals,
        formatted: (+formatUnits(conversation, tokenMetadata.decimals)).toLocaleString('en-Us')
      })
      setToken({
        balance: tokenBalance,
        decimals: tokenMetadata.decimals,
        symbol: tokenMetadata.symbol,
        formatted: (+formatUnits(tokenBalance, tokenMetadata.decimals)).toLocaleString('en-Us')
      })
    } catch (err: any) {
      enqueueSnackbar(err.message || err, { variant: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, balance: false }))
    }
  }, [signedAccountId, wallet])

  const burn = async (amount = '1') => {
    try {
      setLoading(prev => ({ ...prev, burn: true }))

      if (!wallet || !signedAccountId) {
        throw 'WALLET_NOT_CONNECTED'
      }

      if (isNaN(Number(amount))) {
        throw 'INVALID_AMOUNT'
      }

      const tokenAmount = parseUnits(amount, token.decimals)

      if (Number(token.balance) < Number(tokenAmount)) {
        throw 'INSUFFICIENT_BALANCE'
      }

      await wallet.callMethods([
        {
          contractId: AppConfig.NEAR_CONTRACTS.TOKEN,
          method: 'storage_deposit',
          args: { account_id: AppConfig.NEAR_CONTRACTS.BURN },
          deposit: parseNearAmount('0.00125') || '0'
        },
        {
          contractId: AppConfig.NEAR_CONTRACTS.TOKEN,
          method: 'ft_transfer_call',
          args: { receiver_id: AppConfig.NEAR_CONTRACTS.BURN, amount: tokenAmount, msg: '' },
          deposit: '1'
        },
        {
          contractId: AppConfig.NEAR_CONTRACTS.BURN,
          method: 'burn',
          args: { token_id: AppConfig.NEAR_CONTRACTS.TOKEN },
          deposit: '1'
        }
      ])
    } catch (err: any) {
      enqueueSnackbar(err?.message || err, { variant: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, burn: false }))
    }
  }

  const converse = async (amount = '1', cb?: (err?: unknown) => void) => {
    try {
      setLoading(prev => ({ ...prev, conversation: true }))

      if (!wallet || !signedAccountId) {
        throw 'WALLET_NOT_CONNECTED'
      }

      const conversationAmount = parseUnits(amount, conversation.decimals)

      if (Number(conversation.balance) < Number(conversationAmount)) {
        throw 'INSUFFICIENT_CONVERSATION'
      }

      const account = await wallet.callMethod({
        contractId: AppConfig.NEAR_CONTRACTS.BURN,
        method: 'converse',
        args: { token_id: AppConfig.NEAR_CONTRACTS.TOKEN, amount: conversationAmount }
      })

      setConversation(prev => ({
        ...prev,
        balance: account.amount,
        formatted: (+formatUnits(account.amount, prev.decimals)).toLocaleString('en-Us')
      }))

      cb && cb()
    } catch (err: any) {
      enqueueSnackbar(err?.message || err, { variant: 'error' })
      cb && cb(err)
    } finally {
      setLoading(prev => ({ ...prev, conversation: false }))
    }
  }

  const buy = async (amount = '1') => {
    try {
      setLoading(prev => ({ ...prev, buy: true }))

      if (!wallet || !signedAccountId) {
        throw 'WALLET_NOT_CONNECTED'
      }

      const tokenAmount = parseUnits(amount, token.decimals)

      await wallet.callMethod({
        contractId: AppConfig.NEAR_CONTRACTS.TOKEN,
        method: 'buy',
        args: { amount: tokenAmount },
        deposit: String(parseNearAmount('0.00125'))
      })
    } catch (err: any) {
      enqueueSnackbar(err?.message || err, { variant: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, buy: false }))
    }
  }

  return (
    <ContractContext.Provider value={{ loading, conversation, token, balance, buy, converse, burn }}>
      {children}
    </ContractContext.Provider>
  )
}

export const useContract = () => useContext(ContractContext)
