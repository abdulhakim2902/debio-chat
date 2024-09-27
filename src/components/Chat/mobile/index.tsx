import { Fragment, useState } from 'react'
import { Header } from './Header'
import { Chat } from './Chat'
import { useContract } from '@/src/contexts/ContractContext'
import { FooterChat } from './Footer'

export const MobileChat = () => {
  const { token, conversation } = useContract()
  const [upload, SetUpload] = useState(false)

  const onUpload = (value : boolean) => {
    SetUpload(value)
  }

  return (
    <Fragment>
      <Header token={token} conversation={conversation.formatted} />
      {!upload && <Chat />}
      <FooterChat sessions={conversation.formatted} upload={upload} onUpload={onUpload} />
    </Fragment>
  )
}
