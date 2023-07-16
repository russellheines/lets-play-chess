import React from 'react'

import LoopIcon from '@mui/icons-material/Loop';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

function Controls(props) {

    return (
        <div className="historyBtns">
            <div className="historyBtn" onClick={() => props.dispatch({type: "orientation"})}><LoopIcon/></div>
            <div className="historyBtn" onClick={props.handleNewGame}><AddIcon/></div>
            <div className="historyBtn"><MoreHorizIcon/></div>
        </div>
    )
}

export default Controls