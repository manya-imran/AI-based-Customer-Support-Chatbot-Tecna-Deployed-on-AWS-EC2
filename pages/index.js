

'use client'
import { useState } from 'react'
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {TextField, Button} from '@mui/material';

export default function Home() {
    // State to store messages as an array of objects
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: `Hi, I'm Tecna from AIM-Tech, how can I assist you?`
    }]);

    // State to store the user's message
    const [message, setMessage] = useState('');

    //send to backend and get a response
  //   const sendMessage = async () => {
  //     setMessage('');
  //     setMessages((messages) => [
  //         ...messages,
  //         { role: 'user', content: message },
  //         { role: 'assistant', content: '' },
  //     ]);
  
  //     try {
  //         // Await the fetch call to ensure the response is properly handled
  //         const response = await fetch('/api/chat', {
  //             method: "POST",
  //             headers: {
  //                 'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify([...messages, { role: 'user', content: message }]),
  //         });
  
  //         const reader = response.body.getReader();
  //         const decoder = new TextDecoder();
  
  //         let result = '';
  //         const processText = async ({ done, value }) => {
  //             if (done) {
  //                 return result;
  //             }
  
  //             // Decode the text
  //             const text = decoder.decode(value || new Int8Array(), { stream: true });
  //             setMessages((messages) => {
  //                 let lastMessage = messages[messages.length - 1];
  //                 let otherMessages = messages.slice(0, messages.length - 1);
  //                 return [
  //                     ...otherMessages,
  //                     {
  //                         ...lastMessage,
  //                         content: lastMessage.content + text,
  //                     },
  //                 ];
  //             });
  
  //             // Continue reading the stream
  //             const { done: doneNext, value: valueNext } = await reader.read();
  //             return processText({ done: doneNext, value: valueNext });
  //         };
  
  //         await reader.read().then(processText);
  //     } catch (error) {
  //         console.error('Error sending message:', error);
  //     }
  // };
  
    const sendMessage = async() => {
      setMessage('')
      setMessages((messages) =>[
        ...messages,
        {role: 'user', content: message},
        {role: 'assistant', content: ''},
      ])
      //HTTP post request
      const response = await fetch('/api/chat', {
        method: "POST",
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify([...messages, {role: 'user', content: message}]),
      }).then(async(res)=> {
        //decode the response
        //console.log(JSON.stringify([...messages, {role: 'user', content: message}]))
        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        let result = ''
        return reader.read().then(function processText({done,value}){
          if(done){
            // keep calling process result function until its done then return result
            return result
          }
          //Decode the text if no text then create a new int array and decode it it empty 
          // console.log(result)
          const text = decoder.decode(value || new Int8Array(), {stream:true})
          setMessages((messages) => {
            let lastMessage = messages[messages.length -1]
            let otherMessages = messages.slice(0, messages.length -1)
            // console.log([
            //   ...otherMessages,
            //   {
            //     ...lastMessage,
            //     content: lastMessage.content + text,
            //   },
            // ])
            return[
              ...otherMessages,
              {
                ...lastMessage,
                content: lastMessage.content + text,
              },
            ]
          })
          return reader.read().then(processText)
        })
      })
    }
    return (
        <Box 
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            bgcolor="white"
        >
            <Stack
                direction="column"
                width="600px"
                height="700px"
                border="1px solid black"
                p={2}
                spacing={3}
            >
                <Stack
                    direction="column"
                    spacing={2}
                    flexGrow={1}
                    overflow="auto"
                    maxHeight="100%"
                >
                    {messages.map((message, index) => (
                        <Box key={index} display='flex' justifyContent={
                            message.role === 'assistant' ? 'flex-start' : 'flex-end'
                        }>
                            <Box bgcolor={
                                message.role === 'assistant' ? 'primary.main' : 'secondary.main'
                            }
                            color="white"
                            borderRadius={16}
                            p={3}>
                                {message.content}
                            </Box>
                        </Box>
                    ))}
                </Stack>
                <Stack direction="row" spacing={2}>
                    <TextField
                    label="message"
                    fullWidth
                    value={message}
                    onChange={(e)=> setMessage(e.target.value)}
                    />
                    <Button variant="contained" onClick={sendMessage}>Send</Button>
                </Stack>
            </Stack>
        </Box>
    );
}
