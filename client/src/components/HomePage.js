import React from 'react';
import {Link} from 'react-router-dom';
import './HomePage.css';


const HomePage=()=>{
  return(
    <div className="HomePage">
      <h2>Welcome to</h2>
      <h1>myChatRooms</h1>
      <Link to="/RoomList"><p>Join a chat room</p></Link>
      <Link to="/CreateRoom"><p>Create a chat room</p></Link>
    </div>
  )
}


export default HomePage;