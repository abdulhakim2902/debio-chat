"use client";

import { Chat } from "@/src/components/Chat/Chat";
import { NearContext } from "@/src/contexts/NearContext";
import { Wallet } from "@/src/services/near";
import { useEffect, useState } from "react";
import { useTheme, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ThemeProvider } from "@emotion/react";

const wallet = new Wallet('testnet', 'debio-test2.testnet');

export default function Home() {
  const [signedAccountId, setSignedAccountId] = useState('');

  useEffect(() => {
    wallet.startUp(setSignedAccountId)
  }, [])

  const themes = createTheme({
    palette: {
      primary: {
        main : '#FF56E0'
      },
    },
  });

  const theme = useTheme()
  const isMobile = !useMediaQuery(theme.breakpoints.up('md'));

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <NearContext.Provider value={{ wallet, signedAccountId, onChangeSignedAccountId: setSignedAccountId }}>
        <ThemeProvider theme={themes}>
          <Chat isMobile={isMobile}/>
        </ThemeProvider>
      </NearContext.Provider>
    </main>
  );
}
