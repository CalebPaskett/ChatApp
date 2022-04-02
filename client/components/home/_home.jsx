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

  //used for calculating distances... from stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
  function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

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

      const hereMarker = new mapboxgl.Marker({color: "#000000",})
        .setLngLat([location.coords.longitude, location.coords.latitude])
        .addTo(map);

      //Mark chatrooms within 3 km
      for (room of chatRooms) {
        if (getDistanceFromLatLonInKm(room.lat, room.long, location.coords.latitude, location.coords.longitude) < 3) {
          new mapboxgl.Marker()
          .setLngLat([room.long, room.lat])
          .addTo(map)
          .getElement().addEventListener('click', () => {
            window.location.href = `chat_rooms/${room.id}`;
          });
          console.log(room.id)
        }
      }
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
