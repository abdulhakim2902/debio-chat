import { useChat } from '@/src/contexts/ChatContext'
import { Fab, TextField } from '@mui/material'
import { FC, Fragment } from 'react'
import { IoMdSend } from 'react-icons/io'

export type ChatProps = {}

export const Chat: FC<ChatProps> = ({}) => {
  const { model, message, chats, loading, onChangeMessage, onChangeModel, onSendMessage } = useChat()

  return (
    <Fragment>
      <TextField
        id='outlined-basic-email'
        InputProps={{
          disableUnderline: true
        }}
        onChange={event => onChangeMessage(event.target.value)}
        value={message}
        label='Type Something'
        sx={{ position: 'fixed', left: 13, bottom: 21, right: 70 }}
      />
      <div style={{ position: 'fixed', right: 6, bottom: 21 }}>
        <Fab
          color='primary'
          onClick={() => onSendMessage('ME', message)}
          aria-label='add'
          sx={{ position: 'sticky', right: 6, bottom: 21 }}
        >
          <IoMdSend />
        </Fab>
      </div>
    </Fragment>
  )
}
