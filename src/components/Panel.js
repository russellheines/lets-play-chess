import { useEffect } from 'react';

import FirstPageIcon from '@mui/icons-material/FirstPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LastPageIcon from '@mui/icons-material/LastPage';

window.addEventListener("resize", scrollIntoView);

function scrollIntoView() {
    if (document.getElementsByClassName("current")[0]) {
        document.getElementsByClassName("current")[0].scrollIntoView();
    }
    else if (document.getElementsByClassName("moveNumber")[0]) {
        document.getElementsByClassName("moveNumber")[0].scrollIntoView();
    }
}

function Panel(props) {

    useEffect(() => {
        scrollIntoView();
    });

    const firstStyle = props.time > 0 ? "historyButton" : "historyButton disabled";
    const previousStyle = props.time > 0 ? "historyButton" : "historyButton disabled";
    const nextStyle = props.time < props.history.length ? "historyButton" : "historyButton disabled";
    const lastStyle = props.time < props.history.length ? "historyButton" : "historyButton disabled";

    const items = [];
    for (let i = 0; i < props.history.length; i++) {
        if (i % 2 === 0) {
            const key = "moveNumber" + i / 2 + 1;
            items.push(<div key = {key} className="moveNumber">{i / 2 + 1}</div>);    
        }
        const styles = ["move"];
        if (i === props.time-1) {
            styles.push("current");
        }
        const san = props.history[i].replaceAll('-',String.fromCharCode(8209));  // non-breaking hyphen
        items.push(<div key = {i} className={styles.join(" ")} onClick={() => props.handleClickIndex(i+1)}>{san}</div>);
    }

    return (
        <div className="panel box-shadow">
            <div className="historyButtonsTop box-shadow">
                <div className={firstStyle} onClick={props.handleClickFirst}><FirstPageIcon/></div>
                <div className={previousStyle} onClick={props.handleClickPrevious}><NavigateBeforeIcon/></div>
                <div className={nextStyle} onClick={props.handleClickNext}><NavigateNextIcon/></div>
               	<div className={lastStyle} onClick={props.handleClickLast}><LastPageIcon/></div>                    
            </div>
            <div style={{display: "flex", overflowY: "auto"}}>
                <div className="historyButtonsLeft">
                    <div className={firstStyle} onClick={props.handleClickFirst}><FirstPageIcon/></div>
                    <div className={previousStyle} onClick={props.handleClickPrevious}><NavigateBeforeIcon/></div>
                </div>
                    <div className="history box-shadow-inset">
                    {items}
                    </div>
                <div className="historyButtonsRight">
                    <div className={nextStyle} onClick={props.handleClickNext}><NavigateNextIcon/></div>
                   	<div className={lastStyle} onClick={props.handleClickLast}><LastPageIcon/></div>
                </div>
            </div>
        </div>
    );
}

export default Panel