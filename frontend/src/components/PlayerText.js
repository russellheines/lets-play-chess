import React from 'react'

function PlayerText(props) {

    return (
        <div className='playerText' style={props.visibility === false ? {visibility: 'hidden'} : {}}>{props.text}</div>
    );
}

export default PlayerText