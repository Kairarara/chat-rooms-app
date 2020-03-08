import React from 'react';
import {Redirect} from 'react-router-dom';
import InputIcon from './InputIcon.js';
import './ChatRoom.css';
import TextareaAutosize from 'react-textarea-autosize';

class ChatRoom extends React.Component{
  constructor(props){
    super(props);


    this.state={
      room:this.props.location.room,
      username:"Anon",
      newMessage:"",
      chatHistory:[],
      redirect:false,
      loading:true,
      warning:"",
      chatError:null
    }
    
    this.endOfChat = React.createRef();
  }

  componentDidMount=()=>{

    const socket=this.props.socket;
    console.log(this.props)

    socket.emit('startRoom',{
      room:this.props.location.room,
      password:this.props.location.password
    })

    socket.on('history',(data)=>{
      this.setState({
        loading:false,
        chatHistory:data.history
      },()=>{this.scrollToChatEnd("auto")});
    })

    socket.on('chat',(data)=>{
      this.setState({
        chatHistory:[...this.state.chatHistory, data],
        newMessage:"",
        chatError:null
      });
    })

    socket.on("failedAccess",(data)=>{
      this.setState({redirect:"/RoomList", warning:data.message});
    })

    socket.on("failedConnection",(data)=>{
      this.setState({redirect:"/ServerError", warning:data.message});
    })

    socket.on("emptyBucket",()=>{
      this.setState({chatError:"Spam detected, try again in a while"},
      ()=>{this.scrollToChatEnd()})
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
    const socket=this.props.socket;
    socket.emit('chat',{
      username:this.state.username,
      message:this.state.newMessage
    },()=>{
      this.scrollToChatEnd();
    })
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

  scrollToChatEnd=(behaviour="smooth")=>{
    this.endOfChat.current.scrollIntoView({behavior:behaviour})
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

    let chatError;
    if(this.state.chatError!==null){
      chatError=<li className="ChatError">{this.state.chatError}</li>
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
          {chatError}
          <span ref={this.endOfChat}/>
        </ul>
        <div className="msgContainer">
          <TextareaAutosize className="message" value={this.state.newMessage} onKeyDown={(e)=>{if(e.keyCode===13) {e.preventDefault(); this.submit()}}} onChange={this.handleMessage} minLength="1" maxLength="255"/>
          <button onClick={(e)=>{e.preventDefault(); this.submit()}}><InputIcon/></button>
        </div>
      </div>
    )
  }
}

export default ChatRoom;