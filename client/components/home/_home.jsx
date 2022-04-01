import { useContext, useEffect, useState } from 'react';
import { ApiContext } from '../../utils/api_context';
import { AuthContext } from '../../utils/auth_context';
import { Button } from '../common/button';
import mapboxgl from 'mapbox-gl';
import { ChatRoom } from '../chat_room/chat_room';
import { Link, Route, Routes } from 'react-router-dom';

mapboxgl.accessToken = 'pk.eyJ1IjoiY2FsZWJ1c3UiLCJhIjoiY2wxZnFndWFjMHhwcTNkcWk4dmhjMDRkaSJ9._0_p5G6jsbTMmbD96x5DWA';

export const Home = () => {
  const [, setAuthToken] = useContext(AuthContext);
  const api = useContext(ApiContext);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [errorMessage, setErrorMessage] = useState("")
  const [curLocation, setCurLocation] = useState(null);

  useEffect(async () => {
    setLoading(true);

    const res = await api.get('/users/me');
    setUser(res.user);

    const { chatRooms } = await api.get('/chat_rooms');
    setChatRooms(chatRooms);

    navigator.geolocation.getCurrentPosition((location) => { //will request permission here
      console.log(location);
      setCurLocation(location);
      const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [location.coords.longitude, location.coords.latitude], // starting position [lng, lat]
        zoom: 9 // starting zoom
      });
    }, (err) => {
      setErrorMessage(err.message);
    });

    setLoading(false);
  }, []);

  const logout = async () => {
    const res = await api.del('/sessions');
    if (res.success) {
      setAuthToken(null);
    }
  };

  const createRoom = async () => {
    let long = curLocation.coords.longitude;
    let lat = curLocation.coords.latitude;
    const { chatRoom } = await api.post('/chat_rooms', { lat, long });
    setChatRooms([...chatRooms, chatRoom]);
  }

  if (loading) {
    return <div>Loading, please wait</div>;
  }

  return (
    <div>
      <div className="top-bar">
        <Button type="button" onClick={createRoom}>Create ChatRoom,</Button>
        <div className="pt-2 pb-2 pr-4 pl-2 font-bold"> or pick a room to join from the map</div>
        <button className="log-out bg-gray-600 pt-2 pb-2 pr-4 pl-4 rounded-lg font-bold text-white" type="button" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="main-view">
        <div className="chat-window">
          <div>
            { errorMessage && 'You need to enable GPS' }
          </div>
          <div>
            <Routes>
              <Route path="chat_rooms/:id" element={<ChatRoom/>} />
              <Route path="/*" element={<div>Pick or create a room</div>} />
            </Routes>
          </div>
        </div>
        <div id="map"/>
      </div>
      
    </div>
  );
};
