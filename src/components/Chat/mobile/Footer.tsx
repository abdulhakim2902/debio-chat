import { useChat } from '@/src/contexts/ChatContext'
import { useContract } from '@/src/contexts/ContractContext'
import { Fragment, useState, FormEvent } from 'react'
import { FC } from 'react'
import { IoMdSend } from 'react-icons/io'
import { useNearWallet } from '@/src/contexts/NearContext'
import {
  TextField,
  Fab,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Button,
  Typography
} from '@mui/material'

type FooterProps = {
  sessions: string
}

export const FooterChat: FC<FooterProps> = ({ sessions }) => {
  const { model, message, onChangeMessage, onChangeModel, onSendMessage } = useChat()
  const { signedAccountId } = useNearWallet()
  const { loading, token, conversation, burn, buy } = useContract()
  const [openBurnModal, setOpenBurnModal] = useState(false)
  const [openBuyModal, setOpenBuyModal] = useState(false)
  const [burnAmount, setBurnAmount] = useState('')
  const [buyAmount, setBuyAmount] = useState('')

  const handleCloseBurnModal = () => {
    setOpenBurnModal(false)
    setBurnAmount('')
  }

  const handleCloseBuyModal = () => {
    setOpenBuyModal(false)
    setBuyAmount('')
  }

  const handleBuyClick = () => {
    setOpenBuyModal(true)
  }

  const handleBurnClick = () => {
    setOpenBurnModal(true)
  }

  return (
    <Fragment>
      {signedAccountId && (
        <div>
          <Chip
            label='Burn 5 $DBIO : get 5 sessions'
            onClick={handleBurnClick}
            color='secondary'
            sx={{
              position: 'fixed',
              bottom: 101,
              left: 91,
              '& .MuiChip-label': {
                fontFamily: 'Roboto',
                color: '#FF56E0'
              }
            }}
          ></Chip>
          <Typography color={'#FEFEFE'} sx={{ position: 'fixed', bottom: 76, left: 113, fontFamily: 'Roboto' }}>
            Remaining Sessions: {sessions}
          </Typography>
        </div>
      )}
      <TextField
        id='outlined-basic-email'
        InputProps={{
          sx: { borderRadius: 50 }
        }}
        onChange={event => onChangeMessage(event.target.value)}
        value={message}
        label='Message Debby'
        variant='filled'
        sx={{ position: 'fixed', left: 13, bottom: 21, right: 70, backgroundColor: 'white', borderRadius: 20 }}
      />
      <div style={{ position: 'fixed', right: 6, bottom: 21 }}>
        <Fab
          color='primary'
          onClick={() => onSendMessage('ME', message)}
          aria-label='add'
          sx={{ position: 'fixed', right: 6, bottom: 21 }}
        >
          <IoMdSend />
        </Fab>
      </div>
      <Dialog
        open={openBurnModal}
        onClose={handleCloseBurnModal}
        PaperProps={{
          component: 'form',
          onSubmit: (event: FormEvent) => {
            event.preventDefault()
            burn(burnAmount)
          }
        }}
      >
        <DialogTitle>Burn</DialogTitle>
        <DialogContent>
          <DialogContentText>To use the chat, please burn your {token.symbol} to get the session.</DialogContentText>
          <TextField
            autoFocus
            required
            margin='dense'
            id='name'
            name='amount'
            label='Amount'
            type='text'
            fullWidth
            value={burnAmount ? burnAmount : ''}
            variant='standard'
            onChange={event => {
              const value = event.target.value
              if (!isNaN(Number(value)) && Number(value) >= 0) {
                setBurnAmount(value)
              }
            }}
            InputProps={{
              endAdornment: <InputAdornment position='end'>{token.symbol}</InputAdornment>
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBurnModal} variant='outlined'>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            {loading.burn ? 'Burning...' : 'Burn'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openBuyModal}
        onClose={handleCloseBuyModal}
        PaperProps={{
          component: 'form',
          onSubmit: (event: FormEvent) => {
            event.preventDefault()
            buy(buyAmount)
          }
        }}
      >
        <DialogTitle>Buy</DialogTitle>
        <DialogContent>
          <DialogContentText>Please buy more {token.symbol} to get the session.</DialogContentText>
          <TextField
            autoFocus
            required
            margin='dense'
            id='name'
            name='amount'
            label='Amount'
            type='text'
            fullWidth
            value={buyAmount ? buyAmount : ''}
            variant='standard'
            onChange={event => {
              const value = event.target.value
              if (!isNaN(Number(value)) && Number(value) >= 0) {
                setBuyAmount(value)
              }
            }}
            InputProps={{
              endAdornment: <InputAdornment position='end'>{token.symbol}</InputAdornment>
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBuyModal} variant='outlined'>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            {loading.buy ? 'Buying...' : 'Buy'}
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}
