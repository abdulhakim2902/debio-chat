import { Token } from '@/src/contexts/ContractContext'
import { Avatar, Box, Container, IconButton, Popper, Typography } from '@mui/material'
import { FC } from 'react'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown'
import InfoIcon from '@mui/icons-material/Info'
import { useState } from 'react'

type HeaderProps = {
  model: string
  token: Token
  session: number
}

export const Header: FC<HeaderProps> = ({ model, token, session }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popper' : undefined

  return (
    <>
      <Container sx={{ bgcolor: '#551149', height: 60, position: 'absolute', top: 0, left: 0 }} maxWidth={'md'}>
        <Typography
          color={'#FFFFFF'}
          sx={{ position: 'absolute', top: 13, right: 17, fontSize: 10, fontFamily: 'Open Sans' }}
        >
          {' '}
          <b>Balance</b>: $DBIO {token.formatted}{' '}
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
        <div style={{ position: 'fixed', left: 57, top: 21, display: 'inline' }}>
          <Typography color={'#FFFFFF'} sx={{ fontSize: 12, fontFamily: 'Open Sans' }}>
            {model.toUpperCase()}
          </Typography>
          <ArrowCircleDownIcon sx={{ position: 'absolute', left: 50, top: -1, color: 'white' }} />
        </div>
      </Container>
      <IconButton onClick={handleClick} sx={{ position: 'fixed', top: 19, right: 120, color: 'red' }}>
        <InfoIcon />
      </IconButton>

      <Popper id={id} open={open} anchorEl={anchorEl}>
        <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
          <Typography>
            Provision of Service: DeBio services are for research, information, and education only. DeBio does not
            provide medical or diagnostic advice. Consult your doctor or healthcare provider for any medical concerns.
            In case of emergency, call emergency services or go to the nearest emergency room.
          </Typography>
        </Box>
      </Popper>
    </>
  )
}
