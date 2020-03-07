import React from 'react';
import './ServerError.css';


const ServerError=(props)=>{
  return(
    <div className="ServerError">
        <h1>{props.location.warning}</h1>
    </div>
  )
}


export default ServerError;