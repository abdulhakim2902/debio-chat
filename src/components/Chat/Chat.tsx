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
import { Avatar, Button, Card, Chip, Container } from '@mui/material'
import { useSearchParams, useRouter } from 'next/navigation'

const BurnContract = process.env.NEXT_PUBLIC_BURN_CONTRACT ?? 'dbio-burn1.testnet'
const TokenContract = process.env.NEXT_PUBLIC_TOKEN_CONTRACT ?? 'debio-token3.testnet'
const BaseURL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

type ChatProps = {
  isMobile?: boolean
};

export const Chat : React.FC<ChatProps> = props => {
  const {isMobile } = props;
  console.log(isMobile)
  const searchParams = useSearchParams()
  const router = useRouter()

  const transactionHashes = searchParams?.get('transactionHashes')
  const amount = searchParams?.get('amount')
  const errorCode = searchParams?.get('errorCode')
  const errorMessage = searchParams?.get('errorMessage')

  const { signedAccountId, wallet, onChangeSignedAccountId } = useNear()

  const [chat, setChat] = useState([{ from: 'AI', msg: 'Hello, this is a trial chat ai', time: '15:55' }])
  const [message, setMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [balance, setBalance] = useState({
    near: 0,
    debio: 0,
    session: 0
  })

  const [model, setModel] = useState('Llama3')

  useEffect(() => {
    setIsLoggedIn(!!signedAccountId)
    console.log(signedAccountId)
  }, [signedAccountId])

  useEffect(() => {
    if (wallet) {
      // Success transaction
      if (transactionHashes) {
        console.log(amount)
        console.log(transactionHashes)
      }

      // Failed transaction
      if (errorCode || errorMessage) {
        console.log(errorCode, errorMessage)
      }

      router.replace(BaseURL, undefined)
    }
    /* eslint-disable */
  }, [wallet, transactionHashes, amount, errorCode, errorMessage])

  useEffect(() => {
    if (!isLoggedIn || !wallet || !signedAccountId) return console.log('You are not connected')

    const getBalance = async () => {
      try {
        const [account, debioBalance] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/token?userId=${signedAccountId}`),
          wallet.viewMethod<string>(TokenContract, 'ft_balance_of', { account_id: signedAccountId })
        ])
        console.log("acount is",account?.data?.response)

        setBalance(prev => ({ ...prev, session: account?.data?.response.tokens || 0, debio: Number(debioBalance) }))
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
    if (model === 'Llama3') {
      return addResponseLLama3(msg)
    } else if (model === 'OpenAI') {
      return addResponseOpenAI(msg)
    } else {
      throw new Error('Model Error')
    }
  }

  const addResponseLLama3 = async (msg: string) => {
    if (balance.session > 0 && isLoggedIn) {
      const answer = await axios.post('https://x.myriadchain.com/llm/api/generate', {
        model: 'llama3',
        prompt: msg,
        stream: false
      })
      const time = new Date().toLocaleTimeString().slice(0, 5)
      console.log("Answer is", answer)

      const response = { from: 'AI', msg: answer.data.response, time }

      setBalance(prev => ({ ...prev, session: prev.session - 1 }))

      return response
    }

    const time = new Date().toLocaleTimeString().slice(0, 5)
    const forbidden = "You don't have session"
    const response = { from: 'AI', msg: forbidden, time }

    return response
  }

  const addResponseOpenAI = async (msg: string) => {
    if (balance.session > 0 && isLoggedIn) {
      const answer = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`, {
        msg: msg
      })
      const time = new Date().toLocaleTimeString().slice(0, 5)

      const response = { from: 'AI', msg: answer.data.response, time }

      setBalance(prev => ({ ...prev, session: prev.session - 1 }))

      return response
    }

    const time = new Date().toLocaleTimeString().slice(0, 5)
    const forbidden = "You don't have session"
    const response = { from: 'AI', msg: forbidden, time }

    return response
  }

  const onHandleConnection = () => {
    if (!wallet) return console.log('Wallet not initialized')
    return isLoggedIn ? wallet.signOut(onChangeSignedAccountId) : wallet.signIn()
  }

  const onChangeModel = () => {
    if (model === 'Llama3') {
      setModel('OpenAI')
    } else {
      setModel('Llama3')
    }
  }

  const onBurn = async () => {
    if (!wallet) return console.log('Wallet not initialized')

    try {
      const amount = '1' // 1 DBIO
      const parseAmount = parseUnits(Number(amount))
      const callbackUrl = `${BaseURL}?amount=${parseAmount}`
      await wallet.callMethod(
        BurnContract,
        'burn',
        { token_id: TokenContract, amount: parseAmount },
        undefined,
        '1',
        callbackUrl
      )
    } catch (err) {
      console.log(err)
    }
  }

  const formatUnits = (amount: number) => {
    return (amount / Math.pow(10, 18)).toLocaleString('en-US')
  }

  const parseUnits = (amount: string | number): string => {
    return (BigInt(amount) * BigInt(Math.pow(10, 18))).toString()
  }

  return (
    <div>
    {isMobile && (
      <Container sx={{bgcolor: 'pink', height: 60, position:'fixed', top:0, left:0}} maxWidth={'md'}>
        <Typography sx={{position:'fixed',top:13,right:17}}>Balance: $DBIO {balance.debio} </Typography>
        <Avatar alt='debio' src='public/debio-logo.svg' sx={{position:'fixed', height:40, width:40, left:10, top:10}}></Avatar>
        <TextField
                id='outlined-basic-email'
                InputProps={{
                  disableUnderline: true
                }}
                onChange={handleChange}
                value={message}
                label='Type Something'
                fullWidth
                sx={{position:'fixed',left:13,bottom: 21}}
              />
        
      </Container>
    )}
    {!isMobile && (
      <>
      <Box display='flex' justifyContent='space-between' alignItems='center' gap={10} marginBottom={5}>
        <Button
          disabled={balance.debio <= 0}
          sx={{ visibility: isLoggedIn ? 'visible' : 'hidden' }}
          onClick={() => onBurn()}
          color='error'
          variant='contained'
        >
          Burn 1 DBIO
        </Button>
        <Button onClick={() => onHandleConnection()} color='primary' variant='outlined'>
          {isLoggedIn ? 'Disconnect' : 'Connect'}
        </Button>
        <Button onClick={() => onChangeModel()} color='error' variant='contained'>
          Change Model
        </Button>
      </Box>

      {isLoggedIn && (
        <Box display='flex' justifyContent='space-between' marginBottom={5}>
          <Chip label={`${formatUnits(balance.debio)} DBIO`} color='primary' />
          <Chip label={`${balance.session} SESSION`} color='success' />
        </Box>
      )}
      <Grid container>
        <Grid item xs={12}>
          <Typography variant='h5' className='header-message'>
            Experimental Chat
          </Typography>
          <Typography variant='h5' className='header-message'>
            Model : {model}
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
      </>
      )}

      
    </div>
  )
}
