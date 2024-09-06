import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography
} from '@mui/material'
import { useChat } from '@/src/contexts/ChatContext'

import SendIcon from '@mui/icons-material/Send'
import { useNearWallet } from '@/src/contexts/NearContext'
import { Fragment, useState } from 'react'
import { useAsset } from '@/src/contexts/AssetContext'

export const Chat = () => {
  const { signedAccountId } = useNearWallet()
  const { file, addFile, uploadFile, isUploading, isUploaded } = useAsset()
  const { model, message, chats, loading, onChangeMessage, onChangeModel, onSendMessage, onUploadMessage } = useChat()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const open = Boolean(anchorEl)

  const handleModel = (mod: string) => {
    onChangeModel(mod)
    setAnchorEl(null)
  }

  return (
    <Box
      sx={{ backgroundColor: 'whitesmoke', marginX: 'auto' }}
      textAlign='center'
      padding={2}
      borderRadius={2}
      marginTop={2}
      width={700}
    >
      <Grid container>
        <Box sx={{ marginX: 'auto', width: '100%' }} marginBottom={2}>
          <Typography variant='h6' color='GrayText'>
            Experimental Chat
          </Typography>
          <Box display='flex' justifyContent='space-between' sx={{ width: '100%', marginBottom: 1 }}>
            <Button
              variant='outlined'
              color='success'
              sx={{ width: '120px' }}
              disableRipple={isUploaded || isUploading}
              onClick={file ? () => uploadFile(file, link => onUploadMessage(link)) : addFile}
            >
              {isUploaded ? (
                'Uploaded'
              ) : file ? (
                isUploading ? (
                  <CircularProgress size={15} color='inherit' />
                ) : (
                  'Upload'
                )
              ) : (
                'Add File'
              )}
            </Button>

            <Box width={90}>
              <Button
                fullWidth
                variant='contained'
                color='warning'
                onClick={event => setAnchorEl(event.currentTarget)}
                disabled={!signedAccountId}
              >
                {model}
              </Button>
              <Menu
                id='basic-menu'
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center'
                }}
              >
                <MenuItem onClick={() => handleModel('Llama3')}>Llama3</MenuItem>
                <MenuItem onClick={() => handleModel('OpenAI')}>OpenAI</MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <List>
            {chats.map((c, i) => (
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
          <Box sx={{ padding: '20px' }} display='flex' justifyContent='space-between' alignItems='center'>
            <TextField
              id='outlined-basic-email'
              InputProps={{
                disableUnderline: true
              }}
              size='small'
              onChange={event => onChangeMessage(event.target.value)}
              value={message ? message : ''}
              label='Type Something'
              sx={{ width: '90%' }}
              disabled={loading}
            />
            <IconButton
              onClick={() => onSendMessage('ME', message)}
              disabled={loading || !signedAccountId}
              sx={{ backgroundColor: '#eff1f1', padding: 2 }}
            >
              {loading ? <CircularProgress size={20} /> : <SendIcon color='info' fontSize='small' />}
            </IconButton>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
