import React from 'react';
import ioClient from 'socket.io-client';
import {Redirect} from 'react-router-dom';
import './ChatRoom.css';

class ChatRoom extends React.Component{
  constructor(props){
    super(props);

    const socket=ioClient("http://localhost:9000")

    this.state={
      socket:socket,
      room:this.props.location.room,
      username:"Anon",
      newMessage:"",
      chatHistory:[],
      redirect:"loading"
    }

  }

  componentDidMount=()=>{
    const socket=this.state.socket;

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

  handleClick=()=>{
    const socket=this.state.socket;
    socket.emit('chat',{
      message:{
        username:this.state.username,
        message:this.state.newMessage
      }
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
          <li>{ele.username + " " + ele.message}</li>
        )
      });
    }

    console.log(this.state.redirect)

    return(
      <div className="ChatRoom">
        {this.handleLoading()}
        {this.handleRedirect()}
        <ul>
          {chat?chat:"Loading"}
        </ul>
        <form>
          <input type="text" value={this.state.username} onChange={this.handleUsername}/>
          <input type="text" value={this.state.newMessage} onChange={this.handleMessage}/>
          <input type="button" onClick={this.handleClick}/>
        </form>
      </div>
    )
  }
}

export default ChatRoom;