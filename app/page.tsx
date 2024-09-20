'use client'

import useMediaQuery from '@mui/material/useMediaQuery'

import { NearContext } from '@/src/contexts/NearContext'
import { useEffect, useState } from 'react'
import { useTheme, createTheme } from '@mui/material/styles'
import { ThemeProvider } from '@emotion/react'
import { Wallet } from '@/src/near'
import { ContractProvider } from '@/src/contexts/ContractContext'
import { Chat } from '@/src/components/Chat'
import { SnackbarProvider } from 'notistack'
import { CssBaseline } from '@mui/material'
import { AppConfig } from '@/src/config'
import { NetworkId } from '@near-wallet-selector/core'
import { AssetProvider } from '@/src/contexts/AssetContext'

const wallet = new Wallet({
  createAccessKeyFor: AppConfig.NEAR_CONTRACTS.BURN,
  networkId: AppConfig.NEAR_NETWORK as NetworkId,
  methodNames: ['converse']
})

let themes = createTheme({
  palette: {
    primary: {
      main: '#FF56E0'
    },
    secondary: {
      main: '#FEFEFE'
    },
    background: {
      default: '#363636'
    }
  }
})

export default function Home() {
  const [signedAccountId, setSignedAccountId] = useState('')

  useEffect(() => {
    wallet.startUp(setSignedAccountId)
  }, [])

  const theme = useTheme()
  const isMobile = !useMediaQuery(theme.breakpoints.up('md'))

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <SnackbarProvider>
        <NearContext.Provider value={{ wallet, signedAccountId }}>
          <AssetProvider>
            <ContractProvider>
              <ThemeProvider theme={themes}>
                <CssBaseline />
                <Chat isMobile={isMobile} />
              </ThemeProvider>
            </ContractProvider>
          </AssetProvider>
        </NearContext.Provider>
      </SnackbarProvider>
    </main>
  )
}
