import React from 'react';
import ioClient from 'socket.io-client';
import {Redirect} from 'react-router-dom';
import InputIcon from './InputIcon.js';
import './ChatRoom.css';
import TextareaAutosize from 'react-textarea-autosize';

class ChatRoom extends React.Component{
  constructor(props){
    super(props);


    this.state={
      socket:-1,
      room:this.props.location.room,
      username:"Anon",
      newMessage:"",
      chatHistory:[{username:"a",message:"b"}],
      redirect:false,
      loading:true,
      warning:""
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

    socket.on('history',(data)=>{
      this.setState({
        loading:false,
        chatHistory:data.history
      });
    })

    socket.on('chat',(data)=>{
      this.setState({
        chatHistory:[...this.state.chatHistory, data],
        newMessage:""
      });
    })

    socket.on("failedAccess",(data)=>{
      this.setState({redirect:"/RoomList", warning:data.message});
    })

    socket.on("failedConnection",(data)=>{
      this.setState({redirect:"/ServerError", warning:data.message});
    })
  }

  handleLoading=()=>{
    if(this.state.loading)
      return <div className="Loading"/>
  }

  handleRedirect=()=>{
    if(this.state.redirect!==false)
      return <Redirect to={{pathname:this.state.redirect, warning:this.state.warning, room:this.state.room}}/>
  }

  submit=()=>{
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
  
  handleHeightChange=(e)=>{
    console.log(e)
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
        <header>
          <h2>Writing in {this.state.room} as</h2>
          <TextareaAutosize className="username" value={this.state.username} onKeyDown={(e)=>{if(e.keyCode===13) e.preventDefault()}} onChange={this.handleUsername} maxLength="20"/>
        </header>
        <ul>
          {chat?chat:"Loading"}
        </ul>
        <div className="msgContainer">
          <TextareaAutosize className="message" value={this.state.newMessage} onKeyDown={(e)=>{if(e.keyCode===13) this.submit()}} onChange={this.handleMessage} minLength="1" maxLength="255"/>
          <button onClick={(e)=>{e.preventDefault(); this.submit()}}><InputIcon/></button>
        </div>
      </div>
    )
  }
}

export default ChatRoom;