import { Fragment } from 'react'
import { Header } from './Header'
import { Chat } from './Chat'
import { useChat } from '@/src/contexts/ChatContext'
import { useContract } from '@/src/contexts/ContractContext'
import { FooterChat } from './Footer'

export const MobileChat = () => {
  const { token, session } = useContract()
  const { model } = useChat()

  return (
    <Fragment>
      <Header model={model} token={token} session={session} />
      <Chat />
      <FooterChat />
    </Fragment>
  )
}
