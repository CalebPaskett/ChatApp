import { useContext, useEffect, useState } from 'react';
import { useMessages } from '../../utils/use_messages';
import { ApiContext } from '../../utils/api_context';
import { Button } from '../common/button';

export const ChatRoom = () => {
  const [chatRoom, setChatRoom] = useState(null);
  const [messages, sendMessage] = useMessages(chatRoom);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [api] = useContext(ApiContext);
  const { id } = useParams();

  useEffect(async () => {
    setLoading(true);

    if (!user) {
	    const { user } = await api.get('/users/me');
	    setUser(user);
    }

	  const { chatRoom } = await api.get('/chat_rooms/${id}');
	  setChatRoom(chatRoom);

	  setLoading(false);
  }, [id]); //runs when id changes

  if (loading) {
    return <div>Loading, please wait</div>;
  }

  return (
    <>
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <h3>{message.userName}</h3>
            {message.contents}
          </div> //can replace with component
        ))}
      </div>
      <div>
        <input type='text' value={content} onChange={(e) => setContent(e.target)} />
        <Button onClick={sendMessage}>Send</Button>
      </div>
	  </>
  );

};