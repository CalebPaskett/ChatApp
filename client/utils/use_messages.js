import { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../../utils/auth_context';
import { io } from 'socket.io-client';

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

