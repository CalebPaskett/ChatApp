import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMessages } from '../../utils/use_messages';
import { ApiContext } from '../../utils/api_context';

export const ChatRoom = () => {
  const [chatRoom, setChatRoom] = useState(null);
  const [messages, sendMessage] = useMessages(chatRoom);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const api = useContext(ApiContext);
  const { id } = useParams();

  useEffect(async () => {
    setLoading(true);

    if (!user) {
	    const { user } = await api.get('/users/me');
	    setUser(user);
    }

	  const { chatRoom } = await api.get('/chat_rooms/' + id);
	  setChatRoom(chatRoom);



	  setLoading(false);
  }, [id]); //runs when id changes

  if (loading) {
    return <div>Loading, please wait</div>;
  }

  return (
    <>
      <div className="chat-window">
        {[...messages].reverse().map((message) => (
          <div key={Math.random()}> 
            <h3 className="chat-author">{message.userName}</h3>
            <span className="chat-message">{message.contents}</span>
          </div> //can replace with component
        ))}
      </div>
      <div className="chat-bar">
        <input className ="message-input" type='text' value={content} onChange={(e) => setContent(e.target.value)} />
        <button onClick={(e) => {
          sendMessage(content, user);
          e.stopPropagation();
          setContent("");
        }} className="button">Send</button>
      </div>
    </>
  );

};