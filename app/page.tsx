"use client";

import { Chat } from "@/src/components/ChatV2/Chat";
import { NearContext } from "@/src/contexts/NearContext";
import { Wallet } from "@/src/services/near";
import { useEffect, useState } from "react";

const wallet = new Wallet('testnet', 'debio-test2.testnet');

export default function Home() {
  const [signedAccountId, setSignedAccountId] = useState('');

  useEffect(() => {
    wallet.startUp(setSignedAccountId)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <NearContext.Provider value={{ wallet, signedAccountId }}>
        <Chat />
      </NearContext.Provider>
    </main>
  );
}
