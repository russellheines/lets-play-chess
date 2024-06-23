import { ReactComponent as BlackRook } from '../assets/cburnett/rdt45.svg';
import { ReactComponent as BlackKnight } from '../assets/cburnett/ndt45.svg';
import { ReactComponent as BlackBishop } from '../assets/cburnett/bdt45.svg';
import { ReactComponent as BlackQueen } from '../assets/cburnett/qdt45.svg';
import { ReactComponent as BlackKing } from '../assets/cburnett/kdt45.svg';
import { ReactComponent as BlackPawn } from '../assets/cburnett/pdt45.svg';
import { ReactComponent as WhiteRook } from '../assets/cburnett/rlt45.svg';
import { ReactComponent as WhiteKnight } from '../assets/cburnett/nlt45.svg';
import { ReactComponent as WhiteBishop } from '../assets/cburnett/blt45.svg';
import { ReactComponent as WhiteQueen } from '../assets/cburnett/qlt45.svg';
import { ReactComponent as WhiteKing } from '../assets/cburnett/klt45.svg';
import { ReactComponent as WhitePawn } from '../assets/cburnett/plt45.svg';

function Square(props) {

    const styles = ["square"];
    styles.push(props.shade);
    
    if (props.selected) {
        styles.push("selected");
    }

    if (props.lastFrom) {
        styles.push("lastFrom");
    }

    if (props.lastTo) {
        styles.push("lastTo");
    }

    if ((props.inCheck === 0) && (props.piece === 'K')) {
        styles.push("check");
    }
    else if ((props.inCheck === 1) && (props.piece === 'k')) {
        styles.push("check");
    }

    const rank = 8 - props.row;
    const file = String.fromCharCode(97 + props.col);  // 97 = 'a'

    return (
        <div className = {styles.join(" ")} onClick = {props.handleClickSquare}>
            {props.piece !== null && props.piece === 'r' && <BlackRook/>}
            {props.piece !== null && props.piece === 'n' && <BlackKnight/>}
            {props.piece !== null && props.piece === 'b' && <BlackBishop/>}
            {props.piece !== null && props.piece === 'q' && <BlackQueen/>}
            {props.piece !== null && props.piece === 'k' && <BlackKing/>}
            {props.piece !== null && props.piece === 'p' && <BlackPawn/>}
            {props.piece !== null && props.piece === 'R' && <WhiteRook/>}
            {props.piece !== null && props.piece === 'N' && <WhiteKnight/>}
            {props.piece !== null && props.piece === 'B' && <WhiteBishop/>}
            {props.piece !== null && props.piece === 'Q' && <WhiteQueen/>}
            {props.piece !== null && props.piece === 'K' && <WhiteKing/>}
            {props.piece !== null && props.piece === 'P' && <WhitePawn/>}
            {props.orientation === 0 && props.col === 7 && <div className="rank">{rank}</div>}
            {props.orientation === 1 && props.col === 0 && <div className="rank">{rank}</div>}
            {props.orientation === 0 && props.row === 7 && <div className="file">{file}</div>}
            {props.orientation === 1 && props.row === 0 && <div className="file">{file}</div>}
         </div>
    );
}

export default Square