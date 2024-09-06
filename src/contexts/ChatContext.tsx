import axios from 'axios'

import { createContext, FC, ReactNode, useContext, useState } from 'react'
import { useContract } from './ContractContext'
import { enqueueSnackbar } from 'notistack'
import { Box, Button, CircularProgress, LinearProgress, Typography } from '@mui/material'
import { OnUploadData, useAsset } from './AssetContext'

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'

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
  model: 'Llama3',
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
  from: string
  msg: ReactNode | string
  time: string
}

export const ChatProvider: FC<ChatProviderProps> = ({ children }) => {
  const { conversation, converse } = useContract()
  const { file, uploadFile } = useAsset()

  const [message, setMessage] = useState('')
  const [model, setModel] = useState('Llama3')
  const [isChatting, setIsChatting] = useState(false)
  const [chats, setChats] = useState<ChatType[]>([
    { from: 'AI', msg: "Hello! I'm Debbie, your personal genetic analyst.", time: '15:55' }
  ])

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
    const { isLoading, progress, file, link, init } = data

    setChats(prev => {
      const time = new Date().toLocaleTimeString().slice(0, 5)
      const response = {
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
            <Box padding={1}>
              <DescriptionOutlinedIcon fontSize='large' />
              <Typography fontSize={12}>{file.name}</Typography>
            </Box>
            {isLoading && progress <= 100 && (
              <Box marginX={2} sx={{ width: '100%' }}>
                <LinearProgress variant='determinate' sx={{ height: 10, borderRadius: 5 }} value={progress} />
              </Box>
            )}
            {!isLoading && link && progress >= 100 && (
              <Box paddingRight={2} sx={{ width: '100%' }} display='flex' justifyContent='flex-end'>
                <Button variant='contained' href={link} target='_blank' color='success'>
                  Open
                </Button>
              </Box>
            )}
            {init && (
              <Box paddingRight={2} sx={{ width: '100%' }} display='flex' justifyContent='flex-end'>
                <Button
                  variant='contained'
                  onClick={() => file && uploadFile(file, data => addUploadResponse(data))}
                  color='success'
                >
                  Upload
                </Button>
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
