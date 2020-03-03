import React from 'react';
import ioClient from 'socket.io-client';
import {Redirect} from 'react-router-dom';
import InputIcon from './InputIcon.js';
import './ChatRoom.css';

class ChatRoom extends React.Component{
  constructor(props){
    super(props);


    this.state={
      socket:-1,
      room:this.props.location.room,
      username:"Anon",
      newMessage:"",
      chatHistory:[{username:"a",message:"b"}],
      redirect:"loading"
    }
    

  }

  componentDidMount=()=>{
    const socket=ioClient("http://localhost:9000");

    this.setState({
      socket:socket
    })

    socket.emit('startRoom',{
      room:this.props.location.room,
      password:this.props.location.password
    })

    socket.on("failedAccess",()=>{
      this.setState({redirect:true});
    })

    socket.on('history',(data)=>{
      this.setState({
        redirect:false,
        chatHistory:data.history
      });
    })

    socket.on('chat',(data)=>{
      this.setState({
        chatHistory:[...this.state.chatHistory, data],
        newMessage:""
      });
    })

  }

  componentWillUnmount=()=>{
    const socket=this.state.socket;
    socket.emit("leaveRoom");
  }

  handleLoading=()=>{
    if(this.state.redirect==="loading")
      return <div className="Loading"/>
  }

  handleRedirect=()=>{
    if(this.state.redirect===true)
      return <Redirect to={{pathname:`/RoomList`, warning:"Incorrect password.", room:this.state.room}}/>
  }

  handleClick=(e)=>{
    e.preventDefault();
    const socket=this.state.socket;
    socket.emit('chat',{
      username:this.state.username,
      message:this.state.newMessage
    });
  }

  handleUsername=(e)=>{
    this.setState({
      username:e.target.value
    })
  }

  handleMessage=(e)=>{
    this.setState({
      newMessage:e.target.value
    })
  }
  
  render(){
    let chat;
    if(this.state.chatHistory){
      chat=this.state.chatHistory.map(ele => {
        return(
          <li><p>{ele.username + ": " + ele.message}</p></li>
        )
      });
    }

    return(
      <div className="ChatRoom">
        {this.handleLoading()}
        {this.handleRedirect()}
        <ul>
          {chat?chat:"Loading"}
        </ul>
        <form>
          <input className="username" type="text" value={this.state.username} onChange={this.handleUsername}/>
          <input className="message" type="text" value={this.state.newMessage} onChange={this.handleMessage}/>
          <button onClick={this.handleClick}><InputIcon/></button>
        </form>
      </div>
    )
  }
}

export default ChatRoom;