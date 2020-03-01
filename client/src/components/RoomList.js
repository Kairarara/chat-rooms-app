import React from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import InputIcon from './InputIcon.js';
import './RoomList.css';

class RoomList extends React.Component{
  constructor(props){
    super(props);
    this.state={
      rooms:[],
      filter:"",
      password:"",
      warning:this.props.location.warning || "",
      badRoom:this.props.location.room || "",
      redirect:false
    }
  }

  componentDidMount=()=>{
    axios.get('http://localhost:9000/RoomList')
      .then((res)=>{
        console.log(res)
        this.setState({rooms : res.data || []});
      })
  }

  handleRedirect=()=>{
    if(this.state.redirect!==false) return <Redirect to={{pathname:`/ChatRoom`, room:this.state.redirect, password:this.state.password}}/>
  }

  handleFilter=(e)=>{
    this.setState({filter:e.target.value})
  }

  enterRoom=(room, password)=>{
    this.setState({redirect:room, password:password})
  }

  render(){


    const rooms=this.state.rooms
      .filter( room => room.name.toLowerCase().includes(this.state.filter.toLowerCase()) )
      .map( room => <ListedRoom key={room.name} room={room.name} socket={this.props.socket} enterRoom={this.enterRoom} 
                                warning={(this.state.badRoom===room.name)?this.state.warning:false}/> );
    

    return(
      <div className="RoomList">
        {this.handleRedirect()}
        <input type="text" name="filter" className="filter" onChange={this.handleFilter} value={this.state.filter} placeholder="Search Rooms"/>
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
      expanded:(this.props.warning!==false)
    }
  }


  handlePasswordChange=(e)=>{
    this.setState({
      password:e.target.value
    })
  }

  expand=()=>{
    this.setState({
      expanded: !this.state.expanded
    })
  }

  render(){
    let style={height:"150px"};

    style["marginTop"]=(this.state.expanded)?"0px":("-"+style.height);
    return(
      <li key={this.props.room} className="Room">
        <h2 onClick={this.expand}>{this.props.room}</h2>
        <div className="expanded" style={style}>
          <div className="password">
            <input type="password" onChange={this.handlePasswordChange} value={this.state.password} maxLength="20" placeholder="Password"/>
            <button onClick={()=>this.props.enterRoom(this.props.room, this.state.password)}><InputIcon/></button>
          </div>
          <p style={{color:"red"}}>{this.props.warning}</p>
        </div>
      </li>
    )
  }
}

export default RoomList;