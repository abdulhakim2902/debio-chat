"use client";

import { Chat } from "@/src/components/Chat/Chat";
import { NearContext } from "@/src/contexts/NearContext";
import { Wallet } from "@/src/services/near";
import { useEffect, useState } from "react";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const wallet = new Wallet('testnet', 'debio-test2.testnet');

export default function Home() {
  const [signedAccountId, setSignedAccountId] = useState('');

  useEffect(() => {
    wallet.startUp(setSignedAccountId)
  }, [])

  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <NearContext.Provider value={{ wallet, signedAccountId, onChangeSignedAccountId: setSignedAccountId }}>
        <Chat isMobile={isMobile}/>
      </NearContext.Provider>
    </main>
  );
}
