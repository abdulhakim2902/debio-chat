import { useChat } from '@/src/contexts/ChatContext'
import { FC, Fragment } from 'react'
import { IoMdSend } from 'react-icons/io'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Fab,
  Chip,
  Stack,
  Container,
  SxProps
} from '@mui/material'

import { ChatBox } from './Chatbox'

export type ChatProps = {}

export const Chat: FC<ChatProps> = ({}) => {
  const { model, message, chats, loading, onChangeMessage, onChangeModel, onSendMessage } = useChat()

  return (
      <Container
        maxWidth={'md'}
        sx={{ position: 'fixed', top: 80, left: 0, bottom: 130, overflowY: 'scroll', display: 'flex' }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%'
          }}
        >
          {chats.map((c, i) => (
            <ChatBox msg={c.msg} user={c.from === 'ME'}></ChatBox>
          ))}
        </div>
      </Container>
  )
}
