import React from 'react';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
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
        this.setState({rooms : res.data.rooms});
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
      .filter( room => room.toLowerCase().includes(this.state.filter.toLowerCase()) )
      .map( room => <ListedRoom key={room} room={room} socket={this.props.socket} enterRoom={this.enterRoom} 
                                warning={(this.state.badRoom===room)?this.state.warning:false}/> );
    
    if(this.props.location){

    }

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

    style["margin-top"]=(this.state.expanded)?"0px":("-"+style.height);
    return(
      <li key={this.props.room} className="Room">
        <h2 onClick={this.expand}>{this.props.room}</h2>
        <div className="expanded" style={style}>
          <div className="password">
            <input type="password" onChange={this.handlePasswordChange} value={this.state.password} maxLength="20" placeholder="Password"/>
            <button onClick={()=>this.props.enterRoom(this.props.room, this.state.password)}><LogInIcon/></button>
          </div>
          <p style={{color:"red"}}>{this.props.warning}</p>
        </div>
      </li>
    )
  }
}

const LogInIcon=()=>(
  <svg height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
    <title/>
    <g data-name="1" id="_1">
      <path d="M27,3V29a1,1,0,0,1-1,1H6a1,1,0,0,1-1-1V27H7v1H25V4H7V7H5V3A1,1,0,0,1,6,2H26A1,1,0,0,1,27,3ZM12.29,20.29l1.42,1.42,5-5a1,1,0,0,0,0-1.42l-5-5-1.42,1.42L15.59,15H5v2H15.59Z"/>
    </g>
  </svg>
)

export default RoomList;