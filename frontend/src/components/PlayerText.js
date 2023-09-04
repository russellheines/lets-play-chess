import React from 'react'

function PlayerText(props) {

    return (
        <div className='playerText'><span className="dot"></span>{props.playerName}</div>
    );
}

export default PlayerText