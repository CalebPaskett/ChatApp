import { useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './auth_context';

export const useMessages = (chatRoom) => {
	//useStates here
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [authToken] = useContext(AuthContext);
  const messagesRef = useRef([]);

	useEffect(() => {
    if (chatRoom) { //if there is a chatroom
      const socket = io({
        auth: {token: authToken },
        query: { chatRoomId: chatRoom.id },
      })
      
      setSocket(socket);

      socket.on('message', (message) => {
        messagesRef.current.push(message); //Adds new message to messagesRef
        setMessages([...messagesRef.current]);
      });
      
      return () => {
        socket.off('message');
        socket.disconnect();
      };
    }
    return () => {};
  },[chatRoom]); //runs when chatroom changes
	
	const sendMessage = (contents, user) => {
		socket.emit('message', {
			contents,
			userName: '${user.firstName} ${user.lastName}',
		});
		//send: message type, object that represents message type
	}
	
	return [messages, sendMessage];
}

