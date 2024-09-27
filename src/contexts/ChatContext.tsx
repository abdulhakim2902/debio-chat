import axios from 'axios'

import { createContext, FC, Fragment, ReactNode, useContext, useEffect, useState } from 'react'
import { useContract } from './ContractContext'
import { enqueueSnackbar } from 'notistack'
import { Box, Button, CircularProgress, LinearProgress, Typography } from '@mui/material'
import { OnUploadData, useAsset } from './AssetContext'

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import { AppConfig } from '../config'

export type ChatContextValue = {
  loading: boolean
  message: string
  model: string
  chats: ChatType[]

  onChangeMessage: (value: string) => void
  onChangeModel: (model?: string) => void
  onSendMessage: (from: string, msg: string) => void
  onUploadMessage: (data: OnUploadData) => void
}

export const ChatContext = createContext<ChatContextValue>({
  loading: false,
  message: '',
  model: 'OpenAI',
  chats: [],

  onChangeMessage: () => {},
  onChangeModel: () => {},
  onSendMessage: () => {},
  onUploadMessage: () => {}
})

type ChatProviderProps = {
  children: ReactNode
}

type ChatType = {
  key?: string
  from: string
  msg: ReactNode | string
  time: string
}

export const ChatProvider: FC<ChatProviderProps> = ({ children }) => {
  const { conversation, converse } = useContract()
  const { assets, uploadFile, removeFile } = useAsset()

  const [message, setMessage] = useState('')
  const [model, setModel] = useState('Llama3')
  const [isChatting, setIsChatting] = useState(false)
  const [chats, setChats] = useState<ChatType[]>([
    { from: 'AI', msg: "Hi, I'm Debbie, your wellness assistant. How can I help you?", time: '15:55' }
  ])

  useEffect(() => {
    const time = new Date().toLocaleTimeString().slice(0, 5)

    setChats(prev => {
      const chats = assets.map(asset => {
        const filename = asset.filename
        const link = `https://${AppConfig.STORAGE_CANISTER_ID}.${AppConfig.STORAGE_HOST}${asset.key}`

        let size = asset.size
        let unit = 'bytes'
        if (size > 1_000_000) {
          size = size / 1_000_000
          unit = 'MB'
        } else if (size > 1_000) {
          size = size / 1_000
          unit = 'KB'
        }

        return {
          key: asset.key,
          from: 'ME',
          msg: (
            <Box
              display='flex'
              justifyContent='space-between'
              alignContent='center'
              alignItems='center'
              padding={1}
              borderRadius={2}
              boxShadow={2}
            >
              <Box padding={1} display='flex' flexDirection='row' alignContent='center' alignItems='center'>
                <DescriptionOutlinedIcon fontSize='large' />
                <Box>
                  <Typography fontSize={12} sx={{ width: '250px' }}>
                    {filename}
                  </Typography>
                  <Typography fontSize={10}>
                    {size} {unit}
                  </Typography>
                </Box>
              </Box>

              <Box paddingRight={2} sx={{ width: '100%' }} display='flex' justifyContent='flex-end'>
                <Button
                  variant='outlined'
                  color='error'
                  onClick={() => {
                    removeFile(asset.key, () => {
                      setChats(prev => prev.filter(chat => chat.key !== asset.key))
                    })
                  }}
                >
                  Remove
                </Button>
                <Button sx={{ marginLeft: 2 }} variant='contained' href={link} target='_blank' color='success'>
                  Open
                </Button>
              </Box>
            </Box>
          ),
          time
        }
      })

      return [...prev, ...chats]
    })
    /* eslint-disable */
  }, [assets])

  const onChangeModel = (mod?: string) => {
    if (mod) {
      setModel(mod)
    } else {
      if (model === 'Llama3') {
        setModel('OpenAI')
      } else {
        setModel('Llama3')
      }
    }
  }

  const addResponse = async (msg: string) => {
    if (model === 'Llama3') {
      addResponseLLama3(msg)
    } else if (model === 'OpenAI') {
      addResponseOpenAI(msg)
    } else {
      throw new Error('Model Error')
    }
  }

  const addResponseLLama3 = async (msg: string) => {
    const time = new Date().toLocaleTimeString().slice(0, 5)
    const loadingRespons = { from: 'AI', msg: <CircularProgress size={15} />, time }
    setIsChatting(true)
    setChats(prev => [...prev, loadingRespons])

    if (conversation.balance <= 0) {
      const time = new Date().toLocaleTimeString().slice(0, 5)
      const forbidden = "You don't have session"
      const response = { from: 'AI', msg: forbidden, time }

      setChats(prev => [...prev.slice(0, prev.length - 1), response])
      setIsChatting(false)
      return
    }

    try {
      const answer = await axios.post('https://x.myriadchain.com/llm/api/generate', {
        model: 'mendel',
        prompt: msg,
        stream: false
      })

      const time = new Date().toLocaleTimeString().slice(0, 5)
      const response = { from: 'AI', msg: answer.data.response, time }

      converse('1', err => {
        if (err) {
          setChats(prev => [...prev.slice(0, prev.length - 1)])
          return
        }

        setChats(prev => [...prev.slice(0, prev.length - 1), response])
      })
    } catch (err: any) {
      setChats(prev => [...prev.slice(0, prev.length - 1)])
      enqueueSnackbar(err?.message || err, { variant: 'error' })
    } finally {
      setIsChatting(false)
    }
  }

  const addResponseOpenAI = async (msg: string) => {
    const time = new Date().toLocaleTimeString().slice(0, 5)
    const loadingRespons = { from: 'AI', msg: <CircularProgress size={15} />, time }
    setIsChatting(true)
    setChats(prev => [...prev, loadingRespons])

    if (conversation.balance <= 0) {
      const time = new Date().toLocaleTimeString().slice(0, 5)
      const forbidden = "You don't have session"
      const response = { from: 'AI', msg: forbidden, time }

      setChats(prev => [...prev.slice(0, prev.length - 1), response])
      setIsChatting(false)
      return
    }

    try {
      const answer = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/chat`, {
        msg: msg
      })

      const time = new Date().toLocaleTimeString().slice(0, 5)
      const response = { from: 'AI', msg: answer.data.response, time }

      converse('1', err => {
        if (err) {
          setChats(prev => [...prev.slice(0, prev.length - 1)])
          setIsChatting(false)
          return
        }

        setChats(prev => [...prev.slice(0, prev.length - 1), response])
        setIsChatting(false)
      })
    } catch (err: any) {
      setChats(prev => [...prev.slice(0, prev.length - 1)])
      enqueueSnackbar(err?.message || err, { variant: 'error' })
    }
  }

  const addMessage = async (from: string, msg: string) => {
    if (msg.trim() === '') return
    // get the current time hh:mm
    const time = new Date().toLocaleTimeString().slice(0, 5)
    setChats(prev => [...prev, { from, msg, time }])
    setMessage('')
    addResponse(msg)
  }

  const addUploadResponse = async (data: OnUploadData) => {
    const { isLoading, progress, file, link, init, key = '' } = data

    let size = file.size
    let unit = 'bytes'
    if (size > 1_000_000) {
      size = size / 1_000_000
      unit = 'MB'
    } else if (size > 1_000) {
      size = size / 1_000
      unit = 'KB'
    }

    setChats(prev => {
      const time = new Date().toLocaleTimeString().slice(0, 5)
      const response = {
        key: key,
        from: 'ME',
        msg: (
          <Box padding={1} borderRadius={2} boxShadow={2}>
            <Box display='flex' justifyContent='space-between' alignContent='center' alignItems='center'>
              <Box padding={1} display='flex' flexDirection='row' alignContent='center' alignItems='center'>
                <DescriptionOutlinedIcon fontSize='large' />
                <Box>
                  <Typography fontSize={12} sx={{ width: '300px' }}>
                    {file.name}
                  </Typography>
                  <Typography fontSize={10}>
                    {size} {unit}
                  </Typography>
                </Box>
              </Box>
              {!isLoading && link && progress >= 100 && (
                <Box paddingRight={2} sx={{ width: '100%' }} display='flex' justifyContent='flex-end'>
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => {
                      removeFile(key, () => {
                        setChats(prev => prev.filter(chat => chat.key !== key))
                      })
                    }}
                  >
                    Remove
                  </Button>
                  <Button sx={{ marginLeft: 2 }} variant='contained' href={link} target='_blank' color='success'>
                    Open
                  </Button>
                </Box>
              )}
              {init && (
                <Box paddingRight={2} sx={{ width: '100%' }} display='flex' justifyContent='flex-end'>
                  <Button
                    variant='outlined'
                    color='error'
                    onClick={() => {
                      setChats(prev => prev.filter(chat => chat.key !== key))
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    sx={{ marginLeft: 2 }}
                    variant='contained'
                    onClick={() => file && uploadFile(file, data => addUploadResponse(data))}
                    color='success'
                  >
                    Upload
                  </Button>
                </Box>
              )}
            </Box>
            {isLoading && progress <= 100 && (
              <Box sx={{ width: '100%' }} padding={2}>
                <LinearProgress variant='determinate' sx={{ height: 10, borderRadius: 5 }} value={progress} />
              </Box>
            )}
          </Box>
        ),
        time
      }

      if (init) {
        return [...prev, response]
      }

      prev[prev.length - 1] = response

      return [...prev]
    })
  }

  return (
    <ChatContext.Provider
      value={{
        message,
        model,
        loading: isChatting,
        chats,
        onChangeMessage: setMessage,
        onChangeModel,
        onSendMessage: addMessage,
        onUploadMessage: addUploadResponse
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)
