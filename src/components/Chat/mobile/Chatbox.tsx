import { FC, ReactNode } from 'react'
import { Chip, Container } from '@mui/material'

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
            display: 'column',
            gridColumn: 10,
            gridAutoFlow: 'column'
          }}
        >
          <Chip
            label={msg}
            color='primary'
            sx={{
              position: 'relative',
              top: 5,
              float: 'left',
              marginTop: 2,
              maxWidth: '92%',
              height: 'auto',
              '& .MuiChip-label': {
                display: 'block',
                whiteSpace: 'normal',
                fontSize: 14,
                fontFamily: 'Open Sans'
              }
            }}
          ></Chip>
        </Container>
        <div
          style={{
            paddingBottom: 25
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
            display: 'column',
            gridColumn: 10,
            gridAutoFlow: 'column'
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
              marginTop: 2,
              maxWidth: '92%',
              height: 'auto',
              '& .MuiChip-label': {
                display: 'block',
                whiteSpace: 'normal',
                fontSize: 14,
                fontFamily: 'Open Sans'
              }
            }}
          ></Chip>
        </Container>
        <div
          style={{
            paddingBottom: 25
          }}
        ></div>
      </>
    )
}
