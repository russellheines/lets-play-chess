import React, { useEffect } from 'react'

import { useMediaQuery } from 'react-responsive'

import FirstPageIcon from '@mui/icons-material/FirstPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LastPageIcon from '@mui/icons-material/LastPage';

window.addEventListener("resize", scrollIntoView);

function scrollIntoView() {

	let currentList = document.getElementsByClassName("current");
	if (currentList.length > 0) {
		for (let current of currentList) {
			current.scrollIntoView();
		}
		return;
	}

    if (document.getElementsByClassName("historyMoveNumber")[0]) {
        document.getElementsByClassName("historyMoveNumber")[0].scrollIntoView();
    }
}

function History(props) {

    const time = props.state.time;
    const moves = props.state.moves;

	const isPortrait = useMediaQuery({ query: '(orientation: portrait)' })

    useEffect(() => {
        scrollIntoView();
    });

    const hasPreviousMove = time !== -1 && time !== 0; 
    const hasNextMove = time !== -1 && time !== moves.length;

    const firstStyle = hasPreviousMove ? "historyBtn" : "historyBtn disabled";
    const previousStyle = firstStyle;
    const nextStyle = hasNextMove ? "historyBtn" : "historyBtn disabled";
    const lastStyle = nextStyle

    const first = hasPreviousMove ? () => props.dispatch({type: "first"}) : null;
    const previous = hasPreviousMove ? () => props.dispatch({type: "previous"}) : null;
    const next = hasNextMove ? () => props.dispatch({type: "next"}) : null;
    const last = hasNextMove ? () => props.dispatch({type: "last"}) : null;

    const items = [];

    let key = 0;
    for (let i = 0; i < moves.length / 2; i++) {

        const indexWhite = i * 2;
        const indexBlack = i * 2 + 1;

        const styleWhite = indexWhite !== time-1 ? "historyMove" : "historyMove current";
        const styleBlack = indexBlack !== time-1 ? "historyMove" : "historyMove current";

        const sanWhite = moves[indexWhite].replaceAll('-',String.fromCharCode(8209));  // non-breaking hyphen
        const sanBlack = indexBlack < moves.length ? moves[indexBlack].replaceAll('-',String.fromCharCode(8209)) : null;

        items.push(
            <div key={key++} className="d-flex">
                <div className="historyMoveNumber">{i+1}</div>
                <div className={styleWhite} onClick={() => props.dispatch({type: "index", index: indexWhite})}>{sanWhite}</div>
                {indexBlack < moves.length &&
                    <div className={styleBlack} onClick={() => props.dispatch({type: "index", index: indexBlack})}>{sanBlack}</div>
                }                
            </div>
        );
    }

    if (isPortrait) {
        return (
             <div className="d-flex">
                <div className={firstStyle} onClick={first}><FirstPageIcon/></div>
                <div className={previousStyle} onClick={previous}><NavigateBeforeIcon/></div>
                <div className="historyMoves flex-grow-1 box-shadow-inset" style={{overflowX: "hidden"}}>
                    <div className="d-flex">
                        {items}
                    </div>
                </div>
                <div className={nextStyle} onClick={next}><NavigateNextIcon/></div>
               <div className={lastStyle} onClick={last}><LastPageIcon/></div> 
            </div>
        )
    }
    else {
        return (
    	    <div>
                <div className="historyBtns">
                    <div className={firstStyle} onClick={first}><FirstPageIcon/></div>
                    <div className={previousStyle} onClick={previous}><NavigateBeforeIcon/></div>
                    <div className={nextStyle} onClick={next}><NavigateNextIcon/></div>
               	    <div className={lastStyle} onClick={last}><LastPageIcon/></div>                    
                </div>
       	        <div className="historyMoves flex-grow-1" style={{overflowY: "auto"}}>
                    <div className="d-flex flex-column">
                        {items}
                    </div>
                </div>
            </div>
        )
    };
}

export default History