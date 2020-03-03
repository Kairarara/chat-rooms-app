import React from 'react';
import axios from 'axios';
import {Redirect} from 'react-router-dom';
import './CreateRoom.css';

class CreateRoom extends React.Component{
  constructor(props){
    super(props);
    this.state={
      roomName:"",
      password:"",
      redirect:false
    }
  }


  handleSubmit=(event)=>{
    event.preventDefault();
    axios.post("http://localhost:9000/CreateRoom",{roomName:this.state.roomName, password: this.state.password})
      .then((res)=>{
        if(res.data===true){
          this.setState({redirect:true})
        }
      })
  }

  renderRedirect=()=>{
    if(this.state.redirect)
      return <Redirect to={{pathname:`/ChatRoom`, room:this.state.roomName, password:this.state.password}}/>
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
      <div className="CreateRoom">
        {this.renderRedirect()}
        <form onSubmit={this.handleSubmit} autoComplete="off">
          <input type="text" name="name" value={this.state.roomName} onChange={this.handleNameFieldChange} placeholder="Room Name" minLength="4" maxLength="20" required/>
          <input type="password" name="password" value={this.state.password} onChange={this.handlePasswordFieldChange} maxLength="20" placeholder="Password"/>
          <input type="submit" value="Create Room"/>
        </form>
      </div>
    )
  }
}

export default CreateRoom;