import React from 'react';
import {Link, Redirect} from 'react-router-dom';
import axios from 'axios';
import './RoomList.css';

class RoomList extends React.Component{
  constructor(props){
    super(props);
    this.state={
      rooms:[],
      filter:"",
      password:""
    }
  }

  componentDidMount=()=>{

    axios.get('http://localhost:9000/RoomList')
      .then((res)=>{
        this.setState({rooms : res.data.rooms});
      })
    
  }

  handleFilter=(e)=>{
    this.setState({filter:e.target.value})
  }

  render(){

    const rooms=this.state.rooms
      .filter( room => room.toLowerCase().includes(this.state.filter.toLowerCase()) )
      .map( room => <ListedRoom key={room} room={room} socket={this.props.socket}/> )

    return(
      <div>
        <label htmlFor="filter">Filter</label>
        <input type="text" name="filter" onChange={this.handleFilter} value={this.state.filter}/>
        <ul>
          {rooms}
        </ul>
      </div>
    )
  }
}

class ListedRoom extends React.Component{
  constructor(props){
    super(props);
    this.state={
      password:"",
      redirect:false
    }
  }

  handleRedirect=()=>{
    if(this.state.redirect) return <Redirect to={{pathname:`/ChatRoom`, room:this.props.room, password:this.state.password}}/>
  }

  handleClick=()=>{
    this.setState({redirect:true})
  }

  handlePasswordChange=(e)=>{
    this.setState({
      password:e.target.value
    })
  }

  render(){
    let room=this.props.room;

    return(
      <li key={room}>
        {this.handleRedirect()}
        <p>{room}</p>
        <input type="text" onChange={this.handlePasswordChange} value={this.state.password}/>
        <input type="button" onClick={this.handleClick}/>
      </li>
    )
  }
}

export default RoomList;