import { Fragment } from 'react'
import { Header } from './Header'
import { Chat } from './Chat'
import { useChat } from '@/src/contexts/ChatContext'
import { useContract } from '@/src/contexts/ContractContext'
import { FooterChat } from './Footer'

export const MobileChat = () => {
  const { token, conversation } = useContract()
  const { model } = useChat()

  return (
    <Fragment>
      <Header model={model} token={token} conversation={conversation.balance} />
      <Chat />
      <FooterChat />
    </Fragment>
  )
}
