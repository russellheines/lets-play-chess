import React from 'react'

import FlipBoardIcon from '@mui/icons-material/Cached';
import NewGameIcon from '@mui/icons-material/Add';
import AnalysisIcon from '@mui/icons-material/Biotech';

function Controls(props) {

    return (
        <div className='row'>
            <div className='col'></div>
            <div className='col-6'>
                <div className="d-flex justify-content-between">
                    <div className="historyBtn" onClick={() => props.dispatch({type: "orientation"})}><FlipBoardIcon/></div>
                    <div className="historyBtn" onClick={props.handleNewGame}><NewGameIcon/></div>
                    <div className="historyBtn"><AnalysisIcon/></div>
                </div>
            </div>
            <div className='col'></div>
        </div>
    )
}

export default Controls