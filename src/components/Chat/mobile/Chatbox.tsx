import { FC, ReactNode } from 'react'
import { Box, Chip, Container } from '@mui/material'

export type ChatboxProps = {
  user: boolean
  msg: ReactNode
}

export const ChatBox: FC<ChatboxProps> = ({ user, msg }) => {
  if (user === true)
    return (
      <>
        <Container
          sx={{
            height: 'auto',
            maxHeight: 400
          }}
        >
          <Chip
            label={msg}
            color='primary'
            sx={{
              position: 'relative',
              top: 5,
              float: 'left',
              maxWidth: '90%',
              height: 'auto',
              '& .MuiChip-label': {
                display: 'block',
                whiteSpace: 'normal',
                fontSize: 14
              }
            }}
          ></Chip>
        </Container>
        <div
          style={{
            paddingBottom: 15
          }}
        ></div>
      </>
    )
  else
    return (
      <>
        <Container
          sx={{
            height: 'auto',
            maxHeight: 400
          }}
        >
          <Chip
            label={msg}
            color='secondary'
            sx={{
              position: 'relative',
              top: 5,
              marginRight: 'auto',
              float: 'right',
              marginLeft: 2,
              maxWidth: '90%',
              height: 'auto',
              '& .MuiChip-label': {
                display: 'block',
                whiteSpace: 'normal',
                fontSize: 14
              }
            }}
          ></Chip>
        </Container>
        <div
          style={{
            paddingBottom: 15
          }}
        ></div>
      </>
    )
}
