import React from 'react';
import ioClient from 'socket.io-client';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';
import './App.css';

//import router components
import HomePage from './components/HomePage';
import RoomList from './components/RoomList';
import ChatRoom from './components/ChatRoom';
import CreateRoom from './components/CreateRoom';
import ServerError from './components/ServerError';

class App extends React.Component{
  constructor(props){
    super(props);
    this.state={
      socket:ioClient("http://localhost:9000")
    }
  }

  render(){
    return(
      <Router>
        <div className="App">
          <Switch>
            <Route path='/ChatRoom' render={(props)=><ChatRoom {...props} socket={this.state.socket} />}/>
            <Route path='/RoomList' component={RoomList}/>
            <Route path='/CreateRoom' component={CreateRoom}/>
            <Route path='/ServerError' component={ServerError}/>
            <Route path='/' component={HomePage}/>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
