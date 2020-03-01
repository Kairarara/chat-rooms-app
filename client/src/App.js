import React from 'react';
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


/*
  TO DO style all pages
*/

class App extends React.Component{
  render(){
    return(
      <Router>
        <Switch>
          <Route path='/ChatRoom' component={ChatRoom}/>
          <Route path='/RoomList' component={RoomList}/>
          <Route path='/CreateRoom' component={CreateRoom}/>
          <Route path='/' component={HomePage}/>
        </Switch>
      </Router>
    );
  }
}

export default App;
