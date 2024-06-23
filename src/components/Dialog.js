import Modal from 'react-bootstrap/Modal';

import { ReactComponent as WhiteKing } from '../assets/lichess/wK.svg';
import { ReactComponent as BlackKing } from '../assets/lichess/bK.svg';
import { ReactComponent as WhiteBlackKing } from '../assets/lichess/wbK.svg';

function Dialog(props) {

  return (
    <>
      <Modal
        show={props.showDialog}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          <Modal.Title>{props.dialogTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{props.dialogText}</p>
          <div style={{display: "flex", justifyContent: "center"}}>
            <div className="dialogSquare">
              <BlackKing onClick={props.handleClickBlack}/>
            </div>
            <div className="dialogSquare">
              <WhiteBlackKing onClick={props.handleClickRandom}/>
            </div>
            <div className="dialogSquare">
              <WhiteKing onClick={props.handleClickWhite}/>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Dialog;