import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Fab from '@mui/material/Fab'

import { IoMdSend } from 'react-icons/io'
import { useNear } from '@/src/hooks/useNear.hook'
import { Button, Chip } from '@mui/material'

const BurnContract = 'dbio-burn1.testnet'
const TokenContract = 'debio-token3.testnet'

export const Chat = () => {
  const { signedAccountId, wallet } = useNear()

  const [chat, setChat] = useState([{ from: 'AI', msg: 'Hello, this is a trial chat ai', time: '15:55' }])
  const [message, setMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [balance, setBalance] = useState({
    near: 0,
    debio: 0,
    session: 0
  })

  useEffect(() => {
    setIsLoggedIn(!!signedAccountId)
  }, [signedAccountId])

  useEffect(() => {
    if (!isLoggedIn || !wallet || !signedAccountId) return console.log('You are not connected')

    const getBalance = async () => {
      try {
        const [account, debioBalance] = await Promise.all([
          wallet.viewMethod<{ amount: number; session: number }>(BurnContract, 'get_account_session', {
            account_id: signedAccountId
          }),
          wallet.viewMethod<string>(TokenContract, 'ft_balance_of', { account_id: signedAccountId })
        ])

        setBalance(prev => ({ ...prev, session: account.session, debio: Number(debioBalance) }))
      } catch (err) {
        console.log(err)
      }
    }

    getBalance()
  }, [isLoggedIn, wallet, signedAccountId])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value)
  }

  const addMessage = async (from: string, msg: string) => {
    if (msg.trim() === '') return
    // get the current time hh:mm
    const time = new Date().toLocaleTimeString().slice(0, 5)
    setChat([...chat, { from, msg, time }])
    setMessage('')
    const resp = await addResponse(msg)
    setChat([...chat, { from, msg, time }, resp])
  }

  const addResponse = async (msg: string) => {
    if (balance.session > 0) {
      const answer = await axios.post('https://x.myriadchain.com/llm/api/generate', {
        model: 'llama3',
        prompt: msg,
        stream: false
      })
      const time = new Date().toLocaleTimeString().slice(0, 5)
      console.log(answer.data.response)

      const response = { from: 'AI', msg: answer.data.response, time }

      return response
    }

    const time = new Date().toLocaleTimeString().slice(0, 5)
    const forbidden = "You don't have session"
    const response = { from: 'AI', msg: forbidden, time }

    return response
  }

  const onHandleConnection = () => {
    if (!wallet) return console.log('Wallet not initialized')
    return isLoggedIn ? wallet.signOut() : wallet.signIn()
  }

  const onBurn = async () => {
    if (!wallet) return console.log('Wallet not initialized')

    try {
      const amount = '10000000000000000000' // 1 TOKEN
      await wallet.callMethod(BurnContract, 'burn', { amount }, undefined, '1')
    } catch (err) {
      console.log(err)
    }
  }

  const formatUnits = (amount: number) => {
    return (amount / Math.pow(10, 18)).toLocaleString('en-US')
  }

  return (
    <div>
      <Box display='flex' justifyContent='space-between' alignItems='center' gap={10} marginBottom={5}>
        <Button
          disabled={balance.debio <= 0}
          sx={{ visibility: isLoggedIn ? 'visible' : 'hidden' }}
          onClick={() => onBurn()}
          color='error'
          variant='contained'
        >
          Burn
        </Button>
        <Button onClick={() => onHandleConnection()} color='primary' variant='outlined'>
          {isLoggedIn ? 'Disconnect' : 'Connect'}
        </Button>
      </Box>

      {isLoggedIn && (
        <Box display='flex' justifyContent='space-between' marginBottom={5}>
          <Chip label={`${formatUnits(balance.debio)} TOKEN`} color='primary' />
          <Chip label={`${formatUnits(balance.session)} SESSION`} color='success' />
        </Box>
      )}

      <Grid container>
        <Grid item xs={12}>
          <Typography variant='h5' className='header-message'>
            Experimental Chat
          </Typography>
        </Grid>
      </Grid>
      <Grid container component={Paper}>
        <Grid item xs={12}>
          <List>
            {chat.map((c, i) => (
              <ListItem key={i}>
                <Grid container>
                  <Grid item xs={12}>
                    <ListItemText primary={c.msg}></ListItemText>
                  </Grid>
                  <Grid item xs={12}>
                    <ListItemText secondary={c.from + ' at ' + c.time}></ListItemText>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Grid container style={{ padding: '20px' }}>
            <Grid item xs={11}>
              <TextField
                id='outlined-basic-email'
                InputProps={{
                  disableUnderline: true
                }}
                onChange={handleChange}
                value={message}
                label='Type Something'
                fullWidth
              />
            </Grid>
            <Grid item xs={1}>
              <Fab color='primary' onClick={() => addMessage('ME', message)} aria-label='add'>
                <IoMdSend />
              </Fab>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}
