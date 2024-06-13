"use client";

import { Chat } from "@/src/components/Chat/Chat";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Chat></Chat>
    </main>
  );
}
