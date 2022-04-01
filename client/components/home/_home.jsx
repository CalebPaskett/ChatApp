import { useContext, useEffect, useState } from 'react';
import { ApiContext } from '../../utils/api_context';
import { AuthContext } from '../../utils/auth_context';
import { Button } from '../common/button';

export const Home = () => {
  const [, setAuthToken] = useContext(AuthContext);
  const api = useContext(ApiContext);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(async () => {
    setLoading(true);

    const res = await api.get('/users/me');
    setUser(res.user);

    const { chatRooms } = await api.get('chat_rooms')
    setChatRooms(chatRooms);

    setLoading(false);
  }, []);

  const logout = async () => {
    const res = await api.del('/sessions');
    if (res.success) {
      setAuthToken(null);
    }
  };

  const createRoom = async () => {
    const { chatRoom } = await api.post('/chatrooms', { roomId } ); //figure out room ids
    setChatRooms([...chatRooms, chatRoom])
  }

  if (loading) {
    return <div>Loading, please wait</div>;
  }

  return (
    <div>
      <Button type="button" onClick={logout}>
        Logout
      </Button>
    </div>
  );
};
