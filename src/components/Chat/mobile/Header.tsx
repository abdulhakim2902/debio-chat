import { Token } from '@/src/contexts/ContractContext'
import { Avatar, Container, Typography } from '@mui/material'
import { FC } from 'react'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';

type HeaderProps = {
  model: string
  token: Token
  session: number
}

export const Header: FC<HeaderProps> = ({ model, token,session }) => {
  return (
    <Container sx={{ bgcolor: '#551149', height: 60, position: 'absolute', top: 0, left: 0 }} maxWidth={'md'}>
      <Typography
        color={'#FFFFFF'}
        sx={{ position: 'absolute', top: 13, right: 17, fontSize: 10, fontFamily: 'Open Sans' }}
      >
        {' '}
        <b>Balance</b>: ${token.symbol} {token.formatted}{' '}
      </Typography>
      <Typography
        color={'#FFFFFF'}
        sx={{ position: 'absolute', top: 28, right: 17, fontSize: 10, fontFamily: 'Open Sans' }}
      >
        {' '}
        <b>Session</b>: {session}{' '}
      </Typography>
      <Avatar
        alt='debio'
        src='public/debio-logo.svg'
        sx={{ position: 'absolute', height: 40, width: 40, left: 10, top: 10 }}
      />
      <div style={{ position: 'fixed', left: 57, top: 21, display:'inline' }}>
        <Typography color={'#FFFFFF'} sx={{ fontSize: 12, fontFamily: 'Open Sans' }}>
          {model.toUpperCase()}
        </Typography>
        <ArrowCircleDownIcon sx={{position:'absolute', left:50, top:-1, color:'white'}}/>
      </div>
    </Container>
  )
}
