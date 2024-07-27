import { useChat } from '@/src/contexts/ChatContext'
import { useContract } from '@/src/contexts/ContractContext'
import { Fragment, useState, FormEvent } from 'react'
import { IoMdSend } from 'react-icons/io'
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
  Button
} from '@mui/material'

export const FooterChat = () => {
  const { model, message, onChangeMessage, onChangeModel, onSendMessage } = useChat()
  const { loading, token, session, burn, buy } = useContract()
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
      <div>
        <Chip
          label='Burn $DBIO'
          onClick={handleBurnClick}
          color='primary'
          sx={{ position: 'fixed', bottom: 86, left: 13 }}
        ></Chip>
      </div>
      <div>
        <Chip label='Buy $DBIO' onClick={handleBuyClick} sx={{ position: 'fixed', bottom: 86, right: 13 }}></Chip>
      </div>
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
