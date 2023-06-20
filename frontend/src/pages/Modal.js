import React, { useEffect } from 'react';

import { ReactComponent as WhiteKing } from '../images/lichess/wK.svg';
import { ReactComponent as BlackKing } from '../images/lichess/bK.svg';
import { ReactComponent as WhiteBlackKing } from '../images/lichess/wbK.svg';

import { Modal } from 'bootstrap';

function MyModal(props) {

	useEffect(() => {
		var myModal = new Modal(document.getElementById("exampleModal"));
		if (props.chooseSide === true || props.youWon === true|| props.youLost === true) {
			myModal.show();
		}
	}, [props.chooseSide, props.youWon, props.youLost]);

	const title = props.chooseSide === true ? "Let's play!" : props.youWon === true ? "You won!" : "You lost!";

	return (
		<>
			<div className="modal" id="exampleModal" tabIndex="-1">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">{title}</h5>
							<button type="button" className="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div className="modal-body">
							<p>Choose a side to play again:</p>
							<div className="modalSquares">
								<div className="modalSquare">
									<BlackKing onClick={props.handlePlayAsBlack} data-bs-dismiss="modal"/>
								</div>
								<div className="modalSquare">
									<WhiteBlackKing onClick={props.handlePlayAsRandom} data-bs-dismiss="modal"/>
								</div>
								<div className="modalSquare">
									<WhiteKing onClick={props.handlePlayAsWhite} data-bs-dismiss="modal"/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>		
		</>
	);
}

export default MyModal;