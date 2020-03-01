import React from 'react';
import axios from 'axios';
import {Redirect} from 'react-router-dom';
import './CreateRoom.css';
let a=1;

class CreateRoom extends React.Component{
  constructor(props){
    super(props);
    this.state={
      roomName:"",
      password:"",
      redirect:false,
      warning:""
    }
  }


  handleSubmit=()=>{
    axios.post("http://localhost:9000/CreateRoom",{roomName:this.state.roomName, password: this.state.password})
      .then((res)=>{
        if(res.data===true){
          this.setState({redirect:true})
        } else {
          this.setState({warning:<label>Room name {res.data}</label>})
        }
      })
  }

  renderRedirect=()=>{
    if(this.state.redirect)
      return <Redirect to={{pathname:"/RoomList"}}/>
  }

  handleNameFieldChange=(e)=>{
    this.setState({
      roomName:e.target.value
    })
  }

  handlePasswordFieldChange=(e)=>{
    this.setState({
      password:e.target.value
    })
  }

  render(){

    return(
      <div>
        {this.renderRedirect()}
        <form>
          <label htmlFor="name">Room Name</label>
          <input type="text" name="name" value={this.state.roomName} onChange={this.handleNameFieldChange} required/>
          {this.state.warning}
          <label htmlFor="password">Password</label>
          <input type="text" name="password" value={this.state.password} onChange={this.handlePasswordFieldChange}/>
          <input type="button" value="Create Room" onClick={this.handleSubmit}/>
        </form>
      </div>
    )
  }
}

export default CreateRoom;