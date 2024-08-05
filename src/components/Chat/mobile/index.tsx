import { Fragment } from 'react'
import { Header } from './Header'
import { Chat } from './Chat'
import { useContract } from '@/src/contexts/ContractContext'
import { FooterChat } from './Footer'

export const MobileChat = () => {
  const { token, conversation } = useContract()

  return (
    <Fragment>
      <Header token={token} conversation={conversation.formatted} />
      <Chat />
      <FooterChat sessions={conversation.formatted} />
    </Fragment>
  )
}
