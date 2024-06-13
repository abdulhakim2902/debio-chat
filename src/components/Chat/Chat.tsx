import React from 'react';
import { useState } from 'react';
import { makeStyles } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Fab from '@mui/material/Fab';
import { IoMdSend } from "react-icons/io";
import axios from 'axios';
import { Stream } from 'stream';
import { Near } from '../Near/Near';

export const Chat = () => {
  const [message, setMessage] = useState('');
  //let message = '';
  const [chat, setChat] = useState([
      { from: 'AI', msg: 'Hello, this is a trial chat ai', time: "15:55" }

  ])
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(event.target.value);
  }
  const addMessage = async (from : string, msg : string) => {
      if (msg.trim() === '') return
      // get the current time hh:mm
      const time = new Date().toLocaleTimeString().slice(0, 5)
      setChat([...chat, { from, msg, time }])
      setMessage('')
      const resp = await addResponse(msg)
      setChat([...chat, { from, msg, time }, resp])
  }

  const addResponse = async (msg: string) => {

    const answer = await axios.post("https://x.myriadchain.com/llm/api/generate", {model:"llama3", prompt:msg, stream:false})
    const time = new Date().toLocaleTimeString().slice(0, 5)
    console.log(answer.data.response)

    const response = { from: 'AI', msg: answer.data.response, time }
    return response

  }
  return (
      <div>
          <Near/>
          <Grid container>
              <Grid item xs={12} >
                  <Typography variant="h5" className="header-message">Experimental Chat</Typography>
              </Grid>
          </Grid>
          <Grid container component={Paper}>

              <Grid item xs={12}>
                  <List>
                      {chat.map((c, i) =>

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
                      )}

                  </List>
                  <Divider />
                  <Grid container style={{ padding: '20px' }}>
                      <Grid item xs={11}>
                          <TextField id="outlined-basic-email" InputProps={{
                              disableUnderline: true,
                          }} onChange={handleChange} value={message} label="Type Something" fullWidth />
                      </Grid>
                      <Grid item xs={1}>
                          <Fab color="primary" onClick={() => addMessage('ME', message)} aria-label="add"><IoMdSend /></Fab>
                      </Grid>
                  </Grid>
              </Grid>
          </Grid>
      </div>
  );
}