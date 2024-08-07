import { Token } from '@/src/contexts/ContractContext'
import { Avatar, Card, CardContent, Chip, Container, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import { FC } from 'react'
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown'
import { useState } from 'react'
import DebioIcon from '../../../../public/debio-logo.svg'
import { useChat } from '@/src/contexts/ChatContext'

type HeaderProps = {
  token: Token
  conversation: string
}

export const Header: FC<HeaderProps> = ({ token, conversation }) => {
  const { model, onChangeModel } = useChat()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const [disclaimer, setDisclaimer] = useState<boolean>(false)

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }
  const handleChange = () => {
    onChangeModel()
    setAnchorEl(null)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMore = () => {
    setDisclaimer(true)
  }
  const handleLess = () => {
    setDisclaimer(false)
  }
  const open = Boolean(anchorEl)

  const disclaimerString: string =
    'Provision of Service: DeBio services are for research, information, and education only. DeBio does not provide medical or diagnostic advice. Consult your doctor or healthcare provider for any medical concerns. In case of emergency, call emergency services or go to the nearest emergency room.'

  return (
    <>
      <Container sx={{ bgcolor: '#551149', height: 60, position: 'absolute', top: 0, left: 0 }} maxWidth={'md'}>
        <Typography
          color={'#FFFFFF'}
          sx={{ position: 'absolute', top: 13, right: 17, fontSize: 10, fontFamily: 'Roboto' }}
        >
          {' '}
          <b>Balance</b>: $DBIO {token.formatted}{' '}
        </Typography>
        <Chip
          label='Buy $DBIO on Ref.Finance'
          color='secondary'
          size='small'
          sx={{
            position: 'absolute',
            top: 30,
            right: 17,
            fontSize: 10,
            fontFamily: 'Roboto',
            '& .MuiChip-label': {
              fontFamily: 'Roboto',
              color: '#FF56E0'
            }
          }}
        ></Chip>
        <Avatar
          alt='debio'
          src={
            'https://static.wixstatic.com/media/11aabb_14f9099a58a44615bcc35e9d9ff12a1b~mv2.png/v1/fill/w_63,h_63,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/11aabb_14f9099a58a44615bcc35e9d9ff12a1b~mv2.png'
          }
          sx={{ position: 'absolute', height: 40, width: 40, left: 10, top: 10 }}
        />
        <div style={{ position: 'fixed', left: 57, top: 21, display: 'inline' }}>
          <IconButton sx={{ position: 'absolute', left: 0, top: -3, color: 'white' }} onClick={handleMenuClick}>
            <ArrowCircleDownIcon />
          </IconButton>
          <Menu
            id='basic-menu'
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}
          >
            <MenuItem onClick={handleChange} selected={model === 'OpenAI'}>
              OpenAI
            </MenuItem>
            <MenuItem onClick={handleChange} selected={model === 'Llama3'}>
              Llama3
            </MenuItem>
          </Menu>
        </div>
        <Card sx={{ position: 'absolute', top: 69, left: 0, width: '100%' }}>
          <CardContent>
            {!disclaimer && (
              <>
                <Typography
                  sx={{ position: 'absolute', right: 3, fontSize: 14, fontFamily: 'Roboto' }}
                  color='primary'
                  onClick={handleMore}
                >
                  Show Full Disclaimer
                </Typography>
                <Typography sx={{ position: 'relative', right: 10, fontSize: 14, fontFamily: 'Roboto' }}>
                  For research and information only
                </Typography>
              </>
            )}
            {disclaimer && (
              <>
                <Typography
                  sx={{ position: 'absolute', top: -3, right: 3, fontSize: 14, fontFamily: 'Roboto' }}
                  color='primary'
                  onClick={handleLess}
                >
                  Hide
                </Typography>
                <Typography sx={{ position: 'relative', top: 12, fontSize: 14, fontFamily: 'Roboto' }}>
                  {disclaimerString}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  )
}
