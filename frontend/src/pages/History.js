import React, {useEffect} from 'react'

import FirstPageIcon from '@mui/icons-material/FirstPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LastPageIcon from '@mui/icons-material/LastPage';

import LoopIcon from '@mui/icons-material/Loop';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

window.addEventListener("resize", scrollIntoView);

function scrollIntoView() {

    // https://stackoverflow.com/questions/56688002/javascript-scrollintoview-only-in-immediate-parent
		
	let currentList = document.getElementsByClassName("current");
	if (currentList.length > 0) {
		for (let current of currentList) {
			current.scrollIntoView({block: "nearest", inline: "nearest"});
		}
		return;
	}

    let historyList = document.getElementsByClassName("history");
    for (let history of historyList) {
	    if ((history) && (history.getElementsByClassName("historyMoveNumber")[0])) {
	    	history.getElementsByClassName("historyMoveNumber")[0].scrollIntoView({block: "nearest", inline: "nearest"});
	    }
 	}
}

function History(props) {

    useEffect(() => {
        scrollIntoView();
    });

    const firstStyle = props.time !== 0 ? "historyBtn" : "historyBtn disabled";
    const previousStyle = firstStyle;

    const nextStyle = props.time !== props.moves.length ? "historyBtn" : "historyBtn disabled";
    const lastStyle = nextStyle

    const first = props.time !== 0 ? props.handleFirst : null;
    const previous = props.time !== 0 ? props.handlePrevious : null;

    const next = props.time !== props.moves.length  ? props.handleNext : null;
    const last = props.time !== props.moves.length  ? props.handleLast : null;

    const items = [];

    let key = 0;
    for (let i = 0; i < props.moves.length / 2; i++) {

        const indexWhite = i * 2;
        const indexBlack = i * 2 + 1;

        const styleWhite = indexWhite !== props.time-1 ? "historyMove" : "historyMove current";
        const styleBlack = indexBlack !== props.time-1 ? "historyMove" : "historyMove current";

        const sanWhite = props.moves[indexWhite].replaceAll('-',String.fromCharCode(8209));  // non-breaking hyphen
        const sanBlack = indexBlack < props.moves.length ?
            props.moves[indexBlack].replaceAll('-',String.fromCharCode(8209)) :
            null;

        items.push(
            <div key={key++} className="historyMoveContainer">
                <div className="historyMoveNumber">{i+1}</div>
                <div className={styleWhite} onClick={() => props.handleClickMove(indexWhite)}>{sanWhite}</div>
                {indexBlack < props.moves.length &&
                    <div className={styleBlack} onClick={() => props.handleClickMove(indexBlack)}>{sanBlack}</div>
                }                
            </div>
        );
    }

    return (
        <>
        	<div className="history portrait">
                <div className={firstStyle} onClick={first}><FirstPageIcon/></div>
                <div className={previousStyle} onClick={previous}><NavigateBeforeIcon/></div>
                <div className="historyMoves portrait">
                    {items}
                </div>
               	<div className={nextStyle} onClick={next}><NavigateNextIcon/></div>
               	<div className={lastStyle} onClick={last}><LastPageIcon/></div>                    
            </div>
    	    <div className="history landscape">
                <div className="historyBtns">
                    <div className={firstStyle} onClick={first}><FirstPageIcon/></div>
                    <div className={previousStyle} onClick={previous}><NavigateBeforeIcon/></div>
               	    <div className={nextStyle} onClick={next}><NavigateNextIcon/></div>
           	        <div className={lastStyle} onClick={last}><LastPageIcon/></div>                    
                </div>
           	    <div className="historyMoves landscape">
                    {items}
                </div>
                <div className="historyBtns">
                    <div className="historyBtn" onClick={props.handleChangeOrientation}><LoopIcon/></div>
                    <div className="historyBtn" onClick={props.handleNewGame}><AddIcon/></div>
                    <div className="historyBtn"><MoreHorizIcon/></div>
                </div>
            </div>
        </>
    );
}

export default History