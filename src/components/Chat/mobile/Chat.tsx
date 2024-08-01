import { useChat } from '@/src/contexts/ChatContext'
import { FC } from 'react'
import { Container } from '@mui/material'

import { ChatBox } from './Chatbox'

export type ChatProps = {}

export const Chat: FC<ChatProps> = ({}) => {
  const { chats } = useChat()

  return (
    <Container
      maxWidth={'md'}
      sx={{ position: 'fixed', top: 225, left: 0, bottom: 130, overflowY: 'scroll', display: 'flex' }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%'
        }}
      >
        {chats.map((c, i) => (
          <ChatBox key={i} msg={c.msg} user={c.from === 'ME'}></ChatBox>
        ))}
      </div>
    </Container>
  )
}
