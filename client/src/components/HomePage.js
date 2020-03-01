import React from 'react';
import {Link} from 'react-router-dom';
import './HomePage.css';


class HomePage extends React.Component{
  constructor(props){
    super(props);
    this.state={
    }
  }

  render(){
    return(
      <div>
        <h1>Welcome</h1>
        <Link to="/RoomList"><p>Join a chat room</p></Link>
        <Link to="/CreateRoom"><p>Create a chat room</p></Link>
      </div>
    )
  }
}

export default HomePage;