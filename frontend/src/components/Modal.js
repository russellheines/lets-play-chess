import React, { useEffect } from 'react';

import { Modal } from 'bootstrap';

import { ReactComponent as WhiteKing } from '../images/lichess/wK.svg';
import { ReactComponent as BlackKing } from '../images/lichess/bK.svg';
import { ReactComponent as WhiteBlackKing } from '../images/lichess/wbK.svg';

/**
 * Based on examples from https://getbootstrap.com/docs/5.3/components/modal/.
 * 
 * NOTE: handleDismissModal() is used to clear state variables if the user clicks outside of the modal
 */
function LetsPlayModal(props) {

	useEffect(() => {
		const letsPlayModalEl = document.getElementById('letsPlayModal');
		const letsPlayModal = new Modal(letsPlayModalEl);
		if (props.chooseSide || props.youWon || props.youLost) {
			letsPlayModal.show();
			letsPlayModalEl.addEventListener('hidden.bs.modal', event => {
				props.handleDismissModal();
			});
		}
	}, [props]);

	const title = props.chooseSide === true ? "Let's play!" : props.youWon === true ? "You won!" : "You lost!";

	return (
		<>
			<div className="modal fade" id="letsPlayModal" tabIndex="-1">
				<div className="modal-dialog modal-dialog-centered">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-5">{title}</h1>
							<button type="button" className="btn-close" data-bs-dismiss="modal"></button>
						</div>
						<div className="modal-body">
							<p>Choose a side:</p>
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

export default LetsPlayModal;