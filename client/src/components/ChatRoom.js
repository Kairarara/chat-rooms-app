import React from 'react';
import ioClient from 'socket.io-client';
import {Redirect} from 'react-router-dom';
import './ChatRoom.css';

class ChatRoom extends React.Component{
  constructor(props){
    super(props);
    this.state={
      socket:-1,
      room:this.props.location.room,
      username:"Anon",
      newMessage:"",
      chatHistory:[],
      redirect:false
    }
  }

  componentDidMount=()=>{
    const socket=ioClient("http://localhost:9000");

    this.setState({
      socket:socket
    })

    socket.emit('startRoom',{
      room:this.state.room,
      password:this.props.location.password
    })

    socket.on("failedAccess",()=>{
      this.setState({
        redirect:true
      });
    })


    socket.on('history',(data)=>{
      this.setState({
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

  renderRedirect=()=>{
    if(this.state.redirect)
      return <Redirect to="/"/>
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
    let chat=""
    if(this.state.chatHistory){
      chat=this.state.chatHistory.map(ele => {
        return(
          <li>{ele.username + " " + ele.message}</li>
        )
      });
    }

    return(
      <div>
        {this.renderRedirect()}
        <ul>
          {chat}
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